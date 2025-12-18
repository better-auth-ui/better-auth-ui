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

/**
 * Device information displayed in the new device email notification.
 */
export interface DeviceInfo {
  /** Browser name and version */
  browser?: string
  /** Operating system name and version */
  os?: string
  /** Geographic location of the sign-in */
  location?: string
  /** IP address of the device */
  ipAddress?: string
  /** Timestamp of the sign-in event */
  timestamp?: string
}

const newDeviceEmailLocalization = {
  NEW_SIGN_IN_DETECTED: "New sign-in detected",
  LOGO: "Logo",
  NEW_SIGN_IN_TO_YOUR_ACCOUNT:
    "We detected a new sign-in to your {appName} account {userEmail} from a device we don't recognize.",
  DEVICE_DETAILS: "Device details",
  BROWSER: "Browser",
  OPERATING_SYSTEM: "Operating System",
  LOCATION: "Location",
  IP_ADDRESS: "IP Address",
  TIME: "Time",
  IF_THIS_WAS_YOU:
    "If this was you, you can safely ignore this email. If you don't recognize this activity, please secure your account immediately.",
  SECURE_MY_ACCOUNT: "Secure my account",
  EMAIL_SENT_BY: "Email sent by {appName}.",
  IF_YOU_DIDNT_SIGN_IN:
    "If you didn't sign in, please contact support immediately {supportEmail} to secure your account.",
  POWERED_BY_BETTER_AUTH: "Powered by {betterAuth}"
}

/**
 * Localization strings for the NewDeviceEmail component.
 *
 * Contains all text content used in the new device detection email template.
 */
export type NewDeviceEmailLocalization = typeof newDeviceEmailLocalization

/**
 * Props for the NewDeviceEmail component.
 */
export interface NewDeviceEmailProps {
  /** Email address of the user account */
  userEmail?: string
  /** Information about the device that signed in */
  deviceInfo?: DeviceInfo
  /** URL to secure the account if unauthorized access is suspected */
  secureAccountLink?: string
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
  localization?: Partial<NewDeviceEmailLocalization>
}

/**
 * Email template component that notifies users when a new device signs into their account.
 *
 * This email includes:
 * - Device information display (browser, OS, location, IP, timestamp)
 * - Secure account action button
 * - Security warnings and support contact information
 * - Customizable branding and styling
 * - Support for light/dark mode themes
 *
 * @example
 * ```tsx
 * <NewDeviceEmail
 *   userEmail="user@example.com"
 *   deviceInfo={{
 *     browser: "Chrome on macOS",
 *     os: "macOS 14.0",
 *     location: "San Francisco, CA",
 *     ipAddress: "192.168.1.1",
 *     timestamp: "February 10, 2025 at 4:20 PM UTC"
 *   }}
 *   secureAccountLink="https://example.com/secure-account"
 *   appName="My App"
 *   supportEmail="support@example.com"
 *   darkMode={true}
 * />
 * ```
 */
export const NewDeviceEmail = ({
  userEmail,
  deviceInfo,
  secureAccountLink,
  appName,
  supportEmail,
  logoURL = "https://better-auth.com/logo.png",
  colors,
  classNames,
  darkMode = true,
  poweredBy,
  head,
  ...props
}: NewDeviceEmailProps) => {
  const localization = {
    ...NewDeviceEmail.localization,
    ...props.localization
  }

  const previewText = localization.NEW_SIGN_IN_DETECTED

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
                {localization.NEW_SIGN_IN_DETECTED}
              </Heading>

              <Text className={cn("text-sm font-normal", classNames?.content)}>
                {(() => {
                  const textWithAppName =
                    localization.NEW_SIGN_IN_TO_YOUR_ACCOUNT.replace(
                      "{appName}",
                      appName || ""
                    )
                      .replace(/\s{2,}/g, " ")
                      .replace(" .", ".")

                  const [beforeUserEmail, afterUserEmail] =
                    textWithAppName.split("{userEmail}")

                  return userEmail ? (
                    <>
                      {beforeUserEmail}

                      <Link
                        href={`mailto:${userEmail}`}
                        className="text-primary font-medium"
                      >
                        {userEmail}
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

              {deviceInfo && (
                <Section
                  className={cn(
                    "my-6 border border-border bg-muted p-4",
                    classNames?.codeBlock
                  )}
                >
                  <Text
                    className={cn(
                      "m-0 mb-3 text-xs text-muted-foreground",
                      classNames?.description
                    )}
                  >
                    {localization.DEVICE_DETAILS}:
                  </Text>

                  {deviceInfo.browser && (
                    <Text
                      className={cn("m-0 mb-2 text-sm", classNames?.content)}
                    >
                      <span className="font-semibold">
                        {localization.BROWSER}:
                      </span>{" "}
                      {deviceInfo.browser}
                    </Text>
                  )}

                  {deviceInfo.os && (
                    <Text
                      className={cn("m-0 mb-2 text-sm", classNames?.content)}
                    >
                      <span className="font-semibold">
                        {localization.OPERATING_SYSTEM}:
                      </span>{" "}
                      {deviceInfo.os}
                    </Text>
                  )}

                  {deviceInfo.location && (
                    <Text
                      className={cn("m-0 mb-2 text-sm", classNames?.content)}
                    >
                      <span className="font-semibold">
                        {localization.LOCATION}:
                      </span>{" "}
                      {deviceInfo.location}
                    </Text>
                  )}

                  {deviceInfo.ipAddress && (
                    <Text
                      className={cn("m-0 mb-2 text-sm", classNames?.content)}
                    >
                      <span className="font-semibold">
                        {localization.IP_ADDRESS}:
                      </span>{" "}
                      {deviceInfo.ipAddress}
                    </Text>
                  )}

                  {deviceInfo.timestamp && (
                    <Text className={cn("m-0 text-sm", classNames?.content)}>
                      <span className="font-semibold">
                        {localization.TIME}:
                      </span>{" "}
                      {deviceInfo.timestamp}
                    </Text>
                  )}
                </Section>
              )}

              <Text className={cn("text-sm font-normal", classNames?.content)}>
                {localization.IF_THIS_WAS_YOU}
              </Text>

              {secureAccountLink && (
                <Section className="mt-6">
                  <Button
                    href={secureAccountLink}
                    className={cn(
                      "inline-block whitespace-nowrap rounded-none text-sm font-medium py-2.5 px-6 bg-primary text-primary-foreground no-underline",
                      classNames?.button
                    )}
                  >
                    {localization.SECURE_MY_ACCOUNT}
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
                    localization.IF_YOU_DIDNT_SIGN_IN.split("{supportEmail}")

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
                    localization.IF_YOU_DIDNT_SIGN_IN.replace(
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

NewDeviceEmail.localization = newDeviceEmailLocalization

NewDeviceEmail.PreviewProps = {
  userEmail: "m@example.com",
  deviceInfo: {
    browser: "Chrome on macOS",
    os: "macOS 26.2",
    location: "San Francisco, CA, United States",
    ipAddress: "127.0.0.1",
    timestamp: "February 10, 2025 at 4:20 PM UTC"
  },
  secureAccountLink: "https://better-auth-ui.com/auth/secure-account",
  appName: "Better Auth",
  supportEmail: "support@example.com",
  darkMode: true
} as NewDeviceEmailProps

export default NewDeviceEmail
