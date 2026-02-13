import fs from "node:fs";
import crypto from "node:crypto";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const rootDir = path.resolve(".");
const dataDir = path.resolve(rootDir, "data");
const dbPath = path.resolve(dataDir, "trancas.sqlite");

const LOGIN_USER = "camila";
const LOGIN_PASSWORD = "028911";
const SESSION_COOKIE = "trancas_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

let database: any = null;
const sessions = new Map<string, number>();

function getDatabase(): any {
  if (database) {
    return database;
  }

  fs.mkdirSync(dataDir, { recursive: true });
  database = new DatabaseSync(dbPath);
  database.exec(`
    CREATE TABLE IF NOT EXISTS app_config (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      payload TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  return database;
}

function sendJson(
  res: {
    statusCode: number;
    setHeader: (name: string, value: string) => void;
    end: (chunk?: string) => void;
  },
  statusCode: number,
  payload: unknown,
): void {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(payload));
}

function parseCookies(cookieHeader?: string): Record<string, string> {
  if (!cookieHeader) {
    return {};
  }

  return cookieHeader
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((acc, pair) => {
      const separator = pair.indexOf("=");
      if (separator <= 0) {
        return acc;
      }
      const key = pair.slice(0, separator).trim();
      const value = pair.slice(separator + 1).trim();
      if (!key) {
        return acc;
      }
      acc[key] = decodeURIComponent(value);
      return acc;
    }, {});
}

function parseJsonBody(req: {
  on: (event: "data" | "end" | "error", listener: (...args: unknown[]) => void) => void;
}): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk: unknown) => {
      raw += String(chunk);
    });
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

function setSessionCookie(
  res: { setHeader: (name: string, value: string) => void },
  token: string,
): void {
  const cookieValue =
    `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_MAX_AGE_SECONDS}`;
  res.setHeader("Set-Cookie", cookieValue);
}

function clearSessionCookie(res: { setHeader: (name: string, value: string) => void }): void {
  res.setHeader(
    "Set-Cookie",
    `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
  );
}

function getSessionToken(req: { headers: { cookie?: string } }): string | null {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies[SESSION_COOKIE];
  if (!token) {
    return null;
  }

  const expiresAt = sessions.get(token);
  if (!expiresAt) {
    return null;
  }

  if (expiresAt < Date.now()) {
    sessions.delete(token);
    return null;
  }

  return token;
}

function createServerPlugin() {
  return {
    name: "trancas-auth-db",
    configureServer(server: {
      middlewares: {
        use: (handler: (req: any, res: any, next: () => void) => void | Promise<void>) => void;
      };
    }) {
      server.middlewares.use(async (req, res, next) => {
        const pathname = String(req.url || "/").split("?")[0];

        if (pathname === "/auth/session" && req.method === "GET") {
          const token = getSessionToken(req);
          sendJson(res, 200, {
            authenticated: Boolean(token),
            username: token ? LOGIN_USER : null,
          });
          return;
        }

        if (pathname === "/auth/login" && req.method === "POST") {
          try {
            const body = (await parseJsonBody(req)) as {
              username?: string;
              password?: string;
            };

            if (body.username !== LOGIN_USER || body.password !== LOGIN_PASSWORD) {
              sendJson(res, 401, { error: "Usuário ou senha inválidos." });
              return;
            }

            const token = crypto.randomUUID();
            sessions.set(token, Date.now() + SESSION_MAX_AGE_SECONDS * 1000);
            setSessionCookie(res, token);
            sendJson(res, 200, { ok: true, username: LOGIN_USER });
          } catch {
            sendJson(res, 400, { error: "Corpo da requisição inválido." });
          }
          return;
        }

        if (pathname === "/auth/logout" && req.method === "POST") {
          const token = getSessionToken(req);
          if (token) {
            sessions.delete(token);
          }
          clearSessionCookie(res);
          sendJson(res, 200, { ok: true });
          return;
        }

        if (pathname === "/config" && req.method === "GET") {
          const token = getSessionToken(req);
          if (!token) {
            clearSessionCookie(res);
            sendJson(res, 401, { error: "Não autenticado." });
            return;
          }

          const db = getDatabase();
          const row = db
            .prepare("SELECT payload, updated_at FROM app_config WHERE id = 1")
            .get() as { payload: string; updated_at: string } | undefined;

          if (!row) {
            sendJson(res, 200, { config: null, updatedAt: null });
            return;
          }

          sendJson(res, 200, {
            config: JSON.parse(row.payload),
            updatedAt: row.updated_at,
          });
          return;
        }

        if (pathname === "/config" && req.method === "PUT") {
          const token = getSessionToken(req);
          if (!token) {
            clearSessionCookie(res);
            sendJson(res, 401, { error: "Não autenticado." });
            return;
          }

          try {
            const body = (await parseJsonBody(req)) as { config?: unknown };
            if (!body.config || typeof body.config !== "object") {
              sendJson(res, 400, { error: "Payload inválido." });
              return;
            }

            const db = getDatabase();
            db.prepare(
              `
                INSERT INTO app_config (id, payload, updated_at)
                VALUES (1, ?, CURRENT_TIMESTAMP)
                ON CONFLICT(id) DO UPDATE SET
                  payload = excluded.payload,
                  updated_at = CURRENT_TIMESTAMP
              `,
            ).run(JSON.stringify(body.config));

            sendJson(res, 200, { ok: true });
          } catch {
            sendJson(res, 400, { error: "Corpo da requisição inválido." });
          }
          return;
        }

        next();
      });
    },
    configurePreviewServer(server: {
      middlewares: {
        use: (handler: (req: any, res: any, next: () => void) => void | Promise<void>) => void;
      };
    }) {
      this.configureServer(server);
    },
  };
}

export default defineConfig({
  plugins: [react(), createServerPlugin()],
});
