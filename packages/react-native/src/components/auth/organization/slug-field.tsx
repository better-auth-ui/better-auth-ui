import {
  type OrganizationAuthClient,
  useAuth,
  useAuthPlugin,
  useCheckSlug
} from "@better-auth-ui/react"
import { useDebouncer } from "@tanstack/react-pacer"
import { useEffect } from "react"
import { Text } from "react-native"

import { organizationPlugin } from "../../../lib/auth/organization-plugin"
import { useThemeColors } from "../../../lib/theme-colors"
import {
  FieldError,
  Label,
  TextField,
  type TextFieldProps
} from "../../../primitives/field"
import { InputGroup, type InputVariant } from "../../../primitives/input"
import { Spinner } from "../../../primitives/spinner"
import { Check, Xmark } from "../../../primitives/ui-icons"

/** Props for the {@link SlugField} component. */
export type SlugFieldProps = {
  value: string
  onChange: (value: string) => void
  currentSlug?: string
  isDisabled?: boolean
  variant?: InputVariant
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
 * Organization slug field with debounced availability checking. Mirrors the
 * heroui `SlugField`, adapted for React Native: `InputGroup.Prefix`/`.Suffix`
 * replace the web `InputGroup` adornment slots, and the field is always
 * controlled state (no `FormData`) per the RN `TextField` convention.
 */
export function SlugField({
  value,
  onChange,
  currentSlug,
  variant,
  ...props
}: SlugFieldProps & TextFieldProps) {
  const { authClient, localization: authLocalization } = useAuth()
  const {
    localization,
    checkSlug: checkSlugEnabled,
    slugPrefix
  } = useAuthPlugin(organizationPlugin)

  const colors = useThemeColors()

  const {
    mutate: checkSlug,
    data: checkSlugData,
    error: checkSlugError,
    reset: resetCheckSlug
  } = useCheckSlug(authClient as OrganizationAuthClient)

  const debouncer = useDebouncer(
    (value: string) => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkSlugEnabled, value, debouncer.maybeExecute, resetCheckSlug])

  const handleChange = (next: string) => {
    onChange(sanitizeSlug(next))
  }

  const showAvailability =
    checkSlugEnabled && !!value.trim() && value.trim() !== currentSlug

  return (
    <TextField
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
        {slugPrefix && (
          <InputGroup.Prefix>
            <Text className="text-muted">{slugPrefix}</Text>
          </InputGroup.Prefix>
        )}

        <InputGroup.Input placeholder={localization.slugPlaceholder} required />

        {showAvailability && (
          <InputGroup.Suffix>
            {checkSlugData?.status ? (
              <Check width={16} height={16} color={colors.accent} />
            ) : checkSlugError ? (
              <Xmark width={16} height={16} color={colors.danger} />
            ) : (
              <Spinner size="sm" />
            )}
          </InputGroup.Suffix>
        )}
      </InputGroup>

      <FieldError />
    </TextField>
  )
}
