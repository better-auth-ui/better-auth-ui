import {
  fieldsWithModelValues,
  getAdditionalFieldDefaultValues,
  getAdditionalFieldSubmitValues,
  validateStringLength
} from "@better-auth-ui/core"
import { useAuth, useSession, useUpdateUser } from "@better-auth-ui/react"
import {
  Card,
  type CardProps,
  cn,
  Input,
  Label,
  Skeleton,
  TextField,
  toast
} from "@heroui/react"
import { useEffect, useMemo } from "react"

import {
  getAuthAdditionalFieldValidators,
  isAuthFormFieldInvalid,
  useAuthForm
} from "../../auth-form"
import { ChangeAvatar } from "./change-avatar"

export type UserProfileProps = {
  className?: string
  variant?: CardProps["variant"]
}

/**
 * Render a profile card that lets the authenticated user view and update their
 * display name, avatar, and any plugin- or user-supplied additional fields.
 */
export function UserProfile({
  className,
  variant,
  ...props
}: UserProfileProps & Omit<CardProps, "children">) {
  const { additionalFields, authClient, localization } = useAuth()
  const { data: session } = useSession(authClient)

  const { mutateAsync: updateUser, isPending } = useUpdateUser(authClient, {
    onSuccess: () => toast.success(localization.settings.profileUpdatedSuccess)
  })

  const profileFields = useMemo(
    () => additionalFields?.filter((field) => field.profile !== false) ?? [],
    [additionalFields]
  )
  const form = useAuthForm({
    defaultValues: {
      additionalFields: getAdditionalFieldDefaultValues(profileFields),
      name: ""
    },
    onSubmit: async ({ value }) => {
      await updateUser({
        name: value.name,
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

  return (
    <div>
      <h2 className={cn("text-sm font-semibold mb-3")}>
        {localization.settings.userProfile}
      </h2>

      <Card className={cn("p-4 gap-4", className)} variant={variant} {...props}>
        <Card.Content>
          <form.AppForm>
            <form.AuthFormRoot className="flex flex-col gap-4">
              <ChangeAvatar />

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
                      isInvalid={isInvalid || undefined}
                      validationBehavior="aria"
                    >
                      <Label>{localization.auth.name}</Label>

                      <Input
                        className={cn(!session && "hidden")}
                        autoComplete="name"
                        placeholder={localization.auth.name}
                        variant={
                          variant === "transparent" ? "primary" : "secondary"
                        }
                      />

                      {!session && (
                        <Skeleton className="h-10 md:h-9 w-full rounded-xl" />
                      )}

                      <field.AuthFormFieldError />
                    </TextField>
                  )
                }}
              </form.AppField>

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
                        field={configuredField}
                        isPending={isPending}
                        variant={variant}
                      />
                    )}
                  </form.AppField>
                )
              })}

              <form.AuthFormSubmitButton
                isDisabled={!session}
                size="sm"
                className="self-start mt-1"
              >
                {localization.settings.saveChanges}
              </form.AuthFormSubmitButton>
            </form.AuthFormRoot>
          </form.AppForm>
        </Card.Content>
      </Card>
    </div>
  )
}
