import { apiKey } from "@better-auth/api-key"
import { passkey } from "@better-auth/passkey"
import {
  MagicLinkEmail,
  OtpEmail,
  ResetPasswordEmail
} from "@better-auth-ui/react/email"
import { render } from "@react-email/render"
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import {
  emailOTP,
  magicLink,
  multiSession,
  organization,
  twoFactor,
  username
} from "better-auth/plugins"

import { db } from "./db"
import { transporter } from "./mail"
import * as schema from "./schema"

const mailFrom = process.env.MAIL_FROM ?? "Better Auth UI <noreply@localhost>"

const MAGIC_LINK_EXPIRES_SECONDS = 300

const OTP_EXPIRES_SECONDS = 300

/** Subject line differs per flow, the code layout doesn't. */
const otpSubjects = {
  "sign-in": "Your sign-in code",
  "email-verification": "Verify your email",
  "forget-password": "Reset your password",
  "change-email": "Confirm your new email"
} as const

async function sendOtpEmail({
  email,
  otp,
  subject
}: {
  email: string
  otp: string
  subject: string
}) {
  const html = await render(
    <OtpEmail
      verificationCode={otp}
      appName="Better Auth UI"
      email={email}
      expirationMinutes={OTP_EXPIRES_SECONDS / 60}
      poweredBy
    />
  )

  await transporter.sendMail({
    from: mailFrom,
    to: email,
    subject,
    text: `Your code is ${otp}. It expires in ${String(OTP_EXPIRES_SECONDS / 60)} minutes.`,
    html
  })
}

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
        <ResetPasswordEmail
          url={url}
          appName="Better Auth UI"
          email={user.email}
          poweredBy
        />
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
    twoFactor({
      issuer: "Better Auth UI",
      otpOptions: {
        sendOTP: async ({ user, otp }) => {
          await sendOtpEmail({
            email: user.email,
            otp,
            subject: "Your sign-in code"
          })
        }
      }
    }),
    emailOTP({
      expiresIn: OTP_EXPIRES_SECONDS,
      // Sign-up stays on the password and magic-link paths, matching
      // `emailOtpPlugin({ disableSignUp: true })` on the client.
      disableSignUp: true,
      overrideDefaultEmailVerification: true,
      changeEmail: { enabled: true },
      sendVerificationOTP: async ({ email, otp, type }) => {
        await sendOtpEmail({ email, otp, subject: otpSubjects[type] })
      }
    }),
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
          <MagicLinkEmail
            url={url}
            appName="Better Auth UI"
            email={email}
            expirationMinutes={MAGIC_LINK_EXPIRES_SECONDS / 60}
            poweredBy
          />
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
    }
  }
})
