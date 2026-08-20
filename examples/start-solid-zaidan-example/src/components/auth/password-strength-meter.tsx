import {
  evaluatePasswordStrength,
  type PasswordStrengthLevel
} from "@better-auth-ui/core"
import { useAuth } from "@better-auth-ui/solid"
import { For, Show } from "solid-js"
import { cn } from "@/lib/utils"

/** Fixed segment identities, so the bars keep their own keys. */
const STRENGTH_SEGMENTS = [1, 2, 3, 4] as const

type FilledLevel = Exclude<PasswordStrengthLevel, "empty">

const segmentColors: Record<FilledLevel, string> = {
  weak: "bg-destructive",
  fair: "bg-amber-500",
  good: "bg-sky-500",
  strong: "bg-emerald-500"
}

export type PasswordStrengthMeterProps = {
  /** The password as typed. Renders nothing while it is empty. */
  password: string
  class?: string
}

/**
 * Four-segment strength hint shown while someone picks a new password.
 *
 * Renders nothing when `emailAndPassword.strengthMeter` is off or the field is
 * empty. The score never gates submission: your server rules stay the
 * authority on what is acceptable.
 */
export function PasswordStrengthMeter(props: PasswordStrengthMeterProps) {
  const auth = useAuth()
  const strength = () =>
    evaluatePasswordStrength(props.password, {
      minLength: auth.emailAndPassword?.minPasswordLength
    })
  const levelLabels = (): Record<FilledLevel, string> => ({
    weak: auth.localization.auth.passwordWeak,
    fair: auth.localization.auth.passwordFair,
    good: auth.localization.auth.passwordGood,
    strong: auth.localization.auth.passwordStrong
  })

  return (
    <Show
      when={
        auth.emailAndPassword?.strengthMeter && strength().level !== "empty"
      }
    >
      <div class={cn("flex flex-col gap-1.5", props.class)}>
        {/* Decorative: the live region below is what gets announced. */}
        <div aria-hidden="true" class="flex gap-1">
          <For each={STRENGTH_SEGMENTS}>
            {(segment) => (
              <span
                class={cn(
                  "h-1 flex-1 rounded-full bg-muted transition-colors",
                  segment <= strength().score &&
                    segmentColors[strength().level as FilledLevel]
                )}
              />
            )}
          </For>
        </div>

        <p aria-live="polite" class="text-muted-foreground text-xs">
          {auth.localization.auth.passwordStrength}:{" "}
          <span class="font-medium text-foreground">
            {levelLabels()[strength().level as FilledLevel]}
          </span>
        </p>
      </div>
    </Show>
  )
}
