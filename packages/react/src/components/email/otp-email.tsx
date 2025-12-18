import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  pixelBasedPreset,
  Section,
  Tailwind,
  Text
} from "@react-email/components"
import type { ReactNode } from "react"

import { cn } from "../../lib/utils"
import {
  type EmailClassNames,
  type EmailColors,
  EmailStyles
} from "./email-styles"

const otpEmailLocalization = {
  YOUR_VERIFICATION_CODE_IS_CODE:
    "Your verification code is {verificationCode}",
  LOGO: "Logo",
  VERIFY_YOUR_EMAIL: "Verify your email",
  WE_NEED_TO_VERIFY_YOUR_EMAIL_ADDRESS:
    "We need to verify your email address {email} before you can access your {appName} account. Enter the code below in your open browser window.",
  THIS_CODE_EXPIRES_IN_MINUTES:
    "This code expires in {expirationMinutes} minutes.",
  EMAIL_SENT_BY: "Email sent by {appName}.",
  IF_YOU_DIDNT_REQUEST_THIS_EMAIL:
    "If you didn't request this email, you can safely ignore it. Someone else might have typed your email address by mistake.",
  POWERED_BY_BETTER_AUTH: "Powered by {betterAuth}"
}

/**
 * Localization strings for the OtpEmail component.
 *
 * Contains all text content used in the OTP (One-Time Password) email template.
 */
export type OtpEmailEmailLocalization = typeof otpEmailLocalization

/**
 * Props for the OtpEmail component.
 */
export interface OtpEmailProps {
  /** The one-time verification code to display */
  verificationCode: string
  /** Email address being verified */
  email?: string
  /** Name of the application sending the email */
  appName?: string
  /** Number of minutes until the verification code expires */
  expirationMinutes?: number
  /** Logo URL(s) - can be a single string or an object with light/dark variants */
  logoURL?: string | { light: string; dark: string }
  /** Custom CSS class names for styling specific parts of the email */
  classNames?: EmailClassNames
  /** Custom color scheme for light and dark modes */
  colors?: EmailColors
  /** Whether to show the "Powered by better-auth" footer */
  poweredBy?: boolean
  /** Whether to enable dark mode support */
  darkMode?: boolean
  /** Additional React nodes to inject into the email head */
  head?: ReactNode
  /** Partial localization overrides for customizing email text */
  localization?: Partial<OtpEmailEmailLocalization>
}

/**
 * Email template component that sends one-time password (OTP) verification codes to users.
 *
 * This email includes:
 * - Large, prominently displayed verification code
 * - Expiration time information
 * - Security notice for unauthorized requests
 * - Customizable branding and styling
 * - Support for light/dark mode themes
 *
 * @example
 * ```tsx
 * <OtpEmail
 *   verificationCode="069420"
 *   email="user@example.com"
 *   appName="My App"
 *   expirationMinutes={10}
 *   logoURL="https://example.com/logo.png"
 *   darkMode={true}
 * />
 * ```
 */
export const OtpEmail = ({
  verificationCode,
  email,
  appName,
  expirationMinutes = 10,
  logoURL = "https://better-auth.com/logo.png",
  colors,
  classNames,
  darkMode = true,
  poweredBy,
  head,
  ...props
}: OtpEmailProps) => {
  const localization = {
    ...OtpEmail.localization,
    ...props.localization
  }

  const previewText = localization.YOUR_VERIFICATION_CODE_IS_CODE.replace(
    "{verificationCode}",
    verificationCode
  )

  return (
    <Html>
      <Head>
        <meta content="light dark" name="color-scheme" />
        <meta content="light dark" name="supported-color-schemes" />

        <EmailStyles colors={colors} darkMode={darkMode} />

        {head}
      </Head>

      <Preview>{previewText}</Preview>

      <Tailwind config={{ presets: [pixelBasedPreset] }}>
        <Body className={cn("bg-background font-sans", classNames?.body)}>
          <Container
            className={cn(
              "mx-auto my-auto max-w-xl px-2 py-10",
              classNames?.container
            )}
          >
            <Section
              className={cn(
                "bg-card text-card-foreground rounded-none border border-border p-8",
                classNames?.card
              )}
            >
              {logoURL &&
                (typeof logoURL === "string" ? (
                  <Img
                    src={logoURL}
                    width={48}
                    height={48}
                    alt={appName || localization.LOGO}
                    className={cn("mx-auto mb-8", classNames?.logo)}
                  />
                ) : (
                  <>
                    <Img
                      src={logoURL.light}
                      width={48}
                      height={48}
                      alt={appName || localization.LOGO}
                      className={cn(
                        "mx-auto mb-8 logo-light",
                        classNames?.logo
                      )}
                    />
                    <Img
                      src={logoURL.dark}
                      width={48}
                      height={48}
                      alt={appName || localization.LOGO}
                      className={cn(
                        "hidden mx-auto mb-8 logo-dark",
                        classNames?.logo
                      )}
                    />
                  </>
                ))}

              <Heading
                className={cn("mb-5 text-2xl font-semibold", classNames?.title)}
              >
                {localization.VERIFY_YOUR_EMAIL}
              </Heading>

              <Text className={cn("text-sm font-normal", classNames?.content)}>
                {(() => {
                  const textWithAppName =
                    localization.WE_NEED_TO_VERIFY_YOUR_EMAIL_ADDRESS.replace(
                      "{appName}",
                      appName || ""
                    )
                      .replace(/\s{2,}/g, " ")
                      .replace(" .", ".")

                  const [beforeEmail, afterEmail] =
                    textWithAppName.split("{email}")

                  return email ? (
                    <>
                      {beforeEmail}

                      <Link
                        href={`mailto:${email}`}
                        className="text-primary font-medium"
                      >
                        {email}
                      </Link>

                      {afterEmail}
                    </>
                  ) : (
                    textWithAppName
                      .replace("{email}", "")
                      .replace(/\s{2,}/g, " ")
                      .replace(" .", ".")
                  )
                })()}
              </Text>

              <Section
                className={cn(
                  "my-6 border border-border bg-muted p-6",
                  classNames?.codeBlock
                )}
              >
                <Text
                  className={cn(
                    "m-0 text-center text-4xl font-semibold tracking-widest",
                    classNames?.title
                  )}
                >
                  {verificationCode}
                </Text>
              </Section>

              <Hr
                className={cn(
                  "my-6 w-full border border-solid border-border",
                  classNames?.separator
                )}
              />

              <Text
                className={cn(
                  "mb-3 text-xs text-muted-foreground",
                  classNames?.description
                )}
              >
                {localization.THIS_CODE_EXPIRES_IN_MINUTES.replace(
                  "{expirationMinutes}",
                  expirationMinutes.toString()
                )}
                {appName && (
                  <>
                    {" "}
                    {localization.EMAIL_SENT_BY.replace("{appName}", appName)}
                  </>
                )}
              </Text>

              <Text
                className={cn(
                  "mt-3 text-xs text-muted-foreground",
                  classNames?.description
                )}
              >
                {localization.IF_YOU_DIDNT_REQUEST_THIS_EMAIL}
              </Text>

              {poweredBy && (
                <Text
                  className={cn(
                    "mt-4 mb-0 text-center text-[11px] text-muted-foreground",
                    classNames?.poweredBy
                  )}
                >
                  {(() => {
                    const [beforeBetterAuth, afterBetterAuth] =
                      localization.POWERED_BY_BETTER_AUTH.split("{betterAuth}")

                    return (
                      <>
                        {beforeBetterAuth}
                        <Link
                          href="https://better-auth.com"
                          className={cn(
                            "text-primary underline",
                            classNames?.link
                          )}
                        >
                          better-auth
                        </Link>
                        {afterBetterAuth}
                      </>
                    )
                  })()}
                </Text>
              )}
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

OtpEmail.localization = otpEmailLocalization

OtpEmail.PreviewProps = {
  verificationCode: "069420",
  email: "m@example.com",
  appName: "Better Auth",
  darkMode: true
} as OtpEmailProps

export default OtpEmail
