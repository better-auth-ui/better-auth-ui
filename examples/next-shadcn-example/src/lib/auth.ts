import { apiKey } from "@better-auth/api-key"
import { passkey } from "@better-auth/passkey"
import { MagicLinkEmail, ResetPasswordEmail } from "@better-auth-ui/react/email"
import { render } from "@react-email/render"
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import {
  magicLink,
  multiSession,
  organization,
  username
} from "better-auth/plugins"
import { createElement } from "react"

import { db } from "./db"
import { transporter } from "./mail"
import * as schema from "./schema"

const mailFrom = process.env.MAIL_FROM ?? "Better Auth UI <noreply@localhost>"

const MAGIC_LINK_EXPIRES_SECONDS = 300

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
    usePlural: true
  }),
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      const html = await render(
        createElement(ResetPasswordEmail, {
          url,
          appName: "Better Auth UI",
          email: user.email,
          poweredBy: true
        })
      )

      await transporter.sendMail({
        from: mailFrom,
        to: user.email,
        subject: "Reset your password",
        text: `Click the link to reset your password: ${url}`,
        html
      })
    }
  },
  secret: process.env.BETTER_AUTH_SECRET as string,
  plugins: [
    multiSession(),
    passkey(),
    username(),
    apiKey([
      { configId: "default", references: "user" },
      { configId: "organization", references: "organization" }
    ]),
    organization(),
    magicLink({
      expiresIn: MAGIC_LINK_EXPIRES_SECONDS,
      sendMagicLink: async ({ email, url }) => {
        const html = await render(
          createElement(MagicLinkEmail, {
            url,
            appName: "Better Auth UI",
            email,
            expirationMinutes: MAGIC_LINK_EXPIRES_SECONDS / 60,
            poweredBy: true
          })
        )

        await transporter.sendMail({
          from: mailFrom,
          to: email,
          subject: "Sign in to Better Auth UI",
          text: `Sign in with this link (expires in ${String(MAGIC_LINK_EXPIRES_SECONDS / 60)} minutes): ${url}`,
          html
        })
      }
    })
  ],
  session: {
    cookieCache: {
      enabled: false,
      maxAge: 5 * 60
    }
  },
  user: {
    deleteUser: {
      enabled: true
    }
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string
    }
  }
})
