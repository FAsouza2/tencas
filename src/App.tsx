import React, { useEffect, useMemo, useState } from "react";

type BraidType =
  | "Nagô"
  | "Box braids"
  | "Gypsy braids"
  | "Boho braids"
  | "Knotless braids"
  | "French curls";

type LengthKey =
  | "Chanel/Ombro"
  | "Meio costas"
  | "Cintura/Quadril"
  | "Bumbum"
  | "Abaixo do bumbum";

type ThicknessKey = "M (padrão)" | "P" | "PP";

type ExtraKey =
  | "Desenho"
  | "Miçangas"
  | "Rabo"
  | "Blowout"
  | "Barrel (locs)"
  | "Taxa deslocamento";

type PricingMode = "Por tempo (hora)" | "Por tabela (menu)";
type ViewMode = "service" | "settings";
type AuthState = "checking" | "authenticated" | "unauthenticated";

type StyleConfig = {
  defaultComplexityMultiplier: number;
  defaultHoursByLength: Record<LengthKey, number>;
  defaultMaterialByLength: Record<LengthKey, number>;
  menuBaseByLength: Record<LengthKey, number>;
};

type AppConfig = {
  hourlyRate: number;
  marginPct: number;
  defaultDiscountPct: number;
  styleConfig: Record<BraidType, StyleConfig>;
  thicknessAddon: Record<ThicknessKey, number>;
  extras: Record<ExtraKey, number>;
};

type LengthFieldKey =
  | "defaultHoursByLength"
  | "defaultMaterialByLength"
  | "menuBaseByLength";

const BRAID_TYPES: BraidType[] = [
  "Nagô",
  "Box braids",
  "Gypsy braids",
  "Boho braids",
  "Knotless braids",
  "French curls",
];

const LENGTHS: LengthKey[] = [
  "Chanel/Ombro",
  "Meio costas",
  "Cintura/Quadril",
  "Bumbum",
  "Abaixo do bumbum",
];

const THICKNESSES: ThicknessKey[] = ["M (padrão)", "P", "PP"];
const EXTRA_KEYS: ExtraKey[] = [
  "Desenho",
  "Miçangas",
  "Rabo",
  "Blowout",
  "Barrel (locs)",
  "Taxa deslocamento",
];
const DISCOUNT_OPTIONS = [0, 5, 10, 15, 20, 25];

const DEFAULT_EXTRAS: Record<ExtraKey, number> = {
  Desenho: 30,
  Miçangas: 50,
  Rabo: 80,
  Blowout: 30,
  "Barrel (locs)": 200,
  "Taxa deslocamento": 0,
};

const DEFAULT_THICKNESS_ADDON: Record<ThicknessKey, number> = {
  "M (padrão)": 0,
  P: 90,
  PP: 175,
};

const DEFAULT_STYLE_CONFIG: Record<BraidType, StyleConfig> = {
  Nagô: {
    defaultComplexityMultiplier: 1.0,
    defaultHoursByLength: {
      "Chanel/Ombro": 1.5,
      "Meio costas": 2.0,
      "Cintura/Quadril": 2.5,
      Bumbum: 0,
      "Abaixo do bumbum": 0,
    },
    defaultMaterialByLength: {
      "Chanel/Ombro": 20,
      "Meio costas": 25,
      "Cintura/Quadril": 30,
      Bumbum: 0,
      "Abaixo do bumbum": 0,
    },
    menuBaseByLength: {
      "Chanel/Ombro": 130,
      "Meio costas": 0,
      "Cintura/Quadril": 0,
      Bumbum: 0,
      "Abaixo do bumbum": 0,
    },
  },
  "Box braids": {
    defaultComplexityMultiplier: 1.0,
    defaultHoursByLength: {
      "Chanel/Ombro": 4.5,
      "Meio costas": 5.5,
      "Cintura/Quadril": 6.5,
      Bumbum: 7.5,
      "Abaixo do bumbum": 8.0,
    },
    defaultMaterialByLength: {
      "Chanel/Ombro": 50,
      "Meio costas": 60,
      "Cintura/Quadril": 70,
      Bumbum: 80,
      "Abaixo do bumbum": 90,
    },
    menuBaseByLength: {
      "Chanel/Ombro": 330,
      "Meio costas": 350,
      "Cintura/Quadril": 370,
      Bumbum: 390,
      "Abaixo do bumbum": 415,
    },
  },
  "Knotless braids": {
    defaultComplexityMultiplier: 1.1,
    defaultHoursByLength: {
      "Chanel/Ombro": 5.0,
      "Meio costas": 6.0,
      "Cintura/Quadril": 7.0,
      Bumbum: 8.0,
      "Abaixo do bumbum": 8.5,
    },
    defaultMaterialByLength: {
      "Chanel/Ombro": 55,
      "Meio costas": 65,
      "Cintura/Quadril": 75,
      Bumbum: 85,
      "Abaixo do bumbum": 95,
    },
    menuBaseByLength: {
      "Chanel/Ombro": 330,
      "Meio costas": 350,
      "Cintura/Quadril": 370,
      Bumbum: 390,
      "Abaixo do bumbum": 415,
    },
  },
  "Gypsy braids": {
    defaultComplexityMultiplier: 1.25,
    defaultHoursByLength: {
      "Chanel/Ombro": 6.0,
      "Meio costas": 7.0,
      "Cintura/Quadril": 8.0,
      Bumbum: 9.0,
      "Abaixo do bumbum": 9.5,
    },
    defaultMaterialByLength: {
      "Chanel/Ombro": 80,
      "Meio costas": 90,
      "Cintura/Quadril": 100,
      Bumbum: 110,
      "Abaixo do bumbum": 120,
    },
    menuBaseByLength: {
      "Chanel/Ombro": 440,
      "Meio costas": 450,
      "Cintura/Quadril": 470,
      Bumbum: 495,
      "Abaixo do bumbum": 520,
    },
  },
  "Boho braids": {
    defaultComplexityMultiplier: 1.25,
    defaultHoursByLength: {
      "Chanel/Ombro": 6.0,
      "Meio costas": 7.0,
      "Cintura/Quadril": 8.0,
      Bumbum: 9.0,
      "Abaixo do bumbum": 9.5,
    },
    defaultMaterialByLength: {
      "Chanel/Ombro": 85,
      "Meio costas": 95,
      "Cintura/Quadril": 105,
      Bumbum: 115,
      "Abaixo do bumbum": 125,
    },
    menuBaseByLength: {
      "Chanel/Ombro": 440,
      "Meio costas": 450,
      "Cintura/Quadril": 470,
      Bumbum: 495,
      "Abaixo do bumbum": 520,
    },
  },
  "French curls": {
    defaultComplexityMultiplier: 1.2,
    defaultHoursByLength: {
      "Chanel/Ombro": 5.5,
      "Meio costas": 6.5,
      "Cintura/Quadril": 7.5,
      Bumbum: 8.5,
      "Abaixo do bumbum": 9.0,
    },
    defaultMaterialByLength: {
      "Chanel/Ombro": 75,
      "Meio costas": 85,
      "Cintura/Quadril": 95,
      Bumbum: 105,
      "Abaixo do bumbum": 115,
    },
    menuBaseByLength: {
      "Chanel/Ombro": 430,
      "Meio costas": 0,
      "Cintura/Quadril": 460,
      Bumbum: 0,
      "Abaixo do bumbum": 0,
    },
  },
};

const EMPTY_SELECTED_EXTRAS: Record<ExtraKey, boolean> = {
  Desenho: false,
  Miçangas: false,
  Rabo: false,
  Blowout: false,
  "Barrel (locs)": false,
  "Taxa deslocamento": false,
};

function brl(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function asNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function makeDefaultConfig(): AppConfig {
  return {
    hourlyRate: 35,
    marginPct: 15,
    defaultDiscountPct: 0,
    styleConfig: BRAID_TYPES.reduce(
      (result, braid) => {
        const source = DEFAULT_STYLE_CONFIG[braid];
        result[braid] = {
          defaultComplexityMultiplier: source.defaultComplexityMultiplier,
          defaultHoursByLength: LENGTHS.reduce(
            (hours, length) => {
              hours[length] = source.defaultHoursByLength[length];
              return hours;
            },
            {} as Record<LengthKey, number>,
          ),
          defaultMaterialByLength: LENGTHS.reduce(
            (materials, length) => {
              materials[length] = source.defaultMaterialByLength[length];
              return materials;
            },
            {} as Record<LengthKey, number>,
          ),
          menuBaseByLength: LENGTHS.reduce(
            (menu, length) => {
              menu[length] = source.menuBaseByLength[length];
              return menu;
            },
            {} as Record<LengthKey, number>,
          ),
        };
        return result;
      },
      {} as Record<BraidType, StyleConfig>,
    ),
    thicknessAddon: THICKNESSES.reduce(
      (result, key) => {
        result[key] = DEFAULT_THICKNESS_ADDON[key];
        return result;
      },
      {} as Record<ThicknessKey, number>,
    ),
    extras: EXTRA_KEYS.reduce(
      (result, key) => {
        result[key] = DEFAULT_EXTRAS[key];
        return result;
      },
      {} as Record<ExtraKey, number>,
    ),
  };
}

function hydrateConfig(raw: unknown): AppConfig {
  const defaults = makeDefaultConfig();
  if (!raw || typeof raw !== "object") {
    return defaults;
  }

  const value = raw as Partial<AppConfig>;
  const rawStyleConfig = (value.styleConfig ?? {}) as Partial<
    Record<BraidType, Partial<StyleConfig>>
  >;
  const rawThicknessAddon = (value.thicknessAddon ?? {}) as Partial<
    Record<ThicknessKey, number>
  >;
  const rawExtras = (value.extras ?? {}) as Partial<Record<ExtraKey, number>>;

  return {
    hourlyRate: Math.max(0, asNumber(value.hourlyRate, defaults.hourlyRate)),
    marginPct: clamp(asNumber(value.marginPct, defaults.marginPct), 0, 100),
    defaultDiscountPct: clamp(
      asNumber(value.defaultDiscountPct, defaults.defaultDiscountPct),
      0,
      80,
    ),
    thicknessAddon: THICKNESSES.reduce(
      (result, key) => {
        result[key] = Math.max(
          0,
          asNumber(rawThicknessAddon[key], defaults.thicknessAddon[key]),
        );
        return result;
      },
      {} as Record<ThicknessKey, number>,
    ),
    extras: EXTRA_KEYS.reduce(
      (result, key) => {
        result[key] = Math.max(0, asNumber(rawExtras[key], defaults.extras[key]));
        return result;
      },
      {} as Record<ExtraKey, number>,
    ),
    styleConfig: BRAID_TYPES.reduce(
      (result, braid) => {
        const defaultsForBraid = defaults.styleConfig[braid];
        const rawForBraid = rawStyleConfig[braid] ?? {};
        const rawHours = (rawForBraid.defaultHoursByLength ?? {}) as Partial<
          Record<LengthKey, number>
        >;
        const rawMaterial = (rawForBraid.defaultMaterialByLength ?? {}) as Partial<
          Record<LengthKey, number>
        >;
        const rawMenu = (rawForBraid.menuBaseByLength ?? {}) as Partial<
          Record<LengthKey, number>
        >;

        result[braid] = {
          defaultComplexityMultiplier: clamp(
            asNumber(
              rawForBraid.defaultComplexityMultiplier,
              defaultsForBraid.defaultComplexityMultiplier,
            ),
            1,
            2,
          ),
          defaultHoursByLength: LENGTHS.reduce(
            (hoursResult, length) => {
              hoursResult[length] = Math.max(
                0,
                asNumber(rawHours[length], defaultsForBraid.defaultHoursByLength[length]),
              );
              return hoursResult;
            },
            {} as Record<LengthKey, number>,
          ),
          defaultMaterialByLength: LENGTHS.reduce(
            (materialResult, length) => {
              materialResult[length] = Math.max(
                0,
                asNumber(
                  rawMaterial[length],
                  defaultsForBraid.defaultMaterialByLength[length],
                ),
              );
              return materialResult;
            },
            {} as Record<LengthKey, number>,
          ),
          menuBaseByLength: LENGTHS.reduce(
            (menuResult, length) => {
              menuResult[length] = Math.max(
                0,
                asNumber(rawMenu[length], defaultsForBraid.menuBaseByLength[length]),
              );
              return menuResult;
            },
            {} as Record<LengthKey, number>,
          ),
        };
        return result;
      },
      {} as Record<BraidType, StyleConfig>,
    ),
  };
}

async function fetchSessionState(): Promise<{
  authenticated: boolean;
  username: string | null;
}> {
  const response = await fetch("/auth/session", {
    method: "GET",
    credentials: "include",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error("Falha ao verificar sessão");
  }

  return (await response.json()) as {
    authenticated: boolean;
    username: string | null;
  };
}

async function loginWithCredentials(
  username: string,
  password: string,
): Promise<void> {
  const response = await fetch("/auth/login", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (response.ok) {
    return;
  }

  const payload = (await response.json().catch(() => null)) as
    | { error?: string }
    | null;
  throw new Error(payload?.error ?? "Falha ao autenticar.");
}

async function logoutSession(): Promise<void> {
  await fetch("/auth/logout", {
    method: "POST",
    credentials: "include",
  });
}

async function fetchConfigFromServer(): Promise<AppConfig | null> {
  const response = await fetch("/config", {
    method: "GET",
    credentials: "include",
    headers: { Accept: "application/json" },
  });

  if (response.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (!response.ok) {
    throw new Error("Falha ao carregar configuração");
  }

  const payload = (await response.json()) as { config?: unknown };
  if (!payload.config) {
    return null;
  }

  return hydrateConfig(payload.config);
}

async function saveConfigOnServer(config: AppConfig): Promise<void> {
  const response = await fetch("/config", {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ config }),
  });

  if (response.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (!response.ok) {
    throw new Error("Falha ao salvar configuração");
  }
}

function MetricCard(props: { title: string; value: React.ReactNode }) {
  return (
    <article className="metric-card">
      <span className="metric-card__title">{props.title}</span>
      <strong className="metric-card__value">{props.value}</strong>
    </article>
  );
}

export default function App() {
  const [authState, setAuthState] = useState<AuthState>("checking");
  const [sessionUsername, setSessionUsername] = useState<string | null>(null);
  const [loginUsername, setLoginUsername] = useState<string>("camila");
  const [loginPassword, setLoginPassword] = useState<string>("");
  const [loginError, setLoginError] = useState<string>("");
  const [configStatus, setConfigStatus] = useState<string>("Carregando configuração...");
  const [isLoadingConfig, setIsLoadingConfig] = useState<boolean>(false);
  const [isSavingSettings, setIsSavingSettings] = useState<boolean>(false);

  const [viewMode, setViewMode] = useState<ViewMode>("service");
  const [config, setConfig] = useState<AppConfig>(makeDefaultConfig);
  const [draftConfig, setDraftConfig] = useState<AppConfig>(makeDefaultConfig);

  const [pricingMode, setPricingMode] = useState<PricingMode>("Por tabela (menu)");
  const [braidType, setBraidType] = useState<BraidType>("Box braids");
  const [length, setLength] = useState<LengthKey>("Cintura/Quadril");
  const [thickness, setThickness] = useState<ThicknessKey>("M (padrão)");
  const [selectedExtras, setSelectedExtras] = useState<Record<ExtraKey, boolean>>(
    EMPTY_SELECTED_EXTRAS,
  );
  const [discountPct, setDiscountPct] = useState<number>(0);
  const [copyStatus, setCopyStatus] = useState<string>("");

  useEffect(() => {
    setDiscountPct(config.defaultDiscountPct);
  }, [config.defaultDiscountPct]);

  useEffect(() => {
    let cancelled = false;

    async function initializeSession() {
      setAuthState("checking");
      setLoginError("");

      try {
        const session = await fetchSessionState();
        if (cancelled) {
          return;
        }

        if (session.authenticated) {
          setAuthState("authenticated");
          setSessionUsername(session.username ?? "camila");
          return;
        }

        setAuthState("unauthenticated");
      } catch {
        if (cancelled) {
          return;
        }
        setAuthState("unauthenticated");
        setLoginError("Não foi possível conectar ao servidor.");
      }
    }

    void initializeSession();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (authState !== "authenticated") {
      return;
    }

    let cancelled = false;

    async function loadConfig() {
      setIsLoadingConfig(true);
      setConfigStatus("Carregando configuração do banco...");

      try {
        const serverConfig = await fetchConfigFromServer();
        if (cancelled) {
          return;
        }

        if (serverConfig) {
          setConfig(serverConfig);
          setConfigStatus("Configuração carregada.");
          return;
        }

        const defaults = makeDefaultConfig();
        setConfig(defaults);
        await saveConfigOnServer(defaults);
        if (cancelled) {
          return;
        }
        setConfigStatus("Configuração inicial criada.");
      } catch (error) {
        if (cancelled) {
          return;
        }

        if (error instanceof Error && error.message === "UNAUTHORIZED") {
          setAuthState("unauthenticated");
          setSessionUsername(null);
          setLoginError("Sua sessão expirou. Faça login novamente.");
          return;
        }

        setConfig(makeDefaultConfig());
        setConfigStatus("Erro ao carregar banco. Usando configuração padrão.");
      } finally {
        if (!cancelled) {
          setIsLoadingConfig(false);
        }
      }
    }

    void loadConfig();

    return () => {
      cancelled = true;
    };
  }, [authState]);

  const styleCfg = config.styleConfig[braidType];

  const calc = useMemo(() => {
    const baseHours = styleCfg.defaultHoursByLength[length] ?? 0;
    const baseMaterial = styleCfg.defaultMaterialByLength[length] ?? 0;
    const menuBase = styleCfg.menuBaseByLength[length] ?? 0;
    const complexityMultiplier = styleCfg.defaultComplexityMultiplier;

    const extrasTotal = EXTRA_KEYS.filter((key) => selectedExtras[key]).reduce(
      (sum, key) => sum + config.extras[key],
      0,
    );
    const thicknessTotal = config.thicknessAddon[thickness] ?? 0;

    const base =
      pricingMode === "Por tabela (menu)"
        ? menuBase
        : baseHours * config.hourlyRate + baseMaterial;

    const baseEffective =
      pricingMode === "Por tabela (menu)" && base === 0
        ? baseHours * config.hourlyRate + baseMaterial
        : base;

    const complexityAdj = baseEffective * (complexityMultiplier - 1);
    const subtotal = baseEffective + complexityAdj + thicknessTotal + extrasTotal;
    const margin = subtotal * (config.marginPct / 100);
    const preDiscount = subtotal + margin;
    const discount = preDiscount * (discountPct / 100);
    const total = preDiscount - discount;

    return {
      baseHours,
      baseMaterial,
      menuBase,
      complexityMultiplier,
      baseEffective,
      complexityAdj,
      thicknessTotal,
      extrasTotal,
      subtotal,
      margin,
      preDiscount,
      discount,
      total,
    };
  }, [
    config.extras,
    config.hourlyRate,
    config.marginPct,
    config.thicknessAddon,
    discountPct,
    length,
    pricingMode,
    selectedExtras,
    styleCfg,
    thickness,
  ]);

  const quoteText = useMemo(() => {
    const selectedExtraNames = EXTRA_KEYS.filter((key) => selectedExtras[key]);
    const thicknessLabel =
      thickness === "M (padrão)" ? "espessura padrão" : `espessura ${thickness}`;

    let extrasLine = "Sem extras adicionais.";
    if (selectedExtraNames.length === 1) {
      extrasLine = `Com extra de ${selectedExtraNames[0]}.`;
    } else if (selectedExtraNames.length === 2) {
      extrasLine = `Com extras de ${selectedExtraNames[0]} e ${selectedExtraNames[1]}.`;
    } else if (selectedExtraNames.length > 2) {
      extrasLine = `Com ${selectedExtraNames.length} extras (${selectedExtraNames.slice(0, 2).join(", ")} e outros).`;
    }

    const lines = [
      "Olá! Segue seu orçamento:",
      `${braidType} - ${length} (${thicknessLabel}).`,
      extrasLine,
      discountPct > 0
        ? `Valor final com desconto: ${brl(calc.total)}.`
        : `Valor final: ${brl(calc.total)}.`,
      "Valor já com materiais e execução inclusos.",
      "Se estiver de acordo, te envio as opções de horário.",
    ];

    return lines.join("\n");
  }, [
    braidType,
    calc.total,
    discountPct,
    length,
    selectedExtras,
    thickness,
  ]);

  function openSettings() {
    setDraftConfig(hydrateConfig(config));
    setViewMode("settings");
  }

  function closeSettings() {
    setViewMode("service");
  }

  async function saveSettings() {
    const sanitized = hydrateConfig(draftConfig);
    setIsSavingSettings(true);
    setConfigStatus("Salvando configuração...");

    try {
      await saveConfigOnServer(sanitized);
      setConfig(sanitized);
      setViewMode("service");
      setConfigStatus("Configuração salva.");
    } catch (error) {
      if (error instanceof Error && error.message === "UNAUTHORIZED") {
        setAuthState("unauthenticated");
        setSessionUsername(null);
        setLoginError("Sua sessão expirou. Faça login novamente.");
        return;
      }
      setConfigStatus("Erro ao salvar no banco.");
    } finally {
      setIsSavingSettings(false);
    }
  }

  async function handleLoginSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginError("");

    try {
      await loginWithCredentials(loginUsername.trim(), loginPassword);
      setLoginPassword("");
      setSessionUsername("camila");
      setAuthState("authenticated");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Falha ao realizar login.";
      setLoginError(message);
    }
  }

  async function handleLogout() {
    try {
      await logoutSession();
    } finally {
      setAuthState("unauthenticated");
      setSessionUsername(null);
      setLoginPassword("");
      setViewMode("service");
      setConfig(makeDefaultConfig());
      setDraftConfig(makeDefaultConfig());
      setConfigStatus("Sessão encerrada.");
    }
  }

  function resetDraftSettings() {
    setDraftConfig(makeDefaultConfig());
  }

  function updateDraftGlobal(
    key: "hourlyRate" | "marginPct" | "defaultDiscountPct",
    value: number,
  ) {
    setDraftConfig((prev) => {
      if (key === "hourlyRate") {
        return { ...prev, hourlyRate: Math.max(0, value) };
      }
      if (key === "marginPct") {
        return { ...prev, marginPct: clamp(value, 0, 100) };
      }
      return { ...prev, defaultDiscountPct: clamp(value, 0, 80) };
    });
  }

  function updateDraftThickness(key: ThicknessKey, value: number) {
    setDraftConfig((prev) => ({
      ...prev,
      thicknessAddon: {
        ...prev.thicknessAddon,
        [key]: Math.max(0, value),
      },
    }));
  }

  function updateDraftExtra(key: ExtraKey, value: number) {
    setDraftConfig((prev) => ({
      ...prev,
      extras: {
        ...prev.extras,
        [key]: Math.max(0, value),
      },
    }));
  }

  function updateDraftComplexity(braid: BraidType, value: number) {
    setDraftConfig((prev) => ({
      ...prev,
      styleConfig: {
        ...prev.styleConfig,
        [braid]: {
          ...prev.styleConfig[braid],
          defaultComplexityMultiplier: clamp(value, 1, 2),
        },
      },
    }));
  }

  function updateDraftLengthField(
    braid: BraidType,
    field: LengthFieldKey,
    size: LengthKey,
    value: number,
  ) {
    setDraftConfig((prev) => ({
      ...prev,
      styleConfig: {
        ...prev.styleConfig,
        [braid]: {
          ...prev.styleConfig[braid],
          [field]: {
            ...prev.styleConfig[braid][field],
            [size]: Math.max(0, value),
          },
        },
      },
    }));
  }

  function clearExtras() {
    setSelectedExtras(EMPTY_SELECTED_EXTRAS);
  }

  async function handleCopyQuote() {
    try {
      await navigator.clipboard.writeText(quoteText);
      setCopyStatus("Orçamento copiado.");
      setTimeout(() => setCopyStatus(""), 2000);
    } catch {
      setCopyStatus("Não foi possível copiar automaticamente.");
    }
  }

  if (authState === "checking") {
    return (
      <div className="auth-shell">
        <section className="auth-card">
          <p className="auth-brand">Estúdio de Tranças</p>
          <h1>Conectando...</h1>
          <p>Verificando sessão ativa.</p>
        </section>
      </div>
    );
  }

  if (authState === "unauthenticated") {
    return (
      <div className="auth-shell">
        <section className="auth-card">
          <p className="auth-brand">Estúdio de Tranças</p>
          <h1>Acesso restrito</h1>
          <p>Entre com seu usuário para abrir a calculadora.</p>

          <form className="auth-form" onSubmit={handleLoginSubmit}>
            <label className="field">
              Usuário
              <input
                type="text"
                value={loginUsername}
                onChange={(event) => setLoginUsername(event.target.value)}
                autoComplete="username"
                required
              />
            </label>

            <label className="field">
              Senha
              <input
                type="password"
                value={loginPassword}
                onChange={(event) => setLoginPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
            </label>

            {loginError ? <p className="auth-error">{loginError}</p> : null}

            <button className="btn btn--primary" type="submit">
              Entrar
            </button>
          </form>
        </section>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="hero">
        <div>
          <p className="hero__eyebrow">Estúdio de Tranças</p>
          <h1 className="hero__title">Calculadora de Orçamento</h1>
          <p className="hero__subtitle">
            {viewMode === "service"
              ? "Monte o atendimento em segundos e compartilhe o orçamento no WhatsApp."
              : "Painel de configuração: aqui ficam os valores fixos do seu negócio."}
          </p>
          <p className="hero__subtitle hero__subtitle--small">
            Usuária: {sessionUsername ?? "camila"} | {configStatus}
          </p>
        </div>

        <div className="hero__actions">
          {viewMode === "service" ? (
            <>
              <button className="btn btn--outline" onClick={openSettings}>
                Configurações
              </button>
              <button className="btn btn--ghost" onClick={() => void handleLogout()}>
                Sair
              </button>
            </>
          ) : (
            <>
              <button className="btn btn--outline" onClick={resetDraftSettings}>
                Restaurar padrão
              </button>
              <button className="btn btn--ghost" onClick={closeSettings}>
                Cancelar
              </button>
              <button
                className="btn btn--primary"
                onClick={() => void saveSettings()}
                disabled={isSavingSettings || isLoadingConfig}
              >
                {isSavingSettings ? "Salvando..." : "Salvar e voltar"}
              </button>
              <button className="btn btn--ghost" onClick={() => void handleLogout()}>
                Sair
              </button>
            </>
          )}
        </div>
      </header>

      {viewMode === "service" ? (
        <main className="layout-grid">
          <section className="surface-card fade-up">
            <div className="section-head">
              <span className="step-pill">Passo 1</span>
              <h2>Montar serviço</h2>
            </div>

            <div className="field-grid">
              <label className="field">
                Tipo de trança
                <select
                  value={braidType}
                  onChange={(event) => setBraidType(event.target.value as BraidType)}
                >
                  {BRAID_TYPES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                Comprimento
                <select
                  value={length}
                  onChange={(event) => setLength(event.target.value as LengthKey)}
                >
                  {LENGTHS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                Espessura
                <select
                  value={thickness}
                  onChange={(event) => setThickness(event.target.value as ThicknessKey)}
                >
                  {THICKNESSES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                Modo de preço
                <select
                  value={pricingMode}
                  onChange={(event) =>
                    setPricingMode(event.target.value as PricingMode)
                  }
                >
                  <option>Por tabela (menu)</option>
                  <option>Por tempo (hora)</option>
                </select>
              </label>
            </div>

            <div className="section-head section-head--spaced">
              <span className="step-pill">Passo 2</span>
              <h2>Extras</h2>
            </div>

            <div className="chips-grid">
              {EXTRA_KEYS.map((key) => (
                <button
                  key={key}
                  className={`chip ${selectedExtras[key] ? "chip--active" : ""}`}
                  onClick={() =>
                    setSelectedExtras((prev) => ({ ...prev, [key]: !prev[key] }))
                  }
                  type="button"
                >
                  <span>{key}</span>
                  <strong>{brl(config.extras[key])}</strong>
                </button>
              ))}
            </div>

            <div className="inline-actions">
              <button className="btn btn--ghost" type="button" onClick={clearExtras}>
                Limpar extras
              </button>
            </div>

            <div className="section-head section-head--spaced">
              <span className="step-pill">Passo 3</span>
              <h2>Desconto deste orçamento</h2>
            </div>

            <div className="discount-wrap">
              <input
                type="range"
                min={0}
                max={80}
                step={1}
                value={discountPct}
                onChange={(event) =>
                  setDiscountPct(clamp(Number(event.target.value || 0), 0, 80))
                }
              />
              <span>{discountPct}%</span>
            </div>

            <div className="quick-picks">
              {DISCOUNT_OPTIONS.map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`quick-pick ${discountPct === value ? "quick-pick--active" : ""}`}
                  onClick={() => setDiscountPct(value)}
                >
                  {value}%
                </button>
              ))}
            </div>

            <p className="hint">
              Para alterar preços fixos, base de menu, horas e materiais use a tela
              <strong> Configurações</strong>.
            </p>
          </section>

          <section className="surface-card fade-up fade-up--delay">
            <div className="section-head">
              <span className="step-pill">Resumo</span>
              <h2>Resultado</h2>
            </div>

            {pricingMode === "Por tabela (menu)" && calc.menuBase === 0 && (
              <p className="warning-box">
                Esse comprimento não tem base de menu cadastrada para este estilo. O
                cálculo caiu automaticamente para tempo + material.
              </p>
            )}

            <div className="total-banner">
              <span>Total final</span>
              <strong>{brl(calc.total)}</strong>
            </div>

            <div className="metrics-grid">
              <MetricCard title="Base efetiva" value={brl(calc.baseEffective)} />
              <MetricCard title="Complexidade" value={brl(calc.complexityAdj)} />
              <MetricCard title="Espessura" value={brl(calc.thicknessTotal)} />
              <MetricCard title="Extras" value={brl(calc.extrasTotal)} />
              <MetricCard
                title={`Margem (${config.marginPct.toFixed(0)}%)`}
                value={brl(calc.margin)}
              />
              <MetricCard title="Subtotal" value={brl(calc.subtotal)} />
            </div>

            <dl className="breakdown">
              <div>
                <dt>Horas de referência</dt>
                <dd>{calc.baseHours.toFixed(1)}h</dd>
              </div>
              <div>
                <dt>Material</dt>
                <dd>{brl(calc.baseMaterial)}</dd>
              </div>
              <div>
                <dt>Desconto aplicado</dt>
                <dd>{discountPct}%</dd>
              </div>
            </dl>

            <h3 className="textarea-title">Mensagem para WhatsApp</h3>
            <textarea readOnly value={quoteText} />

            <div className="inline-actions inline-actions--between">
              <button className="btn btn--primary" onClick={handleCopyQuote}>
                Copiar orçamento
              </button>
              {copyStatus ? <span className="status-msg">{copyStatus}</span> : null}
            </div>
          </section>
        </main>
      ) : (
        <main className="settings-stack">
          <section className="surface-card fade-up">
            <h2>Configurações gerais</h2>
            <div className="field-grid">
              <label className="field">
                Valor/hora (modo por tempo)
                <input
                  type="number"
                  min={0}
                  value={draftConfig.hourlyRate}
                  onChange={(event) =>
                    updateDraftGlobal("hourlyRate", Number(event.target.value || 0))
                  }
                />
              </label>

              <label className="field">
                Margem padrão (%)
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={draftConfig.marginPct}
                  onChange={(event) =>
                    updateDraftGlobal("marginPct", Number(event.target.value || 0))
                  }
                />
              </label>

              <label className="field">
                Desconto padrão (%)
                <input
                  type="number"
                  min={0}
                  max={80}
                  value={draftConfig.defaultDiscountPct}
                  onChange={(event) =>
                    updateDraftGlobal(
                      "defaultDiscountPct",
                      Number(event.target.value || 0),
                    )
                  }
                />
              </label>
            </div>
          </section>

          <section className="surface-card fade-up fade-up--delay">
            <h2>Adicionais fixos</h2>

            <h3>Espessura</h3>
            <div className="field-grid">
              {THICKNESSES.map((key) => (
                <label key={key} className="field">
                  {key}
                  <input
                    type="number"
                    min={0}
                    value={draftConfig.thicknessAddon[key]}
                    onChange={(event) =>
                      updateDraftThickness(key, Number(event.target.value || 0))
                    }
                  />
                </label>
              ))}
            </div>

            <h3>Extras</h3>
            <div className="field-grid field-grid--wide">
              {EXTRA_KEYS.map((key) => (
                <label key={key} className="field">
                  {key}
                  <input
                    type="number"
                    min={0}
                    value={draftConfig.extras[key]}
                    onChange={(event) =>
                      updateDraftExtra(key, Number(event.target.value || 0))
                    }
                  />
                </label>
              ))}
            </div>
          </section>

          <section className="surface-card fade-up fade-up--delay-2">
            <h2>Tabela por estilo</h2>
            <p className="hint">
              Aqui você define tudo que alimenta o orçamento automático da tela
              principal.
            </p>

            <div className="styles-accordion">
              {BRAID_TYPES.map((braid) => {
                const style = draftConfig.styleConfig[braid];
                return (
                  <details key={braid} open={braid === braidType}>
                    <summary>{braid}</summary>

                    <div className="accordion-body">
                      <label className="field field--inline">
                        Multiplicador de complexidade
                        <input
                          type="number"
                          min={1}
                          max={2}
                          step={0.05}
                          value={style.defaultComplexityMultiplier}
                          onChange={(event) =>
                            updateDraftComplexity(
                              braid,
                              Number(event.target.value || 1),
                            )
                          }
                        />
                      </label>

                      <div className="table-wrap">
                        <table>
                          <thead>
                            <tr>
                              <th>Comprimento</th>
                              <th>Base menu (R$)</th>
                              <th>Horas</th>
                              <th>Material (R$)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {LENGTHS.map((size) => (
                              <tr key={size}>
                                <td>{size}</td>
                                <td>
                                  <input
                                    type="number"
                                    min={0}
                                    value={style.menuBaseByLength[size]}
                                    onChange={(event) =>
                                      updateDraftLengthField(
                                        braid,
                                        "menuBaseByLength",
                                        size,
                                        Number(event.target.value || 0),
                                      )
                                    }
                                  />
                                </td>
                                <td>
                                  <input
                                    type="number"
                                    min={0}
                                    step={0.5}
                                    value={style.defaultHoursByLength[size]}
                                    onChange={(event) =>
                                      updateDraftLengthField(
                                        braid,
                                        "defaultHoursByLength",
                                        size,
                                        Number(event.target.value || 0),
                                      )
                                    }
                                  />
                                </td>
                                <td>
                                  <input
                                    type="number"
                                    min={0}
                                    value={style.defaultMaterialByLength[size]}
                                    onChange={(event) =>
                                      updateDraftLengthField(
                                        braid,
                                        "defaultMaterialByLength",
                                        size,
                                        Number(event.target.value || 0),
                                      )
                                    }
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </details>
                );
              })}
            </div>
          </section>
        </main>
      )}
    </div>
  );
}
