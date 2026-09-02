import {
  fieldsWithModelValues,
  getAdditionalFieldDefaultValues,
  getAdditionalFieldSubmitValues,
  getFormFieldErrors,
  validateStringLength
} from "@better-auth-ui/core"
import { useAuth, useSession, useUpdateUser } from "@better-auth-ui/solid"
import { createEffect, For } from "solid-js"
import { toast } from "solid-sonner"
import {
  createAuthForm,
  getAuthAdditionalFieldValidators,
  isAuthFormFieldInvalid
} from "@/components/auth/auth-form"
import { ChangeAvatar } from "@/components/auth/settings/account/change-avatar"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export type UserProfileProps = {
  class?: string
}

export function UserProfile(props: UserProfileProps = {}) {
  const auth = useAuth()
  const session = useSession(auth.authClient)
  const { mutateAsync: updateUser, isPending: updateUserPending } =
    useUpdateUser(auth.authClient, () => ({
      onSuccess: () =>
        toast.success(auth.localization.settings.profileUpdatedSuccess)
    }))

  const profileFields = () =>
    auth.additionalFields?.filter((field) => field.profile !== false) ?? []
  const form = createAuthForm(() => ({
    defaultValues: {
      additionalFields: getAdditionalFieldDefaultValues(profileFields()),
      name: ""
    },
    onSubmit: async ({ value }) => {
      await updateUser({
        name: value.name,
        ...getAdditionalFieldSubmitValues(
          profileFields(),
          value.additionalFields
        )
      })
    }
  }))

  createEffect(() => {
    const currentSession = session.data
    if (!currentSession) return

    form.reset({
      additionalFields: getAdditionalFieldDefaultValues(
        fieldsWithModelValues(
          profileFields(),
          currentSession.user as Record<string, unknown>
        )
      ),
      name: currentSession.user.name
    })
  })

  return (
    <div class={cn(props.class)}>
      <h2 class="mb-3 text-sm font-semibold">
        {auth.localization.settings.userProfile}
      </h2>
      <form.AppForm>
        <form.AuthFormRoot aria-label="Profile">
          <Card>
            <CardContent class="flex flex-col gap-6">
              <ChangeAvatar />

              <form.AppField
                name="name"
                validators={{
                  onChange: ({ value }) =>
                    validateStringLength(value, {
                      requiredMessage: auth.localization.auth.fieldRequired,
                      trim: true
                    })
                }}
              >
                {(field) => {
                  const isInvalid = () =>
                    isAuthFormFieldInvalid(field().state.meta)

                  return (
                    <Field data-invalid={isInvalid()}>
                      <FieldLabel for="settings-name">
                        {auth.localization.auth.name}
                      </FieldLabel>
                      <Input
                        aria-invalid={isInvalid()}
                        autocomplete="name"
                        disabled={updateUserPending}
                        id="settings-name"
                        name={field().name}
                        onBlur={field().handleBlur}
                        onInput={(event) =>
                          field().handleChange(event.currentTarget.value)
                        }
                        placeholder={auth.localization.auth.name}
                        value={field().state.value}
                      />
                      <FieldError
                        errors={getFormFieldErrors(field().state.meta.errors)}
                      />
                    </Field>
                  )
                }}
              </form.AppField>

              <For each={profileFields()}>
                {(configuredField) => (
                  <form.AppField
                    name={`additionalFields.${configuredField.name}`}
                    validators={getAuthAdditionalFieldValidators(
                      configuredField,
                      auth.localization.auth.fieldRequired
                    )}
                  >
                    {(field) => (
                      <field.AuthFormAdditionalField
                        field={configuredField}
                        isPending={updateUserPending || !session.data}
                      />
                    )}
                  </form.AppField>
                )}
              </For>
            </CardContent>
            <CardFooter>
              <form.AuthFormSubmitButton
                aria-label="Save changes"
                disabled={updateUserPending || !session.data}
                size="sm"
              >
                {auth.localization.settings.saveChanges}
              </form.AuthFormSubmitButton>
            </CardFooter>
          </Card>
        </form.AuthFormRoot>
      </form.AppForm>
    </div>
  )
}
