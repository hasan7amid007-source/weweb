/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BOOKING_DEMO_PAY?: string
  readonly VITE_STRIPE_LINK_GENERAL?: string
  readonly VITE_STRIPE_LINK_WEB_HOSTING?: string
  readonly VITE_STRIPE_LINK_MOBILE_APP?: string
  readonly VITE_STRIPE_LINK_WEB_DEVELOPMENT?: string
  readonly VITE_STRIPE_LINK_E_COMMERCE?: string
  readonly VITE_STRIPE_LINK_DIGITAL_MARKETING?: string
  readonly VITE_STRIPE_LINK_OFFLINE_MARKETING?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
