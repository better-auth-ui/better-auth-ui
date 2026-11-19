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

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}

const resetPasswordEmailLocalization = {
  RESET_YOUR_PASSWORD: "Reset your password",
  LOGO: "Logo",
  WE_RECEIVED_REQUEST_TO_RESET_PASSWORD:
    "We received a request to reset the password for your {appName} account {email}.",
  RESET_PASSWORD: "Reset password",
  OR_COPY_AND_PASTE_URL: "Or copy and paste this URL into your browser:",
  THIS_LINK_EXPIRES_IN_MINUTES:
    "This link expires in {expirationMinutes} minutes.",
  EMAIL_SENT_BY: "Email sent by {appName}.",
  IF_YOU_DIDNT_REQUEST_PASSWORD_RESET:
    "If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.",
  POWERED_BY_BETTER_AUTH: "Powered by {betterAuth}"
}

export type ResetPasswordEmailLocalization =
  typeof resetPasswordEmailLocalization

export type ResetPasswordEmailProps = {
  url: string
  email?: string
  appName?: string
  expirationMinutes?: number
  logoURL?: string | { light: string; dark: string }
  classNames?: EmailClassNames
  colors?: EmailColors
  poweredBy?: boolean
  darkMode?: boolean
  head?: JSX.Element
  localization?: Partial<ResetPasswordEmailLocalization>
}

function cleanSentence(value: string) {
  return value.replaceAll(/\s{2,}/gu, " ").replace(" .", ".")
}

export function ResetPasswordEmail(props: ResetPasswordEmailProps) {
  const expirationMinutes = () => props.expirationMinutes ?? 60
  const darkMode = () => props.darkMode ?? true
  const localization = () => ({
    ...ResetPasswordEmail.localization,
    ...props.localization
  })
  const requestText = () =>
    cleanSentence(
      localization()
        .WE_RECEIVED_REQUEST_TO_RESET_PASSWORD.replace(
          "{appName}",
          props.appName || ""
        )
        .replace("{email}", props.email || "")
    )

  return (
    <Html>
      <Head>
        <meta content="light dark" name="color-scheme" />
        <meta content="light dark" name="supported-color-schemes" />
        <EmailStyles colors={props.colors} darkMode={darkMode()} />
        {props.head}
      </Head>

      <Preview>{localization().RESET_YOUR_PASSWORD}</Preview>

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
                {localization().RESET_YOUR_PASSWORD}
              </Heading>

              <Text class={cn("text-sm", props.classNames?.content)}>
                {requestText()}
              </Text>

              <Section class="my-6">
                <Button
                  class={cn(
                    "inline-block whitespace-nowrap rounded-none bg-primary px-6 py-2.5 font-medium text-primary-foreground text-sm no-underline",
                    props.classNames?.button
                  )}
                  href={props.url}
                >
                  {localization().RESET_PASSWORD}
                </Button>
              </Section>

              <Text
                class={cn(
                  "m-0 mb-3 text-muted-foreground text-xs",
                  props.classNames?.description
                )}
              >
                {localization().OR_COPY_AND_PASTE_URL}
              </Text>

              <Link
                class={cn(
                  "break-all text-primary text-xs",
                  props.classNames?.link
                )}
                href={props.url}
              >
                {props.url}
              </Link>

              <Hr
                class={cn(
                  "my-6 w-full border border-border border-solid",
                  props.classNames?.separator
                )}
              />

              <Text
                class={cn(
                  "m-0 mb-3 text-muted-foreground text-xs",
                  props.classNames?.description
                )}
              >
                {localization().THIS_LINK_EXPIRES_IN_MINUTES.replace(
                  "{expirationMinutes}",
                  expirationMinutes().toString()
                )}
                <Show when={props.appName}>
                  {(appName) =>
                    ` ${localization().EMAIL_SENT_BY.replace("{appName}", appName())}`
                  }
                </Show>
              </Text>

              <Text
                class={cn(
                  "m-0 text-muted-foreground text-xs",
                  props.classNames?.description
                )}
              >
                {localization().IF_YOU_DIDNT_REQUEST_PASSWORD_RESET}
              </Text>

              <Show when={props.poweredBy}>
                <Text
                  class={cn(
                    "m-0 mt-4 text-center text-[11px] text-muted-foreground",
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

ResetPasswordEmail.localization = resetPasswordEmailLocalization

ResetPasswordEmail.PreviewProps = {
  url: "https://better-auth-ui.com/auth/reset-password?token=example-token",
  email: "m@example.com",
  appName: "Better Auth",
  darkMode: true
} satisfies ResetPasswordEmailProps

export default ResetPasswordEmail
