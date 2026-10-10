import type { OrganizationAuthClient } from "@better-auth-ui/core/plugins/organization"
import { useAuthPlugin } from "@better-auth-ui/react"
import { FieldError, Label, TextField } from "../../../primitives/field"
import { InputGroup } from "../../../primitives/input"
import { Txt } from "../../../primitives/styled"
export const sanitizeOrganizationSlug = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, "-")

export function SlugField({
  value,
  onChange,
  onBlur,
  error,
  isDisabled
}: {
  value: string
  onChange: (value: string) => void
  onBlur: () => void
  error?: string
  isDisabled?: boolean
}) {
  const { localization, slugPrefix } = useAuthPlugin(organizationPlugin)
  return (
    <TextField
      name="slug"
      value={value}
      onChange={(value) => onChange(sanitizeOrganizationSlug(value))}
      onBlur={onBlur}
      error={error}
      isDisabled={isDisabled}
    >
      <Label>{localization.slug}</Label>
      <InputGroup>
        {slugPrefix ? (
          <InputGroup.Prefix>
            <Txt>{slugPrefix}</Txt>
          </InputGroup.Prefix>
        ) : null}
        <InputGroup.Input placeholder={localization.slugPlaceholder} />
      </InputGroup>
      <FieldError />
    </TextField>
  )
}
import { organizationPlugin } from "../../../lib/auth/organization-plugin"

export function getSlugAvailabilityValidator(
  client: OrganizationAuthClient,
  enabled: boolean,
  currentSlug?: string
) {
  return enabled
    ? async ({ value }: { value: string }) => {
        if (!value.trim() || value.trim() === currentSlug) return
        try {
          await client.organization.checkSlug({
            slug: value.trim(),
            fetchOptions: { throw: true }
          })
        } catch (error) {
          return (
            (error as { error?: { message?: string }; message?: string }).error
              ?.message ?? (error as Error).message
          )
        }
      }
    : undefined
}
