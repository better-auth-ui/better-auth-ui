import {
  Body,
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

export type OtpEmailEmailLocalization = typeof otpEmailLocalization

export interface OtpEmailProps {
  verificationCode: string
  email?: string
  appName?: string
  expirationMinutes?: number
  logoURL?: string | { light: string; dark: string }
  classNames?: EmailClassNames
  colors?: EmailColors
  poweredBy?: boolean
  darkMode?: boolean
  head?: JSX.Element
  localization?: Partial<OtpEmailEmailLocalization>
}

function cleanSentence(value: string) {
  return value.replaceAll(/\s{2,}/g, " ").replace(" .", ".")
}

export function OtpEmail(props: OtpEmailProps) {
  const expirationMinutes = () => props.expirationMinutes ?? 10
  const darkMode = () => props.darkMode ?? true
  const localization = () => ({
    ...OtpEmail.localization,
    ...props.localization
  })
  const previewText = () =>
    localization().YOUR_VERIFICATION_CODE_IS_CODE.replace(
      "{verificationCode}",
      props.verificationCode
    )
  const contentText = () =>
    cleanSentence(
      localization()
        .WE_NEED_TO_VERIFY_YOUR_EMAIL_ADDRESS.replace(
          "{email}",
          props.email || ""
        )
        .replace("{appName}", props.appName || "")
    )

  return (
    <Html>
      <Head>
        <meta content="light dark" name="color-scheme" />
        <meta content="light dark" name="supported-color-schemes" />
        <EmailStyles colors={props.colors} darkMode={darkMode()} />
        {props.head}
      </Head>

      <Preview>{previewText()}</Preview>

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
                  "mb-5 font-semibold text-2xl",
                  props.classNames?.title
                )}
              >
                {localization().VERIFY_YOUR_EMAIL}
              </Heading>

              <Text
                class={cn("font-normal text-sm", props.classNames?.content)}
              >
                {contentText()}
              </Text>

              <Section
                class={cn(
                  "my-6 border border-border bg-muted p-6",
                  props.classNames?.codeBlock
                )}
              >
                <Text
                  class={cn(
                    "m-0 text-center font-semibold text-4xl tracking-widest",
                    props.classNames?.title
                  )}
                >
                  {props.verificationCode}
                </Text>
              </Section>

              <Hr
                class={cn(
                  "my-6 w-full border border-border border-solid",
                  props.classNames?.separator
                )}
              />

              <Text
                class={cn(
                  "mb-3 text-muted-foreground text-xs",
                  props.classNames?.description
                )}
              >
                {localization().THIS_CODE_EXPIRES_IN_MINUTES.replace(
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
                  "mt-3 text-muted-foreground text-xs",
                  props.classNames?.description
                )}
              >
                {localization().IF_YOU_DIDNT_REQUEST_THIS_EMAIL}
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

OtpEmail.localization = otpEmailLocalization

OtpEmail.PreviewProps = {
  verificationCode: "069420",
  email: "m@example.com",
  appName: "Better Auth",
  darkMode: true
} satisfies OtpEmailProps

export default OtpEmail
