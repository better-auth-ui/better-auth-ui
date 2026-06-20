import type { OrganizationLocalization } from "@better-auth-ui/core/plugins/organization"
import type { OrganizationAuthClient } from "@better-auth-ui/solid"
import {
  useActiveOrganization,
  useAuth,
  useUpdateOrganization
} from "@better-auth-ui/solid"
import { createEffect, createSignal, Show } from "solid-js"
import { toast } from "solid-sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  organizationUpdatedSuccess: "Organization updated successfully"
} satisfies Pick<
  OrganizationLocalization,
  | "organizationProfile"
  | "name"
  | "namePlaceholder"
  | "organizationUpdatedSuccess"
>

export function OrganizationProfile(props: OrganizationProfileProps) {
  const auth = useAuth()
  const activeOrganization = useActiveOrganization(
    auth.authClient as OrganizationAuthClient
  )
  const updateOrganization = useUpdateOrganization(
    auth.authClient as OrganizationAuthClient,
    {
      onSuccess: () => toast.success(localization().organizationUpdatedSuccess)
    }
  )
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
            <ChangeOrganizationLogo class="-ml-1 grid gap-2" />

            <Show
              when={activeOrganization.data}
              fallback={
                <div class="grid gap-4">
                  <Skeleton class="h-10 rounded-md" />
                  <Skeleton class="h-10 rounded-md" />
                </div>
              }
            >
              {(organization) => (
                <>
                  <div class="grid gap-2">
                    <Label for="organization-profile-name">
                      {localization().name}
                    </Label>
                    <Input
                      disabled={updateOrganization.isPending}
                      id="organization-profile-name"
                      name="name"
                      onInput={(event) => setName(event.currentTarget.value)}
                      placeholder={localization().namePlaceholder}
                      required
                      value={name()}
                    />
                  </div>

                  <SlugField
                    currentSlug={organization().slug}
                    disabled={updateOrganization.isPending}
                    id="organization-profile-slug"
                    onChange={setSlug}
                    value={slug()}
                  />
                </>
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
