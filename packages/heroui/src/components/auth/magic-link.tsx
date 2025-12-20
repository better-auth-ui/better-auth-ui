import {
  type AnyAuthConfig,
  useSignInMagicLink,
  useSignInSocial
} from "@better-auth-ui/react"
import {
  Button,
  Card,
  Description,
  FieldError,
  Fieldset,
  Form,
  Input,
  Label,
  Spinner,
  TextField
} from "@heroui/react"

import { useAuth } from "../../hooks/use-auth"
import { cn } from "../../lib/utils"
import { FieldSeparator } from "./field-separator"
import { MagicLinkButton } from "./magic-link-button"
import { ProviderButtons, type SocialLayout } from "./provider-buttons"

export type MagicLinkProps = AnyAuthConfig & {
  className?: string
  socialLayout?: SocialLayout
  socialPosition?: "top" | "bottom"
}

/**
 * Render a sign-in card that sends an email magic link and optionally displays social provider buttons.
 *
 * @param className - Additional CSS class names applied to the card container
 * @param socialLayout - Layout variant used by social provider buttons
 * @param socialPosition - Position to render social provider buttons; either `"top"` or `"bottom"` (default: `"bottom"`)
 * @returns The rendered sign-in card element
 */
export function MagicLink({
  className,
  socialLayout,
  socialPosition = "bottom",
  ...config
}: MagicLinkProps) {
  const context = useAuth(config)

  const { basePaths, localization, socialProviders, viewPaths, Link } = context

  const [{ email }, signInMagicLink, magicLinkPending] =
    useSignInMagicLink(context)

  const [_, signInSocial, socialPending] = useSignInSocial(context)

  const isPending = magicLinkPending || socialPending

  const showSeparator = socialProviders && socialProviders.length > 0

  return (
    <Card className={cn("w-full max-w-sm p-4 md:p-6", className)}>
      <Card.Content>
        <Fieldset className="gap-4">
          <Fieldset.Legend className="text-xl">
            {localization.auth.signIn}
          </Fieldset.Legend>

          <Description />

          {socialPosition === "top" && (
            <>
              {socialProviders && socialProviders.length > 0 && (
                <ProviderButtons
                  {...config}
                  socialLayout={socialLayout}
                  signInSocial={signInSocial}
                  isPending={isPending}
                />
              )}

              {showSeparator && (
                <FieldSeparator>{localization.auth.or}</FieldSeparator>
              )}
            </>
          )}

          <Form action={signInMagicLink} className="flex flex-col gap-4">
            <Fieldset.Group>
              <TextField
                defaultValue={email}
                name="email"
                type="email"
                autoComplete="email"
                isDisabled={isPending}
              >
                <Label>{localization.auth.email}</Label>

                <Input
                  placeholder={localization.auth.emailPlaceholder}
                  required
                />

                <FieldError className="text-wrap" />
              </TextField>
            </Fieldset.Group>

            <Fieldset.Actions className="flex-col gap-3">
              <Button type="submit" className="w-full" isPending={isPending}>
                {isPending && <Spinner color="current" size="sm" />}

                {localization.auth.sendMagicLink}
              </Button>

              <MagicLinkButton
                {...config}
                view="magicLink"
                isPending={isPending}
              />
            </Fieldset.Actions>
          </Form>

          {socialPosition === "bottom" && (
            <>
              {showSeparator && (
                <FieldSeparator>{localization.auth.or}</FieldSeparator>
              )}

              {socialProviders && socialProviders.length > 0 && (
                <ProviderButtons
                  {...config}
                  socialLayout={socialLayout}
                  signInSocial={signInSocial}
                  isPending={isPending}
                />
              )}
            </>
          )}

          <Description className="flex justify-center gap-1.5 text-foreground text-sm">
            {localization.auth.needToCreateAnAccount}

            <Link
              href={`${basePaths.auth}/${viewPaths.auth.signUp}`}
              className="link link--underline-hover text-accent"
            >
              {localization.auth.signUp}
            </Link>
          </Description>
        </Fieldset>
      </Card.Content>
    </Card>
  )
}
