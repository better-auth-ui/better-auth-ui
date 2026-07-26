import { Show } from "solid-js"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export type OtpFieldProps = {
  /** Visible label rendered above the input. */
  label: string
  /** Number of digits — keep in sync with the server's code length. */
  length: number
  value: string
  onInput: (value: string) => void
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

  return (
    <div class={cn("flex flex-col gap-2", props.class)}>
      <Label for={inputId()}>{props.label}</Label>

      <Input
        aria-describedby={props.errorMessage ? errorId() : undefined}
        aria-invalid={Boolean(props.errorMessage)}
        autocomplete="one-time-code"
        autofocus={props.autofocus}
        class="text-center font-mono text-lg tracking-[0.5em]"
        disabled={props.disabled}
        id={inputId()}
        inputmode="numeric"
        maxLength={props.length}
        name={props.name}
        onInput={(event) => {
          const next = normalizeCode(event.currentTarget.value)
          event.currentTarget.value = next
          props.onInput(next)
        }}
        spellcheck={false}
        value={props.value}
      />

      <Show when={props.errorMessage}>
        {(message) => (
          <p class="text-sm text-destructive" id={errorId()} role="alert">
            {message()}
          </p>
        )}
      </Show>
    </div>
  )
}
