/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Soft-launch: no client Payment Link envs — checkout mode is owned by /api/create-checkout.
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
