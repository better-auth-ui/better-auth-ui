import {
  type CardProps,
  cn,
  InputOTP,
  Label,
  REGEXP_ONLY_DIGITS
} from "@heroui/react"
import { useId } from "react"

export type OtpFieldProps = {
  /** Visible label rendered above the slots. */
  label: string
  /** Number of slots — keep in sync with the server's code length. */
  length: number
  value: string
  onChange: (value: string) => void
  onComplete?: (value: string) => void
  autoFocus?: boolean
  className?: string
  errorMessage?: string
  isDisabled?: boolean
  name?: string
  /** Card variant, so the slots match the surface they sit on. */
  variant?: CardProps["variant"]
}

/** Strip everything the numeric slots can't hold — pasted codes often carry spaces or dashes. */
function normalizeCode(value: string) {
  return value.replace(/\D/g, "")
}

/**
 * Labelled one-time-code input built on HeroUI's `InputOTP`.
 *
 * Shared by every code-based flow (email OTP, two-factor challenge,
 * two-factor enrollment) so slot sizing, pasting, and error wiring behave the
 * same everywhere.
 *
 * @param label - Visible label, also used as the accessible name.
 * @param length - Number of code characters.
 * @param errorMessage - Rendered below the slots when set.
 */
export function OtpField({
  autoFocus,
  className,
  errorMessage,
  isDisabled,
  label,
  length,
  name,
  onChange,
  onComplete,
  value,
  variant
}: OtpFieldProps) {
  const inputId = useId()
  const errorId = `${inputId}-error`

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Label htmlFor={inputId}>{label}</Label>

      <InputOTP
        aria-describedby={errorMessage ? errorId : undefined}
        aria-label={label}
        autoFocus={autoFocus}
        className="w-full justify-center"
        id={inputId}
        inputMode="numeric"
        isDisabled={isDisabled}
        isInvalid={Boolean(errorMessage)}
        maxLength={length}
        name={name}
        pasteTransformer={normalizeCode}
        pattern={REGEXP_ONLY_DIGITS}
        value={value}
        variant={variant === "transparent" ? "primary" : "secondary"}
        onChange={(next) => onChange(normalizeCode(next))}
        onComplete={(completedCode) =>
          onComplete?.(normalizeCode(completedCode))
        }
      >
        <InputOTP.Group className="gap-1">
          {Array.from({ length }, (_, slotIndex) => (
            <InputOTP.Slot
              className="size-10 sm:size-11"
              index={slotIndex}
              key={`otp-slot-${String(slotIndex + 1)}`}
            />
          ))}
        </InputOTP.Group>
      </InputOTP>

      <span
        className="field-error"
        data-visible={Boolean(errorMessage)}
        id={errorId}
      >
        {errorMessage}
      </span>
    </div>
  )
}
