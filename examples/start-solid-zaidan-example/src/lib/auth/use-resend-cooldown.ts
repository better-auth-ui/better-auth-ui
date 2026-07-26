import { createSignal, onCleanup } from "solid-js"

/** Seconds a resend button stays disabled to keep users off the rate limit. */
export const RESEND_COOLDOWN_SECONDS = 60

/**
 * Countdown state for "resend code" buttons.
 *
 * @param initialSeconds - Seconds to start at. Pass `0` when nothing has been
 *   sent yet, or the cooldown length when the flow arrives right after a send.
 */
export function useResendCooldown(initialSeconds = 0) {
  const [cooldown, setCooldown] = createSignal(initialSeconds)

  const interval = setInterval(() => {
    setCooldown((current) => (current > 0 ? current - 1 : 0))
  }, 1000)

  onCleanup(() => clearInterval(interval))

  return {
    cooldown,
    isCoolingDown: () => cooldown() > 0,
    startCooldown: (seconds = RESEND_COOLDOWN_SECONDS) => setCooldown(seconds)
  }
}
