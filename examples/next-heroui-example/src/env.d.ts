// Environment variables that this example requires at runtime.
declare namespace NodeJS {
  interface ProcessEnv {
    BETTER_AUTH_SECRET: string
    DATABASE_URL: string
    GITHUB_CLIENT_ID: string
    GITHUB_CLIENT_SECRET: string
    GOOGLE_CLIENT_ID: string
    GOOGLE_CLIENT_SECRET: string
  }
}
