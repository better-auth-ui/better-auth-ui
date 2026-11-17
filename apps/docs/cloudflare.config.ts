import { defineConfig } from "cf/config"

// The docs are a fully prerendered static site, served as an assets-only Worker.
export default defineConfig({
  accountId: "8c9254df3439d61541f54e469b4bf847",
  worker: {
    name: "better-auth-ui-docs",
    domains: ["better-auth-ui.com"],
    compatibilityDate: "2026-11-16",
    assets: {
      htmlHandling: "auto-trailing-slash",
      notFoundHandling: "404-page"
    }
  }
})
