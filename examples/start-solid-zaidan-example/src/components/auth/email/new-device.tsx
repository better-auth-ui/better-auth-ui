import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Tailwind,
  Text
} from "@solidjs-email/main"
import type { JSX } from "solid-js"
import { Show } from "solid-js"
import {
  type EmailClassNames,
  type EmailColors,
  EmailStyles
} from "./email-styles"

export type DeviceInfo = {
  browser?: string
  os?: string
  location?: string
  ipAddress?: string
  timestamp?: string
}

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ")
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

export type NewDeviceEmailLocalization = typeof newDeviceEmailLocalization

export type NewDeviceEmailProps = {
  userEmail?: string
  deviceInfo?: DeviceInfo
  secureAccountLink?: string
  appName?: string
  supportEmail?: string
  logoURL?: string | { light: string; dark: string }
  classNames?: EmailClassNames
  colors?: EmailColors
  poweredBy?: boolean
  darkMode?: boolean
  head?: JSX.Element
  localization?: Partial<NewDeviceEmailLocalization>
}

function cleanSentence(value: string) {
  return value.replaceAll(/\s{2,}/gu, " ").replace(" .", ".")
}

export function NewDeviceEmail(props: NewDeviceEmailProps) {
  const darkMode = () => props.darkMode ?? true
  const localization = () => ({
    ...NewDeviceEmail.localization,
    ...props.localization
  })
  const signInText = () =>
    cleanSentence(
      localization()
        .NEW_SIGN_IN_TO_YOUR_ACCOUNT.replace("{appName}", props.appName || "")
        .replace("{userEmail}", props.userEmail || "")
    )
  const supportText = () =>
    cleanSentence(
      localization().IF_YOU_DIDNT_SIGN_IN.replace(
        "{supportEmail}",
        props.supportEmail || ""
      )
    )

  return (
    <Html>
      <Head>
        <meta content="light dark" name="color-scheme" />
        <meta content="light dark" name="supported-color-schemes" />
        <EmailStyles colors={props.colors} darkMode={darkMode()} />
        {props.head}
      </Head>

      <Preview>{localization().NEW_SIGN_IN_DETECTED}</Preview>

      <Tailwind>
        <Body
          class={cn("bg-background", props.classNames?.body)}
          style={{ "font-family": "Arial, Helvetica, sans-serif" }}
        >
          <Container
            class={cn(
              "mx-auto my-auto max-w-xl px-2 py-10",
              props.classNames?.container
            )}
          >
            <Section
              class={cn(
                "rounded-none border border-border bg-card p-8 text-card-foreground",
                props.classNames?.card
              )}
            >
              {props.logoURL &&
                (typeof props.logoURL === "string" ? (
                  <Img
                    alt={props.appName || localization().LOGO}
                    class={cn("mx-auto mb-8", props.classNames?.logo)}
                    height={48}
                    src={props.logoURL}
                    width={48}
                  />
                ) : (
                  <>
                    <Img
                      alt={props.appName || localization().LOGO}
                      class={cn(
                        "logo-light mx-auto mb-8",
                        props.classNames?.logo
                      )}
                      height={48}
                      src={props.logoURL.light}
                      width={48}
                    />
                    <Img
                      alt={props.appName || localization().LOGO}
                      class={cn(
                        "logo-dark hidden mx-auto mb-8",
                        props.classNames?.logo
                      )}
                      height={48}
                      src={props.logoURL.dark}
                      width={48}
                    />
                  </>
                ))}

              <Heading
                class={cn(
                  "m-0 mb-5 font-semibold text-2xl",
                  props.classNames?.title
                )}
              >
                {localization().NEW_SIGN_IN_DETECTED}
              </Heading>

              <Text
                class={cn("font-normal text-sm", props.classNames?.content)}
              >
                {signInText()}
              </Text>

              <Show when={props.deviceInfo}>
                {(deviceInfo) => (
                  <Section
                    class={cn(
                      "my-6 border border-border bg-muted p-4",
                      props.classNames?.codeBlock
                    )}
                  >
                    <Text
                      class={cn(
                        "m-0 mb-3 text-muted-foreground text-xs",
                        props.classNames?.description
                      )}
                    >
                      {localization().DEVICE_DETAILS}:
                    </Text>

                    <Show when={deviceInfo().browser}>
                      {(browser) => (
                        <Text
                          class={cn(
                            "m-0 mb-2 text-sm",
                            props.classNames?.content
                          )}
                        >
                          {localization().BROWSER}: {browser()}
                        </Text>
                      )}
                    </Show>

                    <Show when={deviceInfo().os}>
                      {(os) => (
                        <Text
                          class={cn(
                            "m-0 mb-2 text-sm",
                            props.classNames?.content
                          )}
                        >
                          {localization().OPERATING_SYSTEM}: {os()}
                        </Text>
                      )}
                    </Show>

                    <Show when={deviceInfo().location}>
                      {(location) => (
                        <Text
                          class={cn(
                            "m-0 mb-2 text-sm",
                            props.classNames?.content
                          )}
                        >
                          {localization().LOCATION}: {location()}
                        </Text>
                      )}
                    </Show>

                    <Show when={deviceInfo().ipAddress}>
                      {(ipAddress) => (
                        <Text
                          class={cn(
                            "m-0 mb-2 text-sm",
                            props.classNames?.content
                          )}
                        >
                          {localization().IP_ADDRESS}: {ipAddress()}
                        </Text>
                      )}
                    </Show>

                    <Show when={deviceInfo().timestamp}>
                      {(timestamp) => (
                        <Text
                          class={cn("m-0 text-sm", props.classNames?.content)}
                        >
                          {localization().TIME}: {timestamp()}
                        </Text>
                      )}
                    </Show>
                  </Section>
                )}
              </Show>

              <Text
                class={cn("font-normal text-sm", props.classNames?.content)}
              >
                {localization().IF_THIS_WAS_YOU}
              </Text>

              <Show when={props.secureAccountLink}>
                {(secureAccountLink) => (
                  <Section class="mt-6">
                    <Button
                      class={cn(
                        "inline-block whitespace-nowrap rounded-none bg-primary px-6 py-2.5 font-medium text-primary-foreground text-sm no-underline",
                        props.classNames?.button
                      )}
                      href={secureAccountLink()}
                    >
                      {localization().SECURE_MY_ACCOUNT}
                    </Button>
                  </Section>
                )}
              </Show>

              <Hr
                class={cn(
                  "my-6 w-full border border-border border-solid",
                  props.classNames?.separator
                )}
              />

              <Show when={props.appName}>
                {(appName) => (
                  <Text
                    class={cn(
                      "mb-3 text-muted-foreground text-xs",
                      props.classNames?.description
                    )}
                  >
                    {localization().EMAIL_SENT_BY.replace(
                      "{appName}",
                      appName()
                    )}
                  </Text>
                )}
              </Show>

              <Text
                class={cn(
                  "mt-3 text-muted-foreground text-xs",
                  props.classNames?.description
                )}
              >
                {supportText()}
              </Text>

              <Show when={props.poweredBy}>
                <Text
                  class={cn(
                    "mt-4 mb-0 text-center text-[11px] text-muted-foreground",
                    props.classNames?.poweredBy
                  )}
                >
                  {localization().POWERED_BY_BETTER_AUTH.replace(
                    "{betterAuth}",
                    "better-auth"
                  )}
                </Text>
              </Show>
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
} satisfies NewDeviceEmailProps

export default NewDeviceEmail
