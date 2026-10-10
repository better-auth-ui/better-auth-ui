import {
  fieldsWithModelValues,
  getAdditionalFieldDefaultValues,
  getAdditionalFieldSubmitValues,
  getFormFieldErrorMessage,
  validateStringLength
} from "@better-auth-ui/core"
import { useAuth, useSession, useUpdateUser } from "@better-auth-ui/react"
import { useEffect, useMemo } from "react"
import { Card, type CardVariant } from "../../../../primitives/card"
import { TextField, Label } from "../../../../primitives/field"
import { Input } from "../../../../primitives/input"
import { Skeleton } from "../../../../primitives/skeleton"
import { Box, Txt } from "../../../../primitives/styled"
import { toast } from "../../../../primitives/toast"
import { cn } from "../../../../lib/cn"
import {
  getAuthAdditionalFieldValidators,
  isAuthFormFieldInvalid,
  useAuthForm
} from "../../auth-form"
import { ChangeAvatar } from "./change-avatar"

export type UserProfileProps = {
  className?: string
  variant?: CardVariant
}

/**
 * Render a profile card that lets the authenticated user view and update their
 * display name, avatar, and any plugin- or user-supplied additional fields.
 */
export function UserProfile({ className, variant }: UserProfileProps) {
  const { additionalFields, authClient, avatar, localization, profile } =
    useAuth()
  const { data: session } = useSession(authClient)

  const { mutateAsync: updateUser, isPending } = useUpdateUser(authClient, {
    onSuccess: () => toast.success(localization.settings.profileUpdatedSuccess)
  })

  const profileFields = useMemo(
    () => additionalFields?.filter((field) => field.profile !== false) ?? [],
    [additionalFields]
  )
  const hasProfileFields =
    profile.name || profileFields.some((field) => field.inputType !== "hidden")
  const form = useAuthForm({
    defaultValues: {
      additionalFields: getAdditionalFieldDefaultValues(profileFields),
      name: ""
    },
    onSubmit: async ({ value }) => {
      await updateUser({
        ...(profile.name && { name: value.name }),
        ...getAdditionalFieldSubmitValues(profileFields, value.additionalFields)
      })
    }
  })

  useEffect(() => {
    if (!session) return
    form.reset({
      additionalFields: getAdditionalFieldDefaultValues(
        fieldsWithModelValues(
          profileFields,
          session.user as Record<string, unknown>
        )
      ),
      name: session.user.name
    })
  }, [form, profileFields, session])

  if (!avatar.enabled && !hasProfileFields) return null

  return (
    <Box>
      <Txt className="text-sm font-semibold mb-3">
        {localization.settings.userProfile}
      </Txt>

      <Card className={cn("p-4 gap-4", className)} variant={variant}>
        <Card.Content>
          <form.AppForm>
            <form.AuthFormRoot className="flex flex-col gap-4">
              <ChangeAvatar />

              {profile.name && (
                <form.AppField
                  name="name"
                  validators={{
                    onChange: ({ value }) =>
                      validateStringLength(value, {
                        requiredMessage: localization.auth.fieldRequired,
                        trim: true
                      })
                  }}
                >
                  {(field) => {
                    const isInvalid = isAuthFormFieldInvalid(field.state.meta)

                    return (
                      <TextField
                        name={field.name}
                        isDisabled={isPending || !session}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={field.handleChange}
                        error={
                          isInvalid
                            ? getFormFieldErrorMessage(field.state.meta.errors)
                            : undefined
                        }
                      >
                        <Label>{localization.auth.name}</Label>

                        {session && (
                          <Input
                            autoComplete="name"
                            placeholder={localization.auth.name}
                            variant={
                              variant === "transparent"
                                ? "primary"
                                : "secondary"
                            }
                          />
                        )}

                        {!session && (
                          <Skeleton className="h-10 md:h-9 w-full rounded-xl" />
                        )}

                        <field.AuthFormFieldError />
                      </TextField>
                    )
                  }}
                </form.AppField>
              )}

              {profileFields.map((configuredField) => {
                if (!session) {
                  if (configuredField.inputType === "hidden") {
                    return null
                  }

                  return (
                    <Skeleton
                      key={configuredField.name}
                      className="h-10 md:h-9 w-full rounded-xl"
                    />
                  )
                }

                return (
                  <form.AppField
                    key={configuredField.name}
                    name={`additionalFields.${configuredField.name}`}
                    validators={getAuthAdditionalFieldValidators(
                      configuredField,
                      localization.auth.fieldRequired
                    )}
                  >
                    {(field) => (
                      <field.AuthFormAdditionalField
                        field={{
                          ...configuredField,
                          defaultValue: (
                            session.user as Record<string, unknown>
                          )[
                            configuredField.name
                          ] as typeof configuredField.defaultValue
                        }}
                        isPending={isPending}
                        variant={variant}
                      />
                    )}
                  </form.AppField>
                )
              })}

              {hasProfileFields && (
                <form.AuthFormSubmitButton
                  isDisabled={!session}
                  size="sm"
                  className="self-start mt-1"
                >
                  {localization.settings.saveChanges}
                </form.AuthFormSubmitButton>
              )}
            </form.AuthFormRoot>
          </form.AppForm>
        </Card.Content>
      </Card>
    </Box>
  )
}
