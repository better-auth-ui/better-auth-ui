import {
  fieldsWithModelValues,
  getAdditionalFieldDefaultValues,
  getAdditionalFieldSubmitValues,
  getFormFieldErrors,
  validateStringLength
} from "@better-auth-ui/core"
import type { OrganizationAuthClient } from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin } from "@better-auth-ui/solid"
import {
  useActiveOrganization,
  useHasPermission,
  useUpdateOrganization
} from "@better-auth-ui/solid/plugins/organization"
import { createEffect, For, Show } from "solid-js"
import { toast } from "solid-sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { organizationPlugin } from "@/lib/auth/organization-plugin"
import {
  createAuthForm,
  getAuthAdditionalFieldValidators,
  isAuthFormFieldInvalid
} from "../auth-form"
import { ChangeOrganizationLogo } from "./change-organization-logo"
import { SlugField } from "./slug-field"

export type OrganizationProfileProps = {
  class?: string
  hideSlug?: boolean
}

export function OrganizationProfile(props: OrganizationProfileProps) {
  const auth = useAuth<OrganizationAuthClient>()
  const activeOrganization = useActiveOrganization(auth.authClient)
  const canUpdate = useHasPermission(auth.authClient, () => ({
    permissions: { organization: ["update"] }
  }))
  const config = useAuthPlugin(organizationPlugin)
  const hideSlug = () => props.hideSlug ?? config.hideSlug ?? false
  const updateOrganization = useUpdateOrganization(auth.authClient, () => ({
    onSuccess: () =>
      toast.success(config.localization.organizationUpdatedSuccess)
  }))
  const form = createAuthForm(() => ({
    defaultValues: {
      additionalFields: getAdditionalFieldDefaultValues(
        config.additionalFields
      ),
      name: "",
      slug: ""
    },
    onSubmit: async ({ value }) => {
      if (!activeOrganization.data || !canUpdate.data?.success) return
      await updateOrganization.mutateAsync({
        data: {
          ...getAdditionalFieldSubmitValues(
            config.additionalFields,
            value.additionalFields
          ),
          name: value.name,
          ...(!hideSlug() && { slug: value.slug })
        }
      })
    }
  }))
  createEffect(() => {
    const organization = activeOrganization.data
    if (!organization) return
    form.reset({
      additionalFields: getAdditionalFieldDefaultValues(
        fieldsWithModelValues(
          config.additionalFields,
          organization as Record<string, unknown>
        )
      ),
      name: organization.name,
      slug: organization.slug
    })
  })
  const formDisabled = () =>
    updateOrganization.isPending ||
    canUpdate.isPending ||
    !canUpdate.data?.success

  return (
    <div class={props.class}>
      <h2 class="mb-3 font-semibold text-sm">
        {config.localization.organizationProfile}
      </h2>
      <Card>
        <CardContent>
          <form.AppForm>
            <form.AuthFormRoot class="flex flex-col gap-4">
              <ChangeOrganizationLogo class="-ml-1" />

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
                      <FieldLabel for="organization-profile-name">
                        {config.localization.name}
                      </FieldLabel>
                      <Show when={activeOrganization.data}>
                        <Input
                          aria-invalid={isInvalid()}
                          disabled={formDisabled()}
                          id="organization-profile-name"
                          name={field().name}
                          onBlur={field().handleBlur}
                          onInput={(event) =>
                            field().handleChange(event.currentTarget.value)
                          }
                          placeholder={config.localization.namePlaceholder}
                          value={field().state.value}
                        />
                      </Show>
                      <FieldError
                        errors={getFormFieldErrors(field().state.meta.errors)}
                      />
                    </Field>
                  )
                }}
              </form.AppField>

              <Show when={!hideSlug() && activeOrganization.data}>
                {(organization) => (
                  <form.AppField name="slug">
                    {(field) => (
                      <SlugField
                        currentSlug={organization().slug}
                        disabled={formDisabled()}
                        id="organization-profile-slug"
                        onChange={field().handleChange}
                        value={field().state.value}
                      />
                    )}
                  </form.AppField>
                )}
              </Show>

              <Show when={activeOrganization.data}>
                <For each={config.additionalFields}>
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
                          isPending={formDisabled()}
                          optionalLabel={auth.localization.settings.optional}
                        />
                      )}
                    </form.AppField>
                  )}
                </For>
              </Show>

              <Show when={canUpdate.isPending || canUpdate.data?.success}>
                <form.AuthFormSubmitButton
                  class="mt-1 w-fit"
                  disabled={!activeOrganization.data || formDisabled()}
                  size="sm"
                >
                  {auth.localization.settings.saveChanges}
                </form.AuthFormSubmitButton>
              </Show>
            </form.AuthFormRoot>
          </form.AppForm>
        </CardContent>
      </Card>
    </div>
  )
}
