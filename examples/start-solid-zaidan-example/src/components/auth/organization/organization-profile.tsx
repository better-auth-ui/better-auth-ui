import type {
  OrganizationAuthClient,
  OrganizationLocalization
} from "@better-auth-ui/core/plugins/organization"
import { useAuth } from "@better-auth-ui/solid"
import {
  useActiveOrganization,
  useUpdateOrganization
} from "@better-auth-ui/solid/plugins/organization"
import { createEffect, createSignal, Show } from "solid-js"
import { toast } from "solid-sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { organizationPlugin } from "@/lib/auth/organization-plugin"
import { ChangeOrganizationLogo } from "./change-organization-logo"
import { SlugField } from "./slug-field"

export type OrganizationProfileProps = {
  class?: string
}

const fallbackLocalization = {
  organizationProfile: "Organization profile",
  name: "Name",
  namePlaceholder: "Enter the organization name",
  slug: "Slug",
  organizationUpdatedSuccess: "Organization updated successfully"
} satisfies Pick<
  OrganizationLocalization,
  | "organizationProfile"
  | "name"
  | "namePlaceholder"
  | "slug"
  | "organizationUpdatedSuccess"
>

export function OrganizationProfile(props: OrganizationProfileProps) {
  const auth = useAuth<OrganizationAuthClient>()
  const activeOrganization = useActiveOrganization(auth.authClient)
  const updateOrganization = useUpdateOrganization(auth.authClient, () => ({
    onSuccess: () => toast.success(localization().organizationUpdatedSuccess)
  }))
  const [name, setName] = createSignal("")
  const [slug, setSlug] = createSignal("")
  const organizationPluginConfig = () =>
    auth.plugins.find((plugin) => plugin.id === organizationPlugin.id) as
      | { localization?: OrganizationLocalization }
      | undefined
  const localization = () =>
    organizationPluginConfig()?.localization ?? fallbackLocalization

  createEffect(() => {
    const organization = activeOrganization.data

    if (!organization) return

    setName(organization.name)
    setSlug(organization.slug)
  })

  const handleSubmit = (event: SubmitEvent) => {
    event.preventDefault()

    updateOrganization.mutate({ data: { name: name(), slug: slug() } })
  }

  return (
    <div class={props.class}>
      <h2 class="mb-3 font-semibold text-sm">
        {localization().organizationProfile}
      </h2>
      <Card>
        <CardContent>
          <form class="flex flex-col gap-4" onSubmit={handleSubmit}>
            <ChangeOrganizationLogo class="-ml-1" />

            <Field>
              <FieldLabel for="organization-profile-name">
                {localization().name}
              </FieldLabel>
              <Show
                when={activeOrganization.data}
                fallback={<Skeleton class="h-8 w-full rounded-md" />}
              >
                <Input
                  disabled={updateOrganization.isPending}
                  id="organization-profile-name"
                  name="name"
                  onInput={(event) => setName(event.currentTarget.value)}
                  placeholder={localization().namePlaceholder}
                  required
                  value={name()}
                />
              </Show>
            </Field>

            <Show
              when={activeOrganization.data}
              fallback={
                <Field>
                  <FieldLabel>{localization().slug}</FieldLabel>
                  <Skeleton class="h-8 w-full rounded-md" />
                </Field>
              }
            >
              {(organization) => (
                <SlugField
                  currentSlug={organization().slug}
                  disabled={updateOrganization.isPending}
                  id="organization-profile-slug"
                  onChange={setSlug}
                  value={slug()}
                />
              )}
            </Show>

            <Button
              class="mt-1 w-fit"
              disabled={
                !activeOrganization.data || updateOrganization.isPending
              }
              size="sm"
              type="submit"
            >
              {auth.localization.settings.saveChanges}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
