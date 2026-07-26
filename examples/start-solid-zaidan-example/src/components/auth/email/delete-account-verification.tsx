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

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ")
}

const deleteAccountVerificationEmailLocalization = {
  ACCOUNT_DELETION_REQUESTED: "Account deletion requested",
  CONFIRM_ACCOUNT_DELETION: "Confirm account deletion",
  LOGO: "Logo",
  WE_RECEIVED_ACCOUNT_DELETION_REQUEST:
    "We received a request to permanently delete your {appName} account.",
  ACCOUNT: "Account:",
  DELETION_IS_PERMANENT:
    "Deleting your account removes its data permanently. This action cannot be undone.",
  DELETE_MY_ACCOUNT: "Delete my account",
  OR_COPY_AND_PASTE_URL: "Or copy and paste this URL into your browser:",
  THIS_LINK_EXPIRES_IN_HOURS: "This link expires in {expirationHours} hours.",
  EMAIL_SENT_BY: "Email sent by {appName}.",
  IF_YOU_DIDNT_REQUEST_ACCOUNT_DELETION:
    "If you didn't request account deletion, you can safely ignore this email. Your account will remain active.",
  POWERED_BY_BETTER_AUTH: "Powered by {betterAuth}"
}

export type DeleteAccountVerificationEmailLocalization =
  typeof deleteAccountVerificationEmailLocalization

export interface DeleteAccountVerificationEmailProps {
  url: string
  email?: string
  appName?: string
  expirationHours?: number
  logoURL?: string | { light: string; dark: string }
  classNames?: EmailClassNames
  colors?: EmailColors
  poweredBy?: boolean
  darkMode?: boolean
  head?: JSX.Element
  localization?: Partial<DeleteAccountVerificationEmailLocalization>
}

function cleanSentence(value: string) {
  return value.replace(/\s{2,}/g, " ").replace(" .", ".")
}

export function DeleteAccountVerificationEmail(
  props: DeleteAccountVerificationEmailProps
) {
  const expirationHours = () => props.expirationHours ?? 24
  const darkMode = () => props.darkMode ?? true
  const localization = () => ({
    ...DeleteAccountVerificationEmail.localization,
    ...props.localization
  })
  const requestText = () =>
    cleanSentence(
      localization().WE_RECEIVED_ACCOUNT_DELETION_REQUEST.replace(
        "{appName}",
        props.appName || ""
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

      <Preview>{localization().ACCOUNT_DELETION_REQUESTED}</Preview>

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
                {localization().CONFIRM_ACCOUNT_DELETION}
              </Heading>

              <Text class={cn("text-sm", props.classNames?.content)}>
                {requestText()}
              </Text>

              <Show when={props.email}>
                {(email) => (
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
                      {localization().ACCOUNT}
                    </Text>
                    <Text
                      class={cn(
                        "m-0 font-semibold text-sm",
                        props.classNames?.content
                      )}
                    >
                      {email()}
                    </Text>
                  </Section>
                )}
              </Show>

              <Text
                class={cn("font-semibold text-sm", props.classNames?.content)}
              >
                {localization().DELETION_IS_PERMANENT}
              </Text>

              <Section class="my-6">
                <Button
                  class={cn(
                    "inline-block whitespace-nowrap rounded-none bg-primary px-6 py-2.5 font-medium text-primary-foreground text-sm no-underline",
                    props.classNames?.button
                  )}
                  href={props.url}
                >
                  {localization().DELETE_MY_ACCOUNT}
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
                {localization().THIS_LINK_EXPIRES_IN_HOURS.replace(
                  "{expirationHours}",
                  expirationHours().toString()
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
                {localization().IF_YOU_DIDNT_REQUEST_ACCOUNT_DELETION}
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

DeleteAccountVerificationEmail.localization =
  deleteAccountVerificationEmailLocalization

DeleteAccountVerificationEmail.PreviewProps = {
  url: "https://better-auth-ui.com/api/auth/delete-user/callback?token=example-token",
  email: "user@example.com",
  appName: "Better Auth",
  poweredBy: true,
  darkMode: true
} satisfies DeleteAccountVerificationEmailProps

export default DeleteAccountVerificationEmail
