// Environment variables that this example requires at runtime.
declare namespace NodeJS {
  interface ProcessEnv {
    BETTER_AUTH_SECRET: string
    DATABASE_URL: string
    GITHUB_CLIENT_ID: string
    GITHUB_CLIENT_SECRET: string
  }
}

// Vite environment variables that this example reads in the browser.
interface ImportMetaEnv {
  readonly VITE_TURNSTILE_SITE_KEY: string
}
