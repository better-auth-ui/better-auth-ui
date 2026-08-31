import { parseAdditionalFieldValue } from "@better-auth-ui/core"
import type { OrganizationAuthClient } from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin } from "@better-auth-ui/solid"
import {
  useActiveOrganization,
  useHasPermission,
  useUpdateOrganization
} from "@better-auth-ui/solid/plugins/organization"
import { createEffect, createSignal, For, Show } from "solid-js"
import { toast } from "solid-sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { organizationPlugin } from "@/lib/auth/organization-plugin"
import { AdditionalField } from "../additional-field"
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
  const [name, setName] = createSignal("")
  const [slug, setSlug] = createSignal("")
  createEffect(() => {
    const organization = activeOrganization.data
    if (!organization) return
    setName(organization.name)
    setSlug(organization.slug)
  })

  const handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault()
    if (!activeOrganization.data || !canUpdate.data?.success) return
    const formData = new FormData(event.currentTarget as HTMLFormElement)
    const additionalValues: Record<string, unknown> = {}
    try {
      for (const field of config.additionalFields) {
        const value = parseAdditionalFieldValue(
          field,
          formData.get(field.name) as string | null
        )
        await field.validate?.(value)
        if (value !== undefined) additionalValues[field.name] = value
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error))
      return
    }
    updateOrganization.mutate({
      data: {
        ...additionalValues,
        name: name(),
        ...(!hideSlug() && { slug: slug() })
      }
    })
  }
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
          <form class="flex flex-col gap-4" onSubmit={handleSubmit}>
            <ChangeOrganizationLogo class="-ml-1" />

            <Field>
              <FieldLabel for="organization-profile-name">
                {config.localization.name}
              </FieldLabel>
              <Show when={activeOrganization.data}>
                <Input
                  disabled={formDisabled()}
                  id="organization-profile-name"
                  name="name"
                  onInput={(event) => setName(event.currentTarget.value)}
                  placeholder={config.localization.namePlaceholder}
                  required
                  value={name()}
                />
              </Show>
            </Field>

            <Show when={!hideSlug() && activeOrganization.data}>
              {(organization) => (
                <SlugField
                  currentSlug={organization().slug}
                  disabled={formDisabled()}
                  id="organization-profile-slug"
                  onChange={setSlug}
                  value={slug()}
                />
              )}
            </Show>

            <Show when={activeOrganization.data}>
              {(organization) => (
                <For each={config.additionalFields}>
                  {(field) => (
                    <AdditionalField
                      field={{
                        ...field,
                        defaultValue: (
                          organization() as Record<string, unknown>
                        )[field.name] as never
                      }}
                      isPending={formDisabled()}
                      name={field.name}
                      optionalLabel={auth.localization.settings.optional}
                    />
                  )}
                </For>
              )}
            </Show>

            <Show when={canUpdate.isPending || canUpdate.data?.success}>
              <Button
                class="mt-1 w-fit"
                disabled={!activeOrganization.data || formDisabled()}
                size="sm"
                type="submit"
              >
                {auth.localization.settings.saveChanges}
              </Button>
            </Show>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
