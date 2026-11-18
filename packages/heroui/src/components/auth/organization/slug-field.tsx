import type { OrganizationAuthClient } from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useCheckSlug } from "@better-auth-ui/react/plugins/organization"
import { Check, Xmark } from "@gravity-ui/icons"
import {
  FieldError,
  InputGroup,
  type InputProps,
  Label,
  Spinner,
  TextField,
  type TextFieldProps
} from "@heroui/react"
import { useDebouncer } from "@tanstack/react-pacer"
import { useEffect } from "react"

import { organizationPlugin } from "@better-auth-ui/core/plugins/organization"
import { sanitizeSlug } from "./sanitize-slug"

/** Props for the {@link SlugField} component. */
export type SlugFieldProps = {
  value: string
  onChange: (value: string) => void
  currentSlug?: string
  isDisabled?: boolean
  variant?: InputProps["variant"]
}

/**
 * Organization slug field with debounced availability checking.
 */
export function SlugField({
  value,
  onChange,
  currentSlug,
  variant,
  ...props
}: SlugFieldProps & TextFieldProps) {
  const { authClient, localization: authLocalization } =
    useAuth<OrganizationAuthClient>()
  const {
    localization,
    checkSlug: checkSlugEnabled,
    slugPrefix
  } = useAuthPlugin(organizationPlugin)

  const {
    mutate: checkSlug,
    data: checkSlugData,
    error: checkSlugError,
    reset: resetCheckSlug
  } = useCheckSlug(authClient)

  const debouncer = useDebouncer(
    (nextValue) => {
      if (
        !checkSlugEnabled ||
        !nextValue.trim() ||
        nextValue.trim() === currentSlug
      )
        return

      checkSlug({ slug: nextValue.trim() })
    },
    { wait: 500 }
  )

  useEffect(() => {
    if (!checkSlugEnabled) return

    resetCheckSlug()
    debouncer.maybeExecute(value)
  }, [checkSlugEnabled, value, debouncer.maybeExecute, resetCheckSlug])

  const handleChange = (next: string) => {
    onChange(sanitizeSlug(next))
  }

  return (
    <TextField
      id="slug"
      name="slug"
      {...props}
      value={value}
      onChange={handleChange}
      validate={(val) => {
        if (!val) return authLocalization.auth.fieldRequired
        return undefined
      }}
    >
      <Label>{localization.slug}</Label>

      <InputGroup variant={variant}>
        {slugPrefix && (
          <InputGroup.Prefix className="pr-1.5 text-muted">
            {slugPrefix}
          </InputGroup.Prefix>
        )}

        <InputGroup.Input placeholder={localization.slugPlaceholder} required />

        {checkSlugEnabled && !!value.trim() && value.trim() !== currentSlug && (
          <InputGroup.Suffix className="px-2">
            {checkSlugData?.status ? (
              <Check className="text-success" />
            ) : checkSlugError ? (
              <Xmark className="text-danger" />
            ) : (
              <Spinner size="sm" color="current" />
            )}
          </InputGroup.Suffix>
        )}
      </InputGroup>

      <FieldError />
    </TextField>
  )
}
