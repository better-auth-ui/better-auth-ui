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

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ")
}

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

export type PasswordChangedEmailLocalization =
  typeof passwordChangedEmailLocalization

export interface PasswordChangedEmailProps {
  email?: string
  timestamp?: string
  secureAccountURL?: string
  appName?: string
  supportEmail?: string
  logoURL?: string | { light: string; dark: string }
  classNames?: EmailClassNames
  colors?: EmailColors
  poweredBy?: boolean
  darkMode?: boolean
  head?: JSX.Element
  localization?: Partial<PasswordChangedEmailLocalization>
}

function cleanSentence(value: string) {
  return value.replaceAll(/\s{2,}/g, " ").replace(" .", ".")
}

export function PasswordChangedEmail(props: PasswordChangedEmailProps) {
  const darkMode = () => props.darkMode ?? true
  const localization = () => ({
    ...PasswordChangedEmail.localization,
    ...props.localization
  })
  const accountText = () =>
    cleanSentence(
      localization()
        .PASSWORD_FOR_YOUR_ACCOUNT_CHANGED.replace(
          "{appName}",
          props.appName || ""
        )
        .replace("{userEmail}", props.email || "")
    )
  const supportText = () =>
    cleanSentence(
      localization().IF_YOU_DIDNT_AUTHORIZE_THIS_CHANGE.replace(
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

      <Preview>{localization().YOUR_PASSWORD_HAS_BEEN_CHANGED}</Preview>

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
                {localization().PASSWORD_CHANGED_SUCCESSFULLY}
              </Heading>

              <Text
                class={cn("font-normal text-sm", props.classNames?.content)}
              >
                {accountText()}
              </Text>

              <Show when={props.timestamp}>
                {(timestamp) => (
                  <Section
                    class={cn(
                      "my-6 border border-border bg-muted p-4",
                      props.classNames?.codeBlock
                    )}
                  >
                    <Text
                      class={cn(
                        "m-0 mb-2 text-muted-foreground text-xs",
                        props.classNames?.description
                      )}
                    >
                      {localization().CHANGED_AT}:
                    </Text>
                    <Text
                      class={cn(
                        "m-0 font-semibold text-sm",
                        props.classNames?.content
                      )}
                    >
                      {timestamp()}
                    </Text>
                  </Section>
                )}
              </Show>

              <Text
                class={cn("font-normal text-sm", props.classNames?.content)}
              >
                {localization().IF_YOU_MADE_THIS_CHANGE}
              </Text>

              <Show when={props.secureAccountURL}>
                {(secureAccountURL) => (
                  <Section class="mt-6">
                    <Button
                      class={cn(
                        "inline-block whitespace-nowrap rounded-none bg-primary px-6 py-2.5 font-medium text-primary-foreground text-sm no-underline",
                        props.classNames?.button
                      )}
                      href={secureAccountURL()}
                    >
                      {localization().I_DIDNT_MAKE_THIS_CHANGE}
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

PasswordChangedEmail.localization = passwordChangedEmailLocalization

PasswordChangedEmail.PreviewProps = {
  email: "m@example.com",
  timestamp: "February 10, 2025 at 4:20 PM UTC",
  secureAccountURL: "https://better-auth-ui.com/settings/security",
  appName: "Better Auth",
  supportEmail: "support@example.com",
  darkMode: true
} satisfies PasswordChangedEmailProps

export default PasswordChangedEmail
