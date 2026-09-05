import type { UsernameAuthClient } from "@better-auth-ui/core/plugins/username"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useIsUsernameAvailable } from "@better-auth-ui/react/plugins/username"
import { useDebouncer } from "@tanstack/react-pacer"
import { useState } from "react"
import { usernamePlugin } from "../../../lib/auth/username-plugin"
import type { AdditionalFieldProps } from "../../../lib/auth-plugin"
import { useThemeColors } from "../../../lib/theme-colors"
import { FieldError, Label, TextField } from "../../../primitives/field"
import { InputGroup } from "../../../primitives/input"
import { Spinner } from "../../../primitives/spinner"
import { Check, Xmark } from "../../../primitives/ui-icons"

/**
 * Renderer for the `username` additional field. Owns availability checking,
 * length limits, and visual indicators. Mirrors the heroui `UsernameField`:
 * `FieldError` surfaces native validation messages, while availability
 * feedback is shown via the suffix icon without affecting the field's
 * invalid state.
 */
export function UsernameField({
  name,
  field,
  isPending,
  variant
}: AdditionalFieldProps) {
  const { authClient } = useAuth()
  const {
    minUsernameLength,
    maxUsernameLength,
    isUsernameAvailable: checkAvailability,
    usernamePrefix
  } = useAuthPlugin(usernamePlugin)

  const colors = useThemeColors()

  const currentUsername = String(field.defaultValue ?? "")
  const [value, setValue] = useState(currentUsername)

  const {
    mutate: requestAvailability,
    data: availability,
    error: availabilityError,
    reset: resetAvailability
  } = useIsUsernameAvailable(authClient as UsernameAuthClient, {
    // Bypass global error toast
    onError: () => {}
  })

  const debouncer = useDebouncer(
    (next: string) => {
      const trimmed = next.trim()
      // Skip blank input and the user's own current username (profile view).
      if (!trimmed || trimmed === currentUsername) {
        resetAvailability()
        return
      }

      requestAvailability({ username: trimmed })
    },
    { wait: 500 }
  )

  function handleChange(next: string) {
    setValue(next)
    resetAvailability()

    if (checkAvailability) {
      debouncer.maybeExecute(next)
    }
  }

  const isCheckingAvailability =
    !!checkAvailability && !!value.trim() && value.trim() !== currentUsername

  const { localization: authLocalization } = useAuth()

  return (
    <TextField
      name={name}
      type="text"
      autoComplete="username"
      minLength={minUsernameLength}
      maxLength={maxUsernameLength}
      isDisabled={isPending}
      value={value}
      onChange={handleChange}
      validate={(val) => {
        if (!val) {
          if (field.required) return authLocalization.auth.fieldRequired
          return
        }
        if (minUsernameLength && val.length < minUsernameLength)
          return authLocalization.auth.tooShort.replace(
            "{{min}}",
            String(minUsernameLength)
          )
        if (maxUsernameLength && val.length > maxUsernameLength)
          return authLocalization.auth.tooLong.replace(
            "{{max}}",
            String(maxUsernameLength)
          )
      }}
    >
      <Label>{field.label}</Label>

      <InputGroup variant={variant === "transparent" ? "primary" : "secondary"}>
        {usernamePrefix && (
          <InputGroup.Prefix className="pr-1.5 text-muted">
            {usernamePrefix}
          </InputGroup.Prefix>
        )}

        <InputGroup.Input
          placeholder={field.placeholder}
          required={field.required}
        />

        {isCheckingAvailability && (
          <InputGroup.Suffix className="px-2">
            {availability?.available ? (
              <Check width={18} height={18} color={colors.accent} />
            ) : availabilityError || availability?.available === false ? (
              <Xmark width={18} height={18} color={colors.danger} />
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
