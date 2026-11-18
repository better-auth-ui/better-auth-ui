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

const emailChangedEmailLocalization = {
  YOUR_EMAIL_ADDRESS_HAS_BEEN_CHANGED: "Your email address has been changed",
  LOGO: "Logo",
  EMAIL_ADDRESS_CHANGED: "Email address changed",
  EMAIL_ADDRESS_FOR_YOUR_ACCOUNT_CHANGED:
    "The email address for your {appName} account has been changed.",
  PREVIOUS_EMAIL: "Previous email:",
  NEW_EMAIL: "New email:",
  IF_YOU_MADE_THIS_CHANGE:
    "If you made this change, you can safely ignore this email.",
  I_DIDNT_MAKE_THIS_CHANGE: "I didn't make this change",
  EMAIL_SENT_BY: "Email sent by {appName}.",
  IF_YOU_DIDNT_AUTHORIZE_THIS_CHANGE:
    "If you didn't authorize this change, please contact support immediately {supportEmail} to secure your account.",
  POWERED_BY_BETTER_AUTH: "Powered by {betterAuth}"
}

export type EmailChangedEmailLocalization = typeof emailChangedEmailLocalization

export interface EmailChangedEmailProps {
  oldEmail?: string
  newEmail?: string
  revertURL?: string
  appName?: string
  supportEmail?: string
  logoURL?: string | { light: string; dark: string }
  classNames?: EmailClassNames
  colors?: EmailColors
  poweredBy?: boolean
  darkMode?: boolean
  head?: JSX.Element
  localization?: Partial<EmailChangedEmailLocalization>
}

function cleanSentence(value: string) {
  return value.replaceAll(/\s{2,}/g, " ").replace(" .", ".")
}

export function EmailChangedEmail(props: EmailChangedEmailProps) {
  const darkMode = () => props.darkMode ?? true
  const localization = () => ({
    ...EmailChangedEmail.localization,
    ...props.localization
  })
  const accountText = () =>
    cleanSentence(
      localization().EMAIL_ADDRESS_FOR_YOUR_ACCOUNT_CHANGED.replace(
        "{appName}",
        props.appName || ""
      )
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

      <Preview>{localization().YOUR_EMAIL_ADDRESS_HAS_BEEN_CHANGED}</Preview>

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
                {localization().EMAIL_ADDRESS_CHANGED}
              </Heading>

              <Text
                class={cn("font-normal text-sm", props.classNames?.content)}
              >
                {accountText()}
              </Text>

              <Show when={props.oldEmail || props.newEmail}>
                <Section
                  class={cn(
                    "my-6 border border-border bg-muted p-4",
                    props.classNames?.codeBlock
                  )}
                >
                  <Show when={props.oldEmail}>
                    {(oldEmail) => (
                      <>
                        <Text
                          class={cn(
                            "m-0 mb-2 text-muted-foreground text-xs",
                            props.classNames?.description
                          )}
                        >
                          {localization().PREVIOUS_EMAIL}
                        </Text>
                        <Text
                          class={cn(
                            "m-0 mb-4 font-semibold text-sm",
                            props.classNames?.content
                          )}
                        >
                          {oldEmail()}
                        </Text>
                      </>
                    )}
                  </Show>

                  <Show when={props.newEmail}>
                    {(newEmail) => (
                      <>
                        <Text
                          class={cn(
                            "m-0 mb-2 text-muted-foreground text-xs",
                            props.classNames?.description
                          )}
                        >
                          {localization().NEW_EMAIL}
                        </Text>
                        <Text
                          class={cn(
                            "m-0 font-semibold text-primary text-sm",
                            props.classNames?.content
                          )}
                        >
                          {newEmail()}
                        </Text>
                      </>
                    )}
                  </Show>
                </Section>
              </Show>

              <Text
                class={cn("font-normal text-sm", props.classNames?.content)}
              >
                {localization().IF_YOU_MADE_THIS_CHANGE}
              </Text>

              <Show when={props.revertURL}>
                {(revertURL) => (
                  <Section class="my-6">
                    <Button
                      class={cn(
                        "inline-block whitespace-nowrap rounded-none bg-primary px-6 py-2.5 font-medium text-primary-foreground text-sm no-underline",
                        props.classNames?.button
                      )}
                      href={revertURL()}
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

EmailChangedEmail.localization = emailChangedEmailLocalization

EmailChangedEmail.PreviewProps = {
  oldEmail: "old@example.com",
  newEmail: "new@example.com",
  supportEmail: "support@example.com",
  revertURL: "https://better-auth-ui.com/auth/revert-email?token=example-token",
  appName: "Better Auth",
  poweredBy: true,
  darkMode: true
} satisfies EmailChangedEmailProps

export default EmailChangedEmail
