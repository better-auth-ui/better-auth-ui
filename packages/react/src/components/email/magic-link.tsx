import {
  Body,
  Button,
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

const magicLinkEmailLocalization = {
  SIGN_IN_TO_APP_NAME: "Sign in to {appName}",
  SIGN_IN_TO_YOUR_ACCOUNT: "Sign in to your account",
  YOUR_ACCOUNT: "your account",
  LOGO: "Logo",
  CLICK_BUTTON_TO_SIGN_IN:
    "Click the button below to sign in to your account {emailAddress}.",
  OR_COPY_AND_PASTE_URL: "Or copy and paste this URL into your browser:",
  THIS_LINK_EXPIRES_IN_MINUTES:
    "This link expires in {expirationMinutes} minutes.",
  EMAIL_SENT_BY: "Email sent by {appName}.",
  IF_YOU_DIDNT_REQUEST_THIS_EMAIL:
    "If you didn't request this email, you can safely ignore it. Someone else might have typed your email address by mistake.",
  POWERED_BY_BETTER_AUTH: "Powered by {betterAuth}"
}

/**
 * Localization strings for the MagicLinkEmail component.
 *
 * Contains all text content used in the magic link authentication email template.
 */
export type MagicLinkEmailLocalization = typeof magicLinkEmailLocalization

/**
 * Props for the MagicLinkEmail component.
 */
export interface MagicLinkEmailProps {
  /** Magic link URL for passwordless authentication */
  url: string
  /** Email address of the user signing in */
  email?: string
  /** Name of the application sending the email */
  appName?: string
  /** Number of minutes until the magic link expires */
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
  localization?: Partial<MagicLinkEmailLocalization>
}

/**
 * Email template component that sends magic link authentication emails for passwordless sign-in.
 *
 * This email includes:
 * - Sign-in button with magic link
 * - Fallback URL for manual copy/paste
 * - Expiration time information
 * - Security notice for unauthorized requests
 * - Customizable branding and styling
 * - Support for light/dark mode themes
 *
 * @example
 * ```tsx
 * <MagicLinkEmail
 *   url="https://example.com/auth/verify?token=abc123"
 *   email="user@example.com"
 *   appName="My App"
 *   expirationMinutes={5}
 *   logoURL="https://example.com/logo.png"
 *   darkMode={true}
 * />
 * ```
 */
export const MagicLinkEmail = ({
  url,
  email,
  appName,
  expirationMinutes = 5,
  logoURL = "https://better-auth.com/logo.png",
  colors,
  classNames,
  darkMode = true,
  poweredBy,
  head,
  ...props
}: MagicLinkEmailProps) => {
  const localization = {
    ...MagicLinkEmail.localization,
    ...props.localization
  }

  const previewText = appName
    ? localization.SIGN_IN_TO_APP_NAME.replace("{appName}", appName)
    : localization.SIGN_IN_TO_YOUR_ACCOUNT

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
                className={cn(
                  "m-0 mb-5 text-2xl font-semibold",
                  classNames?.title
                )}
              >
                {appName
                  ? localization.SIGN_IN_TO_APP_NAME.replace(
                      "{appName}",
                      appName
                    )
                  : localization.SIGN_IN_TO_YOUR_ACCOUNT}
              </Heading>

              <Text
                className={cn("m-0 text-sm font-normal", classNames?.content)}
              >
                {(() => {
                  const [beforeEmailAddress, afterEmailAddress] =
                    localization.CLICK_BUTTON_TO_SIGN_IN.split("{emailAddress}")

                  return email ? (
                    <>
                      {beforeEmailAddress}
                      <Link
                        href={`mailto:${email}`}
                        className="text-primary font-medium"
                      >
                        {email}
                      </Link>
                      {afterEmailAddress}
                    </>
                  ) : (
                    localization.CLICK_BUTTON_TO_SIGN_IN.replace(
                      "{emailAddress}",
                      ""
                    )
                      .replace(/\s{2,}/g, " ")
                      .replace(" .", ".")
                  )
                })()}
              </Text>

              <Section className="my-6">
                <Button
                  href={url}
                  className={cn(
                    "inline-block whitespace-nowrap rounded-none text-sm font-medium py-2.5 px-6 bg-primary text-primary-foreground no-underline",
                    classNames?.button
                  )}
                >
                  {appName
                    ? localization.SIGN_IN_TO_APP_NAME.replace(
                        "{appName}",
                        appName
                      )
                    : localization.SIGN_IN_TO_YOUR_ACCOUNT}
                </Button>
              </Section>

              <Text
                className={cn(
                  "m-0 mb-3 text-xs text-muted-foreground",
                  classNames?.description
                )}
              >
                {localization.OR_COPY_AND_PASTE_URL}
              </Text>

              <Link
                className={cn(
                  "break-all text-xs text-primary",
                  classNames?.link
                )}
                href={url}
              >
                {url}
              </Link>

              <Hr
                className={cn(
                  "my-6 w-full border border-solid border-border",
                  classNames?.separator
                )}
              />

              {expirationMinutes || appName ? (
                <Text
                  className={cn(
                    "m-0 mb-3 text-xs text-muted-foreground",
                    classNames?.description
                  )}
                >
                  {expirationMinutes
                    ? localization.THIS_LINK_EXPIRES_IN_MINUTES.replace(
                        "{expirationMinutes}",
                        expirationMinutes.toString()
                      )
                    : null}
                  {appName && (
                    <>
                      {expirationMinutes ? " " : ""}
                      {localization.EMAIL_SENT_BY.replace("{appName}", appName)}
                    </>
                  )}
                </Text>
              ) : null}

              <Text
                className={cn(
                  "m-0 text-xs text-muted-foreground",
                  classNames?.description
                )}
              >
                {localization.IF_YOU_DIDNT_REQUEST_THIS_EMAIL}
              </Text>

              {poweredBy && (
                <Text
                  className={cn(
                    "m-0 mt-4 text-center text-[11px] text-muted-foreground",
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

MagicLinkEmail.localization = magicLinkEmailLocalization

MagicLinkEmail.PreviewProps = {
  url: "https://better-auth-ui.com/auth/verify?token=example-token",
  email: "m@example.com",
  appName: "Better Auth",
  darkMode: true
} as MagicLinkEmailProps

export default MagicLinkEmail
