import {
  type UsernameAuthClient,
  useAuth,
  useAuthPlugin,
  useIsUsernameAvailable
} from "@better-auth-ui/react"
import { Check, Xmark } from "@gravity-ui/icons"
import {
  FieldError,
  InputGroup,
  Label,
  Spinner,
  TextField
} from "@heroui/react"
import { useDebouncer } from "@tanstack/react-pacer"
import { useState } from "react"
import { usernamePlugin } from "../../../lib/auth/username-plugin"
import type { AdditionalFieldProps } from "../additional-field"

/**
 * Renderer for the `username` additional field. Owns availability checking,
 * length limits, and visual indicators. `FieldError` automatically surfaces
 * native validation messages. Availability feedback is shown via the icon and
 * aria-label without affecting the field's invalid state.
 */
export function UsernameField({
  name,
  field,
  isPending,
  variant
}: AdditionalFieldProps) {
  const { authClient } = useAuth()
  const {
    localization,
    minUsernameLength,
    maxUsernameLength,
    isUsernameAvailable: checkAvailability
  } = useAuthPlugin(usernamePlugin)

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
      isReadOnly={field.readOnly}
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
        <InputGroup.Input
          placeholder={field.placeholder}
          required={field.required}
        />

        {isCheckingAvailability && (
          <InputGroup.Suffix
            aria-label={
              availability?.available
                ? localization.usernameAvailable
                : availability?.available === false
                  ? localization.usernameTaken
                  : undefined
            }
            className="px-2"
          >
            {availability?.available ? (
              <Check className="text-success" />
            ) : availabilityError || availability?.available === false ? (
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
