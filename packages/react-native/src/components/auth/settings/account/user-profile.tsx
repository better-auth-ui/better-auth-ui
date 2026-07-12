import type { AdditionalFieldValue } from "@better-auth-ui/core"
import { useAuth, useSession, useUpdateUser } from "@better-auth-ui/react"
import { useEffect, useState } from "react"
import { cn } from "../../../../lib/cn"
import { Button } from "../../../../primitives/button"
import { Card, type CardVariant } from "../../../../primitives/card"
import { FieldError, Label, TextField } from "../../../../primitives/field"
import { Form } from "../../../../primitives/form"
import { Input } from "../../../../primitives/input"
import { Skeleton } from "../../../../primitives/skeleton"
import { Spinner } from "../../../../primitives/spinner"
import { Box, Txt } from "../../../../primitives/styled"
import { toast } from "../../../../primitives/toast"
import { AdditionalField } from "../../additional-field"
import { ChangeAvatar } from "./change-avatar"

export type UserProfileProps = {
  className?: string
  variant?: CardVariant
}

/**
 * Render a profile card that lets the authenticated user view and update their
 * display name, avatar, and any plugin- or user-supplied additional fields.
 * Mirrors the heroui `UserProfile`, adapted for React Native: the `name` field
 * is fully controlled (no `FormData`/`defaultValue` remount trick) and is
 * seeded from the session via `useEffect` once it resolves; additional fields
 * are handed to `AdditionalField` (which owns its own controlled state and
 * reports value changes back up) instead of being read from `FormData`.
 */
export function UserProfile({ className, variant }: UserProfileProps) {
  const { additionalFields, authClient, localization } = useAuth()
  const { data: session } = useSession(authClient)

  const { mutate: updateUser, isPending } = useUpdateUser(authClient, {
    onSuccess: () => toast.success(localization.settings.profileUpdatedSuccess)
  })

  const [name, setName] = useState("")

  useEffect(() => {
    if (session) setName(session.user.name)
  }, [session])

  const [additionalFieldValues, setAdditionalFieldValues] = useState<
    Record<string, AdditionalFieldValue | null>
  >({})

  function handleSubmit() {
    updateUser({
      name,
      ...additionalFieldValues
    })
  }

  return (
    <Box>
      <Txt className={cn("text-sm font-semibold mb-3 text-foreground")}>
        {localization.settings.userProfile}
      </Txt>

      <Card className={cn("gap-4", className)} variant={variant}>
        <Card.Content>
          <Form onSubmit={handleSubmit} className="gap-4">
            <ChangeAvatar />

            <TextField
              name="name"
              autoComplete="name"
              isDisabled={isPending || !session}
              value={name}
              onChange={setName}
              validate={(value) => {
                if (!value) return localization.auth.fieldRequired
              }}
            >
              <Label>{localization.auth.name}</Label>

              {session ? (
                <Input
                  placeholder={localization.auth.name}
                  variant={variant === "transparent" ? "primary" : "secondary"}
                />
              ) : (
                <Skeleton className="h-10 w-full rounded-xl" />
              )}

              <FieldError />
            </TextField>

            {additionalFields
              ?.filter((field) => field.profile !== false)
              .map((field) => {
                if (!session) {
                  if (field.inputType === "hidden") {
                    return null
                  }

                  return (
                    <Skeleton
                      key={field.name}
                      className="h-10 w-full rounded-xl"
                    />
                  )
                }

                const value = (session.user as Record<string, unknown>)[
                  field.name
                ]

                return (
                  <AdditionalField
                    key={field.name}
                    name={field.name}
                    field={{
                      ...field,
                      defaultValue:
                        field.name in additionalFieldValues
                          ? (additionalFieldValues[field.name] ?? null)
                          : ((value as AdditionalFieldValue | null) ?? null)
                    }}
                    isPending={isPending}
                    variant={variant}
                    onChange={(next: AdditionalFieldValue | null) =>
                      setAdditionalFieldValues((prev) => ({
                        ...prev,
                        [field.name]: next
                      }))
                    }
                  />
                )
              })}

            <Button
              type="submit"
              isPending={isPending}
              isDisabled={!session}
              size="sm"
              className="self-start mt-1"
            >
              {isPending && <Spinner color="current" size="sm" />}
              {localization.settings.saveChanges}
            </Button>
          </Form>
        </Card.Content>
      </Card>
    </Box>
  )
}
