"use client"

import {
  type AdditionalFieldValue,
  parseAdditionalFieldValue
} from "@better-auth-ui/core"
import type { UsernameAuthClient } from "@better-auth-ui/core/plugins/username"
import { useAuth, useSession, useUpdateUser } from "@better-auth-ui/react"
import { type SyntheticEvent, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Field, FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import { AdditionalField } from "../../additional-field"
import { ChangeAvatar } from "./change-avatar"

export type UserProfileProps = {
  className?: string
}

/**
 * Render a profile card that lets the authenticated user view and update their display name, username, and avatar.
 *
 * @param className - Optional additional CSS class names applied to the card container
 * @returns A JSX element containing the profile card with avatar upload and editable name/username fields
 */
export function UserProfile({ className }: UserProfileProps) {
  const { additionalFields, authClient, localization } =
    useAuth<UsernameAuthClient>()
  const { data: session } = useSession(authClient)

  const { mutate: updateUser, isPending } = useUpdateUser(authClient, {
    onSuccess: () => toast.success(localization.settings.profileUpdatedSuccess)
  })

  const [fieldErrors, setFieldErrors] = useState<{
    name?: string
  }>({})

  async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string

    const additionalFieldValues: Record<string, unknown> = {}

    for (const field of additionalFields ?? []) {
      if (field.profile === false || field.readOnly) continue
      const value = parseAdditionalFieldValue(
        field,
        formData.get(field.name) as string | null
      )

      if (field.validate) {
        try {
          await field.validate(value)
        } catch (error) {
          toast.error(error instanceof Error ? error.message : String(error))
          return
        }
      }

      // `null` = explicit clear (forward to backend); `undefined` = omitted.
      if (value !== undefined) {
        additionalFieldValues[field.name] = value
      }
    }

    updateUser({
      name,
      ...additionalFieldValues
    })
  }

  return (
    <div>
      <h2 className="text-sm font-semibold mb-3">
        {localization.settings.userProfile}
      </h2>

      <form onSubmit={handleSubmit}>
        <Card className={cn(className)}>
          <CardContent className="flex flex-col gap-6">
            <ChangeAvatar />

            <Field data-invalid={!!fieldErrors.name}>
              <Label htmlFor="name">{localization.auth.name}</Label>

              {session ? (
                <Input
                  key={session?.user.name}
                  id="name"
                  name="name"
                  autoComplete="name"
                  defaultValue={session?.user.name}
                  placeholder={localization.auth.name}
                  disabled={isPending}
                  required
                  onChange={() => {
                    setFieldErrors((prev) => ({
                      ...prev,
                      name: undefined
                    }))
                  }}
                  onInvalid={(e) => {
                    e.preventDefault()

                    setFieldErrors((prev) => ({
                      ...prev,
                      name: (e.target as HTMLInputElement).validationMessage
                    }))
                  }}
                  aria-invalid={!!fieldErrors.name}
                />
              ) : (
                <Skeleton>
                  <Input className="invisible" />
                </Skeleton>
              )}

              <FieldError>{fieldErrors.name}</FieldError>
            </Field>

            {additionalFields?.map((field) => {
              if (field.profile === false) return null

              if (!session) {
                if (field.inputType === "hidden") {
                  return null
                }

                return (
                  <Skeleton key={field.name}>
                    <Input className="invisible" />
                  </Skeleton>
                )
              }

              const value = (session.user as Record<string, unknown>)[
                field.name
              ]

              // Re-mount when the session value loads so the field's
              // uncontrolled `defaultValue` reflects the latest data.
              const key = `${field.name}:${
                value instanceof Date
                  ? value.toISOString()
                  : String(value ?? "")
              }`

              return (
                <AdditionalField
                  key={key}
                  name={field.name}
                  field={{
                    ...field,
                    // `defaultValue` is sign-up-only; on the profile we
                    // always seed from the session.
                    defaultValue: value as AdditionalFieldValue | null
                  }}
                  isPending={isPending}
                />
              )
            })}
          </CardContent>

          <CardFooter>
            <Button type="submit" size="sm" disabled={isPending || !session}>
              {isPending && <Spinner />}

              {localization.settings.saveChanges}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
