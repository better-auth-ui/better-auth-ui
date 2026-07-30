"use client"

import {
  type PhoneVerificationError,
  type PhoneVerificationFlow,
  type PhoneVerificationResult,
  type PhoneVerificationSession,
  type PhoneVerificationStatus,
  phoneVerificationPlugin,
  phoneVerificationTerminalStatuses
} from "@better-auth-ui/core/plugins"
import { useCallback, useEffect, useRef, useState } from "react"

import { useCancelPhoneVerification } from "../../mutations/phone-verification/cancel-phone-verification-mutation"
import { useCreatePhoneVerification } from "../../mutations/phone-verification/create-phone-verification-mutation"
import { usePhoneVerificationStatus } from "../../queries/phone-verification/phone-verification-status-query"
import { useAuthPlugin } from "../use-auth-plugin"
import { useIsMobileDevice } from "./use-is-mobile-device"

/**
 * Hook-level verification state: the provider statuses plus `idle` (no
 * session yet) and `starting` (session being created).
 */
export type UsePhoneVerificationStatus =
  | "idle"
  | "starting"
  | PhoneVerificationStatus

export type UsePhoneVerificationOptions = {
  /** Override the plugin's configured flow. */
  flow?: PhoneVerificationFlow
  /** Provider user id (or linked external id) — required for the `"2fa"` flow. */
  userId?: string
  /** URL the user is sent back to after completing verification in WhatsApp. */
  callbackURL?: string
  /** Override the plugin's configured polling interval (ms). */
  pollingInterval?: number
  /** Override the plugin's configured timeout (ms). */
  timeout?: number
  /**
   * Start a verification session on mount.
   * @default true
   */
  autoStart?: boolean
  /** Called once when the session reaches `"verified"`. */
  onVerified?: (result: PhoneVerificationResult) => void
  /** Called when a request fails (network, API, or provider error). */
  onError?: (error: PhoneVerificationError) => void
}

export type UsePhoneVerificationResult = {
  /** Current verification state. */
  status: UsePhoneVerificationStatus
  /** Active session with WhatsApp links, once created. */
  session?: PhoneVerificationSession
  /** Latest status result — carries `phoneNumber` once verified. */
  result?: PhoneVerificationResult
  /** Verified phone number in E.164 format, once verified. */
  phoneNumber?: string
  /** Last request error, if any. */
  error: PhoneVerificationError | null
  /** Whether the page runs on a mobile device (open WhatsApp directly). */
  isMobileDevice: boolean
  /** Start a new verification session. No-op while one is active. */
  start: () => void
  /** Abandon the current session and start a fresh one. */
  retry: () => void
  /** Cancel the current session. */
  cancel: () => void
  /** Open WhatsApp with the pre-filled verification message. */
  openWhatsApp: () => void
}

/**
 * Orchestrates a WhatsApp phone verification flow: creates a session, polls
 * its status until a terminal state, enforces the configured timeout, and
 * exposes retry/cancel recovery actions.
 *
 * Polling stops automatically after success (or any other terminal status).
 * Configuration defaults come from `phoneVerificationPlugin`; each option can
 * be overridden per call.
 *
 * @example
 * ```tsx
 * const { status, session, openWhatsApp } = usePhoneVerification({
 *   onVerified: ({ phoneNumber }) => console.log("Verified:", phoneNumber)
 * })
 * ```
 */
export function usePhoneVerification(
  options: UsePhoneVerificationOptions = {}
): UsePhoneVerificationResult {
  const plugin = useAuthPlugin(phoneVerificationPlugin)

  const flow = options.flow ?? plugin.flow
  const pollingInterval = options.pollingInterval ?? plugin.pollingInterval
  const timeout = options.timeout ?? plugin.timeout
  const autoStart = options.autoStart ?? true
  const { userId, callbackURL, onVerified, onError } = options

  const isMobileDevice = useIsMobileDevice()

  const [session, setSession] = useState<PhoneVerificationSession>()
  // Client-side outcomes that override whatever the provider last reported.
  const [localStatus, setLocalStatus] = useState<"cancelled" | "timeout">()
  const [error, setError] = useState<PhoneVerificationError | null>(null)

  const onVerifiedRef = useRef(onVerified)
  onVerifiedRef.current = onVerified
  const onErrorRef = useRef(onError)
  onErrorRef.current = onError

  const handleError = useCallback((requestError: PhoneVerificationError) => {
    setError(requestError)
    onErrorRef.current?.(requestError)
  }, [])

  const { mutate: createVerification, isPending: isCreating } =
    useCreatePhoneVerification(plugin.client, {
      onSuccess: (createdSession) => {
        setSession(createdSession)
        setLocalStatus(undefined)
        setError(null)
      },
      onError: handleError
    })

  const { mutate: cancelVerification } = useCancelPhoneVerification(
    plugin.client,
    { onError: handleError }
  )

  const { data: result, error: statusError } = usePhoneVerificationStatus(
    plugin.client,
    { sessionId: session?.sessionId ?? "", flow, pollingInterval },
    { enabled: !!session && !localStatus }
  )

  const status: UsePhoneVerificationStatus =
    localStatus ??
    (session
      ? (result?.status ?? session.status)
      : isCreating
        ? "starting"
        : "idle")

  const statusRef = useRef(status)
  statusRef.current = status

  const start = useCallback(() => {
    if (
      statusRef.current !== "idle" &&
      !phoneVerificationTerminalStatuses.includes(
        statusRef.current as PhoneVerificationStatus
      )
    ) {
      return
    }

    setSession(undefined)
    setLocalStatus(undefined)
    setError(null)
    createVerification({
      sessionId: crypto.randomUUID(),
      flow,
      userId,
      callbackURL
    })
  }, [createVerification, flow, userId, callbackURL])

  const cancel = useCallback(() => {
    if (!session) return

    setLocalStatus("cancelled")
    cancelVerification({ sessionId: session.sessionId })
  }, [session, cancelVerification])

  const retry = useCallback(() => {
    if (
      session &&
      !phoneVerificationTerminalStatuses.includes(
        statusRef.current as PhoneVerificationStatus
      )
    ) {
      cancelVerification({ sessionId: session.sessionId })
    }

    setSession(undefined)
    setLocalStatus(undefined)
    setError(null)
    createVerification({
      sessionId: crypto.randomUUID(),
      flow,
      userId,
      callbackURL
    })
  }, [
    session,
    cancelVerification,
    createVerification,
    flow,
    userId,
    callbackURL
  ])

  const openWhatsApp = useCallback(() => {
    if (!session) return

    window.open(session.whatsApp.directLink, "_blank", "noopener,noreferrer")
  }, [session])

  // Auto-start once on mount (guarded against StrictMode double-invocation).
  const autoStartedRef = useRef(false)
  useEffect(() => {
    if (!autoStart || autoStartedRef.current) return

    autoStartedRef.current = true
    start()
  }, [autoStart, start])

  // Resolve to `"timeout"` when no terminal status arrives in time.
  useEffect(() => {
    if (!session) return

    const timer = setTimeout(() => {
      const current = statusRef.current
      if (
        phoneVerificationTerminalStatuses.includes(
          current as PhoneVerificationStatus
        )
      ) {
        return
      }

      setLocalStatus("timeout")
      cancelVerification({ sessionId: session.sessionId })
    }, timeout)

    return () => clearTimeout(timer)
  }, [session, timeout, cancelVerification])

  // Fire `onVerified` exactly once per session.
  const notifiedSessionRef = useRef<string | undefined>(undefined)
  useEffect(() => {
    if (result?.status !== "verified" || localStatus) return
    if (notifiedSessionRef.current === result.sessionId) return

    notifiedSessionRef.current = result.sessionId
    onVerifiedRef.current?.(result)
  }, [result, localStatus])

  // Surface polling errors without stopping the poll — transient network
  // failures and webhook delays recover on the next interval.
  useEffect(() => {
    if (statusError) handleError(statusError)
  }, [statusError, handleError])

  return {
    status,
    session,
    result,
    phoneNumber: result?.phoneNumber,
    error,
    isMobileDevice,
    start,
    retry,
    cancel,
    openWhatsApp
  }
}
