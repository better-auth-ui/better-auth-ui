import { useAuth, useChangeEmail, useSession } from "@better-auth-ui/react"
import { useEffect, useState } from "react"
import { cn } from "../../../../lib/cn"
import { Button } from "../../../../primitives/button"
import { Card, type CardVariant } from "../../../../primitives/card"
import { FieldError, Label, TextField } from "../../../../primitives/field"
import { Form } from "../../../../primitives/form"
import { Input } from "../../../../primitives/input"
import { Skeleton } from "../../../../primitives/skeleton"
import { Box, Txt } from "../../../../primitives/styled"
import { toast } from "../../../../primitives/toast"

export interface ChangeEmailProps {
  className?: string
  variant?: CardVariant
}

/**
 * Render a card containing a form to view and update the authenticated user's
 * email. Mirrors the heroui `ChangeEmail`, adapted for React Native: the field
 * is fully controlled (no `FormData`/`defaultValue` remount trick) and is
 * seeded from the session via `useEffect` once it resolves; the callback URL
 * is composed from `basePaths`/`viewPaths` instead of a DOM URL path.
 */
export function ChangeEmail({ className, variant }: ChangeEmailProps) {
  const { authClient, baseURL, basePaths, localization, viewPaths } = useAuth()
  const { data: session } = useSession(authClient)

  const { mutate: changeEmail, isPending } = useChangeEmail(authClient, {
    onSuccess: () => toast.success(localization.settings.changeEmailSuccess)
  })

  const [email, setEmail] = useState("")

  useEffect(() => {
    if (session) setEmail(session.user.email)
  }, [session])

  function handleSubmit() {
    changeEmail({
      newEmail: email,
      callbackURL: `${baseURL}${basePaths.settings}/${viewPaths.settings.account}`
    })
  }

  return (
    <Box>
      <Txt className={cn("text-sm font-semibold mb-3 text-foreground")}>
        {localization.settings.changeEmail}
      </Txt>

      <Card className={cn("gap-4", className)} variant={variant}>
        <Card.Content>
          <Form onSubmit={handleSubmit} className="gap-4">
            <TextField
              name="email"
              type="email"
              autoComplete="email"
              isDisabled={isPending || !session}
              value={email}
              onChange={setEmail}
              validate={(value) => {
                if (!value) return localization.auth.fieldRequired
              }}
            >
              <Label>{localization.auth.email}</Label>

              {session ? (
                <Input
                  placeholder={localization.auth.emailPlaceholder}
                  variant={variant === "transparent" ? "primary" : "secondary"}
                  required
                />
              ) : (
                <Skeleton className="h-10 w-full rounded-xl" />
              )}

              <FieldError />
            </TextField>

            <Box className="items-end">
              <Button
                type="submit"
                isPending={isPending}
                isDisabled={!session}
                size="sm"
              >
                {localization.settings.updateEmail}
              </Button>
            </Box>
          </Form>
        </Card.Content>
      </Card>
    </Box>
  )
}
