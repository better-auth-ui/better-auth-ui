import {
  evaluatePasswordStrength,
  validateStringLength
} from "@better-auth-ui/core"
import { useAuth } from "@better-auth-ui/react"
import { useState } from "react"
import { Button } from "../../primitives/button"
import { FieldError, Label, TextField } from "../../primitives/field"
import { InputGroup } from "../../primitives/input"
import { Box, Txt } from "../../primitives/styled"
import { Eye, EyeSlash } from "../../primitives/ui-icons"

export function PasswordStrengthMeter({ password }: { password: string }) {
  const { emailAndPassword, localization } = useAuth()
  const strength = evaluatePasswordStrength(password, {
    minLength: emailAndPassword?.minPasswordLength
  })
  if (!emailAndPassword?.strengthMeter || strength.level === "empty")
    return null
  const labels = {
    weak: localization.auth.passwordWeak,
    fair: localization.auth.passwordFair,
    good: localization.auth.passwordGood,
    strong: localization.auth.passwordStrong
  }
  return (
    <Box className="gap-1.5">
      <Box className="flex-row gap-1" accessible={false}>
        {[1, 2, 3, 4].map((segment) => (
          <Box
            key={segment}
            className={`h-1 flex-1 rounded-full ${segment <= strength.score ? (strength.level === "weak" ? "bg-danger" : "bg-accent") : "bg-surface-secondary"}`}
          />
        ))}
      </Box>
      <Txt accessibilityLiveRegion="polite" className="text-xs text-muted">
        {localization.auth.passwordStrength}: {labels[strength.level]}
      </Txt>
    </Box>
  )
}

export function PasswordField({
  name,
  label,
  value,
  onChange,
  onBlur,
  error,
  isPending,
  strengthMeter = false,
  autoComplete = "new-password"
}: {
  name: string
  label: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  error?: string
  isPending?: boolean
  strengthMeter?: boolean
  autoComplete?: string
}) {
  const { localization } = useAuth()
  const [visible, setVisible] = useState(false)
  return (
    <TextField
      name={name}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      error={error}
      isDisabled={isPending}
      type="password"
      autoComplete={autoComplete}
    >
      <Label>{label}</Label>
      <InputGroup>
        <InputGroup.Input
          placeholder={label}
          type={visible ? "text" : "password"}
        />
        <InputGroup.Suffix>
          <Button
            isIconOnly
            size="sm"
            variant="ghost"
            isDisabled={isPending}
            aria-label={
              visible
                ? localization.auth.hidePassword
                : localization.auth.showPassword
            }
            onPress={() => setVisible((value) => !value)}
          >
            {visible ? (
              <EyeSlash width={18} height={18} />
            ) : (
              <Eye width={18} height={18} />
            )}
          </Button>
        </InputGroup.Suffix>
      </InputGroup>
      <FieldError />
      {strengthMeter ? <PasswordStrengthMeter password={value} /> : null}
    </TextField>
  )
}

export function usePasswordValidation() {
  const { emailAndPassword, localization } = useAuth()
  return (value: string) =>
    validateStringLength(value, {
      requiredMessage: localization.auth.fieldRequired,
      minLength: emailAndPassword?.minPasswordLength,
      maxLength: emailAndPassword?.maxPasswordLength,
      minLengthMessage: localization.auth.tooShort.replace(
        "{{min}}",
        String(emailAndPassword?.minPasswordLength)
      ),
      maxLengthMessage: localization.auth.tooLong.replace(
        "{{max}}",
        String(emailAndPassword?.maxPasswordLength)
      )
    })
}
