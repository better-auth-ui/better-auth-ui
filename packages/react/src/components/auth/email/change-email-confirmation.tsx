import type { ReactNode } from "react"
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
} from "react-email"

import { cn } from "../../../lib/utils"
import {
  type EmailClassNames,
  type EmailColors,
  EmailStyles
} from "./email-styles"

const changeEmailConfirmationEmailLocalization = {
  CONFIRM_EMAIL_CHANGE: "Confirm your email change",
  LOGO: "Logo",
  EMAIL_CHANGE_REQUESTED:
    "Someone requested to change the email address for your {appName} account.",
  CURRENT_EMAIL: "Current email:",
  NEW_EMAIL: "New email:",
  APPROVE_EMAIL_CHANGE: "Approve email change",
  OR_COPY_AND_PASTE_URL: "Or copy and paste this URL into your browser:",
  THIS_LINK_EXPIRES_IN_MINUTES:
    "This link expires in {expirationMinutes} minutes.",
  EMAIL_SENT_BY: "Email sent by {appName}.",
  IF_YOU_DIDNT_REQUEST_EMAIL_CHANGE:
    "If you didn't request this change, you can safely ignore this email. Your email address will stay the same.",
  POWERED_BY_BETTER_AUTH: "Powered by {betterAuth}"
}

/**
 * Localization strings for the ChangeEmailConfirmationEmail component.
 */
export type ChangeEmailConfirmationEmailLocalization =
  typeof changeEmailConfirmationEmailLocalization

/**
 * Props for the ChangeEmailConfirmationEmail component.
 */
export interface ChangeEmailConfirmationEmailProps {
  /** Confirmation URL sent by Better Auth to the user's current email address */
  url: string
  /** User's current email address */
  currentEmail?: string
  /** Requested new email address */
  newEmail?: string
  /** Name of the application sending the email */
  appName?: string
  /** Number of minutes until the confirmation link expires */
  expirationMinutes?: number
  /** Logo URL(s) - a single string or light/dark variants. If omitted, no logo is shown. */
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
  /**
   * Localization overrides for customizing email text
   * @remarks `ChangeEmailConfirmationEmailLocalization`
   */
  localization?: Partial<ChangeEmailConfirmationEmailLocalization>
}

/**
 * Email template for approving an email change from the current address.
 *
 * Use this template with Better Auth's
 * `user.changeEmail.sendChangeEmailConfirmation` callback. The email is sent
 * before the address changes, so it is separate from `EmailChangedEmail`.
 *
 * @example
 * ```tsx
 * <ChangeEmailConfirmationEmail
 *   url="https://example.com/api/auth/change-email/verify?token=abc123"
 *   currentEmail="current@example.com"
 *   newEmail="new@example.com"
 *   appName="My App"
 *   expirationMinutes={60}
 * />
 * ```
 */
export const ChangeEmailConfirmationEmail = ({
  url,
  currentEmail,
  newEmail,
  appName,
  expirationMinutes = 60,
  logoURL,
  colors,
  classNames,
  darkMode = true,
  poweredBy,
  head,
  ...props
}: ChangeEmailConfirmationEmailProps) => {
  const localization = {
    ...ChangeEmailConfirmationEmail.localization,
    ...props.localization
  }

  const requestText = localization.EMAIL_CHANGE_REQUESTED.replace(
    "{appName}",
    appName || ""
  )
    .replace(/\s{2,}/g, " ")
    .replace(" .", ".")

  return (
    <Html>
      <Head>
        <meta content="light dark" name="color-scheme" />
        <meta content="light dark" name="supported-color-schemes" />

        <EmailStyles colors={colors} darkMode={darkMode} />

        {head}
      </Head>

      <Preview>{localization.CONFIRM_EMAIL_CHANGE}</Preview>

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
                "rounded-none border border-border bg-card p-8 text-card-foreground",
                classNames?.card
              )}
            >
              {logoURL &&
                (typeof logoURL === "string" ? (
                  <Img
                    alt={appName || localization.LOGO}
                    className={cn("mx-auto mb-8", classNames?.logo)}
                    height={48}
                    src={logoURL}
                    width={48}
                  />
                ) : (
                  <>
                    <Img
                      alt={appName || localization.LOGO}
                      className={cn(
                        "logo-light mx-auto mb-8",
                        classNames?.logo
                      )}
                      height={48}
                      src={logoURL.light}
                      width={48}
                    />
                    <Img
                      alt={appName || localization.LOGO}
                      className={cn(
                        "logo-dark hidden mx-auto mb-8",
                        classNames?.logo
                      )}
                      height={48}
                      src={logoURL.dark}
                      width={48}
                    />
                  </>
                ))}

              <Heading
                className={cn(
                  "m-0 mb-5 text-2xl font-semibold",
                  classNames?.title
                )}
              >
                {localization.CONFIRM_EMAIL_CHANGE}
              </Heading>

              <Text className={cn("text-sm", classNames?.content)}>
                {requestText}
              </Text>

              {(currentEmail || newEmail) && (
                <Section
                  className={cn(
                    "my-6 border border-border bg-muted p-4",
                    classNames?.codeBlock
                  )}
                >
                  {currentEmail && (
                    <>
                      <Text
                        className={cn(
                          "m-0 mb-2 text-xs text-muted-foreground",
                          classNames?.description
                        )}
                      >
                        {localization.CURRENT_EMAIL}
                      </Text>
                      <Text
                        className={cn(
                          "m-0 text-sm font-semibold",
                          newEmail && "mb-4",
                          classNames?.content
                        )}
                      >
                        {currentEmail}
                      </Text>
                    </>
                  )}

                  {newEmail && (
                    <>
                      <Text
                        className={cn(
                          "m-0 mb-2 text-xs text-muted-foreground",
                          classNames?.description
                        )}
                      >
                        {localization.NEW_EMAIL}
                      </Text>
                      <Text
                        className={cn(
                          "m-0 text-sm font-semibold text-primary",
                          classNames?.content
                        )}
                      >
                        {newEmail}
                      </Text>
                    </>
                  )}
                </Section>
              )}

              <Section className="my-6">
                <Button
                  className={cn(
                    "inline-block whitespace-nowrap rounded-none bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground no-underline",
                    classNames?.button
                  )}
                  href={url}
                >
                  {localization.APPROVE_EMAIL_CHANGE}
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

              <Text
                className={cn(
                  "m-0 mb-3 text-xs text-muted-foreground",
                  classNames?.description
                )}
              >
                {localization.THIS_LINK_EXPIRES_IN_MINUTES.replace(
                  "{expirationMinutes}",
                  expirationMinutes.toString()
                )}
                {appName &&
                  ` ${localization.EMAIL_SENT_BY.replace("{appName}", appName)}`}
              </Text>

              <Text
                className={cn(
                  "m-0 text-xs text-muted-foreground",
                  classNames?.description
                )}
              >
                {localization.IF_YOU_DIDNT_REQUEST_EMAIL_CHANGE}
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
                          className={cn(
                            "text-primary underline",
                            classNames?.link
                          )}
                          href="https://better-auth.com"
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

ChangeEmailConfirmationEmail.localization =
  changeEmailConfirmationEmailLocalization

ChangeEmailConfirmationEmail.PreviewProps = {
  url: "https://better-auth-ui.com/api/auth/change-email/verify?token=example-token",
  currentEmail: "current@example.com",
  newEmail: "new@example.com",
  appName: "Better Auth",
  poweredBy: true,
  darkMode: true
} as ChangeEmailConfirmationEmailProps

export default ChangeEmailConfirmationEmail
