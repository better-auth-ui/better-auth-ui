import type {
  OrganizationAuthClient,
  OrganizationLocalization
} from "@better-auth-ui/core/plugins/organization"
import { useAuth } from "@better-auth-ui/solid"
import { useCheckSlug } from "@better-auth-ui/solid/plugins/organization"
import { createDebounce } from "@solid-primitives/debounce"
import { Check, X } from "lucide-solid"
import { createEffect } from "solid-js"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput
} from "@/components/ui/input-group"
import { Spinner } from "@/components/ui/spinner"
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
  const slugAvailability = useCheckSlug(auth.authClient)
  const organizationPluginConfig = () =>
    auth.plugins.find((plugin) => plugin.id === organizationPlugin.id) as
      | {
          checkSlug?: boolean
          slugPrefix?: string
          localization?: Pick<
            OrganizationLocalization,
            "slug" | "slugPlaceholder"
          >
        }
      | undefined
  const localization = () =>
    organizationPluginConfig()?.localization ?? organizationFallbackLocalization
  const checkSlug = () => organizationPluginConfig()?.checkSlug ?? true
  const slugPrefix = () => organizationPluginConfig()?.slugPrefix ?? ""
  const shouldCheckSlug = () =>
    checkSlug() &&
    !!props.value.trim() &&
    props.value.trim() !== props.currentSlug

  const debouncedCheck = createDebounce((slug: string) => {
    slugAvailability.mutate({ slug })
  }, 300)

  createEffect(() => {
    if (!shouldCheckSlug()) {
      slugAvailability.reset()
      return
    }

    debouncedCheck(props.value.trim())
  })

  return (
    <Field data-invalid={Boolean(slugAvailability.error)}>
      <FieldLabel for={props.id ?? "slug"}>{localization().slug}</FieldLabel>
      <InputGroup>
        <InputGroupInput
          id={props.id ?? "slug"}
          name="slug"
          value={props.value}
          onInput={(event) =>
            props.onChange(sanitizeSlug(event.currentTarget.value))
          }
          placeholder={localization().slugPlaceholder}
          required
          disabled={props.disabled}
        />
        {slugPrefix() ? (
          <InputGroupAddon align="inline-start">{slugPrefix()}</InputGroupAddon>
        ) : null}
        {shouldCheckSlug() ? (
          <InputGroupAddon align="inline-end">
            {slugAvailability.data?.status ? (
              <Check class="size-4 text-foreground" />
            ) : slugAvailability.error ? (
              <X class="size-4 text-destructive" />
            ) : (
              <Spinner />
            )}
          </InputGroupAddon>
        ) : null}
      </InputGroup>
      <FieldError>
        {slugAvailability.error?.error?.message ??
          slugAvailability.error?.message}
      </FieldError>
    </Field>
  )
}
