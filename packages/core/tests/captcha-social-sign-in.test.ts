import { betterAuth } from "better-auth"
import { memoryAdapter } from "better-auth/adapters/memory"
import { captcha } from "better-auth/plugins"
import { expect, it } from "vitest"

it.each([
  {
    name: "explicit endpoints from the CAPTCHA setup guide",
    endpoints: [
      "/sign-up/email",
      "/sign-in/email",
      "/sign-in/username",
      "/sign-in/social",
      "/request-password-reset"
    ]
  },
  { name: "the sign-in wildcard", endpoints: ["/sign-in/*"] }
])(
  "rejects social sign-in without a CAPTCHA response using $name",
  async ({ endpoints }) => {
    const auth = betterAuth({
      baseURL: "http://localhost:3000",
      secret: "captcha-integration-test-secret-at-least-32-characters",
      database: memoryAdapter({}),
      plugins: [
        captcha({
          provider: "cloudflare-turnstile",
          secretKey: "captcha-test-secret",
          endpoints
        })
      ]
    })

    const response = await auth.handler(
      new Request("http://localhost:3000/api/auth/sign-in/social", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ provider: "github" })
      })
    )

    expect(response.status).toBe(400)
    expect(await response.json()).toMatchObject({ code: "MISSING_RESPONSE" })
  }
)
