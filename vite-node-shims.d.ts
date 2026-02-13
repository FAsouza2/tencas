declare module "node:fs" {
  const fs: any;
  export default fs;
}

declare module "node:path" {
  const path: any;
  export default path;
}

declare module "node:url" {
  export const fileURLToPath: any;
}

declare module "node:crypto" {
  const crypto: any;
  export default crypto;
}

declare module "node:sqlite" {
  export const DatabaseSync: any;
}
