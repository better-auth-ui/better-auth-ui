import { authMutationKeys } from "@better-auth-ui/core"
import type { MagicLinkAuthClient } from "@better-auth-ui/core/plugins/magic-link"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useSignInMagicLink } from "@better-auth-ui/react/plugins/magic-link"
import {
  Button,
  Card,
  type CardProps,
  cn,
  Description,
  FieldError,
  Form,
  Input,
  Label,
  Link,
  Spinner,
  TextField,
  toast
} from "@heroui/react"
import { useIsMutating } from "@tanstack/react-query"
import { type SyntheticEvent, useState } from "react"

import { magicLinkPlugin } from "../../../lib/auth/magic-link-plugin"
import { FieldSeparator } from "../field-separator"
import { ProviderButtons, type SocialLayout } from "../provider-buttons"

export type MagicLinkProps = {
  className?: string
  socialLayout?: SocialLayout
  socialPosition?: "top" | "bottom"
  variant?: CardProps["variant"]
}

/**
 * Magic-link sign-in form.
 *
 * @param socialLayout - Provider button layout.
 * @param socialPosition - `"top"` or `"bottom"`. Defaults to `"bottom"`.
 * @param variant - Card variant.
 */
export function MagicLink({
  className,
  socialLayout,
  socialPosition = "bottom",
  variant
}: MagicLinkProps) {
  const {
    authClient,
    basePaths,
    baseURL,
    emailAndPassword,
    localization,
    plugins,
    redirectTo,
    socialProviders,
    viewPaths
  } = useAuth()
  const { localization: magicLinkLocalization } = useAuthPlugin(magicLinkPlugin)

  const [email, setEmail] = useState("")

  const { mutate: signInMagicLink, isPending: signInMagicLinkPending } =
    useSignInMagicLink(authClient as MagicLinkAuthClient, {
      onSuccess: () => {
        setEmail("")
        toast.success(magicLinkLocalization.magicLinkSent)
      }
    })

  const signInMutating = useIsMutating({
    mutationKey: authMutationKeys.signIn.all
  })
  const signUpMutating = useIsMutating({
    mutationKey: authMutationKeys.signUp.all
  })
  const isPending = signInMutating + signUpMutating > 0

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    signInMagicLink({ email, callbackURL: `${baseURL}${redirectTo}` })
  }

  const showSeparator = !!socialProviders?.length

  return (
    <Card
      className={cn("w-full max-w-sm gap-4 md:p-6", className)}
      variant={variant}
    >
      <Card.Header>
        <Card.Title className="text-xl font-semibold mb-1">
          {localization.auth.signIn}
        </Card.Title>
      </Card.Header>

      <Card.Content className="gap-4">
        {socialPosition === "top" && (
          <>
            {!!socialProviders?.length && (
              <ProviderButtons socialLayout={socialLayout} />
            )}

            {showSeparator && (
              <FieldSeparator>{localization.auth.or}</FieldSeparator>
            )}
          </>
        )}

        <Form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <TextField
            name="email"
            type="email"
            autoComplete="email"
            isDisabled={isPending}
            value={email}
            onChange={setEmail}
          >
            <Label>{localization.auth.email}</Label>

            <Input
              placeholder={localization.auth.emailPlaceholder}
              required
              variant={variant === "transparent" ? "primary" : "secondary"}
            />

            <FieldError />
          </TextField>

          <div className="flex flex-col gap-3">
            <Button type="submit" className="w-full" isPending={isPending}>
              {signInMagicLinkPending && <Spinner color="current" size="sm" />}

              {magicLinkLocalization.sendMagicLink}
            </Button>

            {plugins.flatMap((plugin) =>
              (plugin.authButtons ?? []).map((AuthButton, index) => (
                <AuthButton
                  key={`${plugin.id}-${index.toString()}`}
                  view="magicLink"
                />
              ))
            )}
          </div>
        </Form>

        {socialPosition === "bottom" && (
          <>
            {showSeparator && (
              <FieldSeparator>{localization.auth.or}</FieldSeparator>
            )}

            {!!socialProviders?.length && (
              <ProviderButtons socialLayout={socialLayout} />
            )}
          </>
        )}
      </Card.Content>

      {emailAndPassword?.enabled && (
        <Card.Footer className="flex-col gap-3">
          <Description className="text-sm">
            {localization.auth.needToCreateAnAccount}{" "}
            <Link
              href={`${basePaths.auth}/${viewPaths.auth.signUp}`}
              className="text-accent no-underline hover:underline decoration-accent-hover"
            >
              {localization.auth.signUp}
            </Link>
          </Description>
        </Card.Footer>
      )}
    </Card>
  )
}
