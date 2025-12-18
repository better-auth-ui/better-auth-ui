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

const passwordChangedEmailLocalization = {
  YOUR_PASSWORD_HAS_BEEN_CHANGED: "Your password has been changed",
  LOGO: "Logo",
  PASSWORD_CHANGED_SUCCESSFULLY: "Password changed successfully",
  PASSWORD_FOR_YOUR_ACCOUNT_CHANGED:
    "The password for your {appName} account {userEmail} has been changed successfully.",
  CHANGED_AT: "Changed at",
  IF_YOU_MADE_THIS_CHANGE:
    "If you made this change, you can safely ignore this email. Your account is secure.",
  I_DIDNT_MAKE_THIS_CHANGE: "I didn't make this change",
  EMAIL_SENT_BY: "Email sent by {appName}.",
  IF_YOU_DIDNT_AUTHORIZE_THIS_CHANGE:
    "If you didn't authorize this change, please contact support immediately {supportEmail} to secure your account.",
  POWERED_BY_BETTER_AUTH: "Powered by {betterAuth}"
}

/**
 * Localization strings for the PasswordChangedEmail component.
 *
 * Contains all text content used in the password changed notification email template.
 */
export type PasswordChangedEmailLocalization =
  typeof passwordChangedEmailLocalization

/**
 * Props for the PasswordChangedEmail component.
 */
export interface PasswordChangedEmailProps {
  /** Email address of the user account */
  email?: string
  /** Timestamp when the password was changed */
  timestamp?: string
  /** URL to secure the account if unauthorized change occurred */
  secureAccountURL?: string
  /** Name of the application sending the email */
  appName?: string
  /** Support email address for security concerns */
  supportEmail?: string
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
  localization?: Partial<PasswordChangedEmailLocalization>
}

/**
 * Email template component that notifies users when their password has been changed.
 *
 * This email includes:
 * - Password change confirmation message
 * - Timestamp of the change
 * - Secure account action button if unauthorized change occurred
 * - Security warnings and support contact information
 * - Customizable branding and styling
 * - Support for light/dark mode themes
 *
 * @example
 * ```tsx
 * <PasswordChangedEmail
 *   email="user@example.com"
 *   timestamp="February 10, 2025 at 4:20 PM UTC"
 *   secureAccountURL="https://example.com/account/security"
 *   appName="My App"
 *   supportEmail="support@example.com"
 *   logoURL="https://example.com/logo.png"
 *   darkMode={true}
 * />
 * ```
 */
export const PasswordChangedEmail = ({
  email,
  timestamp,
  secureAccountURL,
  appName,
  supportEmail,
  logoURL = "https://better-auth.com/logo.png",
  colors,
  classNames,
  darkMode = true,
  poweredBy,
  head,
  ...props
}: PasswordChangedEmailProps) => {
  const localization = {
    ...PasswordChangedEmail.localization,
    ...props.localization
  }

  const previewText = localization.YOUR_PASSWORD_HAS_BEEN_CHANGED

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
                {localization.PASSWORD_CHANGED_SUCCESSFULLY}
              </Heading>

              <Text className={cn("text-sm font-normal", classNames?.content)}>
                {(() => {
                  const textWithAppName =
                    localization.PASSWORD_FOR_YOUR_ACCOUNT_CHANGED.replace(
                      "{appName}",
                      appName || ""
                    )
                      .replace(/\s{2,}/g, " ")
                      .replace(" .", ".")

                  const [beforeUserEmail, afterUserEmail] =
                    textWithAppName.split("{userEmail}")

                  return email ? (
                    <>
                      {beforeUserEmail}

                      <Link
                        href={`mailto:${email}`}
                        className="text-primary font-medium"
                      >
                        {email}
                      </Link>

                      {afterUserEmail}
                    </>
                  ) : (
                    textWithAppName
                      .replace("{userEmail}", "")
                      .replace(/\s{2,}/g, " ")
                      .replace(" .", ".")
                  )
                })()}
              </Text>

              {timestamp && (
                <Section
                  className={cn(
                    "my-6 border border-border bg-muted p-4",
                    classNames?.codeBlock
                  )}
                >
                  <Text
                    className={cn(
                      "m-0 mb-2 text-xs text-muted-foreground",
                      classNames?.description
                    )}
                  >
                    {localization.CHANGED_AT}:
                  </Text>
                  <Text
                    className={cn(
                      "m-0 text-sm font-semibold",
                      classNames?.content
                    )}
                  >
                    {timestamp}
                  </Text>
                </Section>
              )}

              <Text className={cn("text-sm font-normal", classNames?.content)}>
                {localization.IF_YOU_MADE_THIS_CHANGE}
              </Text>

              {secureAccountURL && (
                <Section className="mt-6">
                  <Button
                    href={secureAccountURL}
                    className={cn(
                      "inline-block whitespace-nowrap rounded-none text-sm font-medium py-2.5 px-6 bg-primary text-primary-foreground no-underline",
                      classNames?.button
                    )}
                  >
                    {localization.I_DIDNT_MAKE_THIS_CHANGE}
                  </Button>
                </Section>
              )}

              <Hr
                className={cn(
                  "my-6 w-full border border-solid border-border",
                  classNames?.separator
                )}
              />

              {appName && (
                <Text
                  className={cn(
                    "mb-3 text-xs text-muted-foreground",
                    classNames?.description
                  )}
                >
                  {localization.EMAIL_SENT_BY.replace("{appName}", appName)}
                </Text>
              )}

              <Text
                className={cn(
                  "mt-3 text-xs text-muted-foreground",
                  classNames?.description
                )}
              >
                {(() => {
                  const [beforeSupportEmail, afterSupportEmail] =
                    localization.IF_YOU_DIDNT_AUTHORIZE_THIS_CHANGE.split(
                      "{supportEmail}"
                    )

                  return supportEmail ? (
                    <>
                      {beforeSupportEmail}
                      <Link
                        href={`mailto:${supportEmail}`}
                        className={cn(
                          "text-primary underline",
                          classNames?.link
                        )}
                      >
                        {supportEmail}
                      </Link>
                      {afterSupportEmail}
                    </>
                  ) : (
                    localization.IF_YOU_DIDNT_AUTHORIZE_THIS_CHANGE.replace(
                      "{supportEmail}",
                      ""
                    )
                      .replace(/\s{2,}/g, " ")
                      .replace(" .", ".")
                  )
                })()}
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

PasswordChangedEmail.localization = passwordChangedEmailLocalization

PasswordChangedEmail.PreviewProps = {
  email: "m@example.com",
  timestamp: "February 10, 2025 at 4:20 PM UTC",
  secureAccountURL: "https://better-auth-ui.com/account/security",
  appName: "Better Auth",
  supportEmail: "support@example.com",
  darkMode: true
} as PasswordChangedEmailProps

export default PasswordChangedEmail
