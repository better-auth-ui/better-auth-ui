"use client"

import {
  type OrganizationAuthClient,
  useAuth,
  useAuthPlugin,
  useCheckSlug
} from "@better-auth-ui/react"
import { useDebouncer } from "@tanstack/react-pacer"
import { Check, X } from "lucide-react"
import { useEffect, useState } from "react"

import { Field, FieldError } from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput
} from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { organizationPlugin } from "@/lib/auth/organization-plugin"

/** Props for the `SlugField` component. */
export type SlugFieldProps = {
  value: string
  onChange: (value: string) => void
  currentSlug?: string
  disabled?: boolean
  id?: string
}

/**
 * Sanitize a slug value so it only contains lowercase alphanumeric characters
 * and dashes. Runs of disallowed characters are collapsed to a single dash, but
 * leading/trailing dashes are preserved while the user is still typing.
 */
export function sanitizeSlug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-")
}

/**
 * Organization slug field with debounced availability checking.
 */
export function SlugField({
  value,
  onChange,
  currentSlug,
  disabled,
  id = "slug"
}: SlugFieldProps) {
  const { authClient, localization: authLocalization } =
    useAuth<OrganizationAuthClient>()
  const {
    localization,
    checkSlug: checkSlugEnabled,
    slugPrefix
  } = useAuthPlugin(organizationPlugin)

  const [slugError, setSlugError] = useState<string>()

  const {
    mutate: checkSlug,
    data: checkSlugData,
    error: checkSlugError,
    reset: resetCheckSlug
  } = useCheckSlug(authClient)

  const debouncer = useDebouncer(
    (next: string) => {
      if (!checkSlugEnabled || !next.trim() || next.trim() === currentSlug)
        return

      checkSlug({ slug: next.trim() })
    },
    { wait: 500 }
  )

  useEffect(() => {
    // Clear stale validation errors when the controlled value changes
    // externally (e.g. the parent resets the form), not just via this
    // input's onChange.
    setSlugError(undefined)

    if (!checkSlugEnabled) return

    resetCheckSlug()
    debouncer.maybeExecute(value)
  }, [checkSlugEnabled, value, debouncer.maybeExecute, resetCheckSlug])

  return (
    <Field data-invalid={!!slugError}>
      <Label htmlFor={id}>{localization.slug}</Label>

      <InputGroup>
        {slugPrefix && (
          <InputGroupAddon align="inline-start">{slugPrefix}</InputGroupAddon>
        )}

        <InputGroupInput
          id={id}
          name="slug"
          value={value}
          onChange={(e) => {
            onChange(sanitizeSlug(e.target.value))
            setSlugError(undefined)
          }}
          onInvalid={(e) => {
            e.preventDefault()
            setSlugError(authLocalization.auth.fieldRequired)
          }}
          aria-invalid={!!slugError}
          placeholder={localization.slugPlaceholder}
          required
          disabled={disabled}
        />

        {checkSlugEnabled && !!value.trim() && value.trim() !== currentSlug && (
          <InputGroupAddon align="inline-end">
            {checkSlugData?.status ? (
              <Check className="size-4 text-foreground" />
            ) : checkSlugError ? (
              <X className="size-4 text-destructive" />
            ) : (
              <Spinner />
            )}
          </InputGroupAddon>
        )}
      </InputGroup>

      <FieldError>{slugError}</FieldError>
    </Field>
  )
}
