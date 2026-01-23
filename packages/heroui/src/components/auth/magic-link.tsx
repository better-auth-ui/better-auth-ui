import {
  useAuth,
  useSignInMagicLink,
  useSignInSocial
} from "@better-auth-ui/react"
import {
  Button,
  Card,
  type CardProps,
  Description,
  FieldError,
  Fieldset,
  Form,
  Input,
  Label,
  Link,
  Spinner,
  TextField,
  toast
} from "@heroui/react"
import { cn } from "../../lib/utils"
import { FieldSeparator } from "./field-separator"
import { MagicLinkButton } from "./magic-link-button"
import { ProviderButtons, type SocialLayout } from "./provider-buttons"

export type MagicLinkProps = {
  className?: string
  socialLayout?: SocialLayout
  socialPosition?: "top" | "bottom"
  variant?: CardProps["variant"]
}

/**
 * Render a card-based sign-in form that sends an email magic link and optionally shows social provider buttons.
 *
 * @param className - Additional CSS class names applied to the card container
 * @param socialLayout - Layout style for social provider buttons
 * @param socialPosition - Position of social provider buttons; `"top"` or `"bottom"`. Defaults to `"bottom"`.
 * @returns The magic-link sign-in UI as a JSX element
 */
export function MagicLink({
  className,
  socialLayout,
  socialPosition = "bottom",
  variant,
  ...props
}: MagicLinkProps & CardProps) {
  const { basePaths, localization, socialProviders, viewPaths } = useAuth()
  const [{ email }, signInMagicLink, magicLinkPending] = useSignInMagicLink({
    onError: (error) => toast.danger(error.message || error.statusText),
    onSuccess: () => toast.success(localization.auth.magicLinkSent)
  })
  const [_, signInSocial, socialPending] = useSignInSocial()

  const isPending = magicLinkPending || socialPending

  const showSeparator = socialProviders && socialProviders.length > 0

  return (
    <Card
      className={cn("w-full max-w-sm p-4 md:p-6", className)}
      variant={variant}
      {...props}
    >
      <Card.Content>
        <Fieldset className="gap-4">
          <Label className="text-xl">{localization.auth.signIn}</Label>

          {socialPosition === "top" && (
            <>
              {socialProviders && socialProviders.length > 0 && (
                <ProviderButtons
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
                  variant={variant === "transparent" ? "primary" : "secondary"}
                />

                <FieldError className="text-wrap" />
              </TextField>
            </Fieldset.Group>

            <Fieldset.Actions className="flex-col gap-3">
              <Button type="submit" className="w-full" isPending={isPending}>
                {isPending && <Spinner color="current" size="sm" />}

                {localization.auth.sendMagicLink}
              </Button>

              <MagicLinkButton view="magicLink" isPending={isPending} />
            </Fieldset.Actions>
          </Form>

          {socialPosition === "bottom" && (
            <>
              {showSeparator && (
                <FieldSeparator>{localization.auth.or}</FieldSeparator>
              )}

              {socialProviders && socialProviders.length > 0 && (
                <ProviderButtons
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
              className="text-accent decoration-accent no-underline hover:underline"
            >
              {localization.auth.signUp}
            </Link>
          </Description>
        </Fieldset>
      </Card.Content>
    </Card>
  )
}
