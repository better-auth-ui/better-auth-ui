"use client"

import { useSyncExternalStore } from "react"

/**
 * Indicates whether the current rendering context is hydrated (client-side).
 *
 * @returns `true` when running on the client (hydrated), `false` when rendering on the server
 */
export function useHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  )
}

/**
 * Create a subscription handler that does nothing and returns a no-op cleanup.
 *
 * @returns A cleanup function that performs no action when invoked.
 */
function subscribe() {
  return () => {}
}

