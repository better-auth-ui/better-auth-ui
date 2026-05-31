import {
  type OrganizationAuthClient,
  useAuth,
  useAuthPlugin,
  useCheckSlug
} from "@better-auth-ui/react"
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

import { organizationPlugin } from "../../../lib/auth/organization-plugin"

/** Props for the {@link SlugField} component. */
export type SlugFieldProps = {
  value: string
  onChange: (value: string) => void
  currentSlug?: string
  isDisabled?: boolean
  variant?: InputProps["variant"]
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
  variant,
  ...props
}: SlugFieldProps & TextFieldProps) {
  const { authClient, localization: authLocalization } = useAuth()
  const { localization, checkSlug: checkSlugEnabled } =
    useAuthPlugin(organizationPlugin)

  const {
    mutate: checkSlug,
    data: checkSlugData,
    error: checkSlugError,
    reset: resetCheckSlug
  } = useCheckSlug(authClient as OrganizationAuthClient)

  const debouncer = useDebouncer(
    (value) => {
      if (!checkSlugEnabled || !value.trim() || value.trim() === currentSlug)
        return

      checkSlug({ slug: value.trim() })
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
      }}
    >
      <Label>{localization.slug}</Label>

      <InputGroup variant={variant}>
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
