import type {
  OrganizationAuthClient,
  OrganizationLocalization
} from "@better-auth-ui/core/plugins/organization"
import { useAuth } from "@better-auth-ui/solid"
import { useCheckOrganizationSlug } from "@better-auth-ui/solid/plugins/organization"
import { createDebounce } from "@solid-primitives/debounce"
import { Check, LoaderCircle, X } from "lucide-solid"
import { createEffect } from "solid-js"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { organizationPlugin } from "@/lib/auth/organization-plugin"

export type SlugFieldProps = {
  value: string
  onChange: (value: string) => void
  currentSlug?: string
  disabled?: boolean
  id?: string
}

export function sanitizeSlug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-")
}

const organizationFallbackLocalization = {
  slug: "Slug",
  slugPlaceholder: "organization-slug"
} satisfies Pick<OrganizationLocalization, "slug" | "slugPlaceholder">

export function SlugField(props: SlugFieldProps) {
  const auth = useAuth<OrganizationAuthClient>()
  const checkOrganizationSlug = useCheckOrganizationSlug(auth.authClient)
  const organizationPluginConfig = () =>
    auth.plugins.find((plugin) => plugin.id === organizationPlugin.id) as
      | {
          checkSlug?: boolean
          localization?: Pick<
            OrganizationLocalization,
            "slug" | "slugPlaceholder"
          >
        }
      | undefined
  const localization = () =>
    organizationPluginConfig()?.localization ?? organizationFallbackLocalization
  const checkSlug = () => organizationPluginConfig()?.checkSlug ?? true
  const shouldCheckSlug = () =>
    checkSlug() &&
    !!props.value.trim() &&
    props.value.trim() !== props.currentSlug

  const debouncedCheck = createDebounce((slug: string) => {
    checkOrganizationSlug.mutate({ slug })
  }, 300)

  createEffect(() => {
    if (!shouldCheckSlug()) {
      checkOrganizationSlug.reset()
      return
    }

    debouncedCheck(props.value.trim())
  })

  return (
    <div class="grid gap-2">
      <Label for={props.id ?? "slug"}>{localization().slug}</Label>
      <div class="relative">
        <Input
          id={props.id ?? "slug"}
          name="slug"
          value={props.value}
          onInput={(event) =>
            props.onChange(sanitizeSlug(event.currentTarget.value))
          }
          placeholder={localization().slugPlaceholder}
          required
          disabled={props.disabled}
          class="pr-10"
        />
        {shouldCheckSlug() ? (
          <span class="absolute inset-y-0 right-3 inline-flex items-center">
            {checkOrganizationSlug.data?.status ? (
              <Check class="size-4 text-foreground" />
            ) : checkOrganizationSlug.error ? (
              <X class="size-4 text-destructive" />
            ) : (
              <LoaderCircle class="size-4 animate-spin text-muted-foreground" />
            )}
          </span>
        ) : null}
      </div>
    </div>
  )
}
