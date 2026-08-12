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

const organizationInvitationEmailLocalization = {
  YOU_RE_INVITED_TO_ORGANIZATION: "You're invited to {organizationName}",
  YOU_RE_INVITED: "You're invited",
  LOGO: "Logo",
  ORGANIZATION_LOGO: "Organization logo",
  INVITED_TO_JOIN_ORGANIZATION:
    "{inviterName} ({inviterEmail}) has invited you to join {organizationName} on {appName} as a {role}.",
  ACCEPT_INVITATION: "Accept invitation",
  VIEW_INVITATION: "View invitation",
  OR_COPY_AND_PASTE_URL: "Or copy and paste this URL into your browser:",
  THIS_INVITATION_EXPIRES_IN_HOURS:
    "This invitation expires in {expirationHours} hours.",
  EMAIL_SENT_BY: "Email sent by {appName}.",
  IF_YOU_DIDNT_EXPECT_THIS_INVITATION:
    "If you didn't expect this invitation, you can safely ignore this email.",
  POWERED_BY_BETTER_AUTH: "Powered by {betterAuth}"
}

export type OrganizationInvitationEmailLocalization =
  typeof organizationInvitationEmailLocalization

export interface OrganizationInvitationEmailProps {
  url: string
  email?: string
  inviterName?: string
  inviterEmail?: string
  organizationName?: string
  organizationLogoURL?: string | { light: string; dark: string }
  role?: string
  appName?: string
  expirationHours?: number
  logoURL?: string | { light: string; dark: string }
  classNames?: EmailClassNames
  colors?: EmailColors
  poweredBy?: boolean
  darkMode?: boolean
  head?: JSX.Element
  localization?: Partial<OrganizationInvitationEmailLocalization>
}

function cleanSentence(value: string) {
  return value.replace(/\s{2,}/g, " ").replace(" .", ".")
}

export function OrganizationInvitationEmail(
  props: OrganizationInvitationEmailProps
) {
  const expirationHours = () => props.expirationHours ?? 48
  const darkMode = () => props.darkMode ?? true
  const localization = () => ({
    ...OrganizationInvitationEmail.localization,
    ...props.localization
  })
  const title = () =>
    props.organizationName
      ? localization().YOU_RE_INVITED_TO_ORGANIZATION.replace(
          "{organizationName}",
          props.organizationName
        )
      : localization().YOU_RE_INVITED
  const invitationText = () => {
    const inviterName = props.inviterName || "Someone"
    const inviterEmail = props.inviterEmail || ""

    return cleanSentence(
      localization()
        .INVITED_TO_JOIN_ORGANIZATION.replace("{inviterName}", inviterName)
        .replace("{inviterEmail}", inviterEmail)
        .replace("{organizationName}", props.organizationName || "")
        .replace("{appName}", props.appName || "")
        .replace("{role}", props.role || "")
        .replace("()", "")
    )
  }

  return (
    <Html>
      <Head>
        <meta content="light dark" name="color-scheme" />
        <meta content="light dark" name="supported-color-schemes" />
        <EmailStyles colors={props.colors} darkMode={darkMode()} />
        {props.head}
      </Head>

      <Preview>{title()}</Preview>

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
                {title()}
              </Heading>

              {props.organizationLogoURL &&
                (typeof props.organizationLogoURL === "string" ? (
                  <Img
                    alt={
                      props.organizationName || localization().ORGANIZATION_LOGO
                    }
                    class={cn("mb-5 rounded-md", props.classNames?.logo)}
                    height={56}
                    src={props.organizationLogoURL}
                    width={56}
                  />
                ) : (
                  <>
                    <Img
                      alt={
                        props.organizationName ||
                        localization().ORGANIZATION_LOGO
                      }
                      class={cn(
                        "logo-light mb-5 rounded-md",
                        props.classNames?.logo
                      )}
                      height={56}
                      src={props.organizationLogoURL.light}
                      width={56}
                    />
                    <Img
                      alt={
                        props.organizationName ||
                        localization().ORGANIZATION_LOGO
                      }
                      class={cn(
                        "logo-dark hidden mb-5 rounded-md",
                        props.classNames?.logo
                      )}
                      height={56}
                      src={props.organizationLogoURL.dark}
                      width={56}
                    />
                  </>
                ))}

              <Text
                class={cn("m-0 font-normal text-sm", props.classNames?.content)}
              >
                {invitationText()}
              </Text>

              <Section class="my-6">
                <Button
                  class={cn(
                    "inline-block whitespace-nowrap rounded-none bg-primary px-6 py-2.5 font-medium text-primary-foreground text-sm no-underline",
                    props.classNames?.button
                  )}
                  href={props.url}
                >
                  {localization().ACCEPT_INVITATION}
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
                {localization().THIS_INVITATION_EXPIRES_IN_HOURS.replace(
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
                {localization().IF_YOU_DIDNT_EXPECT_THIS_INVITATION}
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

OrganizationInvitationEmail.localization =
  organizationInvitationEmailLocalization

OrganizationInvitationEmail.PreviewProps = {
  url: "https://better-auth-ui.com/auth/accept-invitation?invitationId=example",
  email: "m@example.com",
  inviterName: "Jane Doe",
  inviterEmail: "jane@example.com",
  organizationName: "Acme Inc.",
  role: "member",
  appName: "Better Auth",
  expirationHours: 48,
  darkMode: true
} satisfies OrganizationInvitationEmailProps

export default OrganizationInvitationEmail
