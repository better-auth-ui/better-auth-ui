import { createMemo, For, Show } from "solid-js"

import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot
} from "@/components/ui/input-otp"
import { cn } from "@/lib/utils"

export type OtpFieldProps = {
  /** Visible label rendered above the input. */
  label: string
  /** Number of digits — keep in sync with the server's code length. */
  length: number
  value: string
  onInput: (value: string) => void
  onComplete?: (value: string) => void
  autofocus?: boolean
  class?: string
  disabled?: boolean
  errorMessage?: string
  id?: string
  name?: string
}

/** Strip everything the numeric field can't hold — pasted codes often carry spaces or dashes. */
function normalizeCode(value: string) {
  return value.replace(/\D/g, "")
}

function createOtpSlots(length: number) {
  return Array.from({ length }, (_, slotIndex) => ({
    id: `otp-slot-${String(slotIndex + 1)}`,
    index: slotIndex
  }))
}

/**
 * Labelled one-time-code input.
 *
 * Shared by every code-based flow (email OTP, two-factor challenge,
 * two-factor enrollment) so spacing, pasting, and error wiring behave the
 * same everywhere.
 */
export function OtpField(props: OtpFieldProps) {
  const inputId = () => props.id ?? "otp-code"
  const errorId = () => `${inputId()}-error`
  const slots = createMemo(() => createOtpSlots(props.length))

  return (
    <Field class={cn(props.class)} data-invalid={Boolean(props.errorMessage)}>
      <FieldLabel for={inputId()}>{props.label}</FieldLabel>

      <InputOTP
        maxLength={props.length}
        aria-describedby={props.errorMessage ? errorId() : undefined}
        aria-invalid={Boolean(props.errorMessage)}
        aria-label={props.label}
        autocomplete="one-time-code"
        autofocus={props.autofocus}
        containerClass="w-full justify-center"
        disabled={props.disabled}
        id={inputId()}
        inputmode="numeric"
        name={props.name}
        pattern="^\\d*$"
        value={props.value}
        onValueChange={(next) => props.onInput(normalizeCode(next))}
        onComplete={(completedCode) =>
          props.onComplete?.(normalizeCode(completedCode))
        }
      >
        <InputOTPGroup>
          <For each={slots()}>
            {(slot) => <InputOTPSlot index={slot.index} />}
          </For>
        </InputOTPGroup>
      </InputOTP>

      <Show when={props.errorMessage}>
        {(message) => <FieldError id={errorId()}>{message()}</FieldError>}
      </Show>
    </Field>
  )
}
