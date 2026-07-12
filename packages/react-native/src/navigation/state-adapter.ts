import {
  type AuthView,
  type NavigateOptions,
  type SettingsView,
  viewPaths
} from "@better-auth-ui/core"
import { useCallback, useMemo, useRef, useState } from "react"
import {
  type Navigation,
  type PushTarget,
  toViewTarget,
  type ViewTarget
} from "./types"

/**
 * Resolve a {@link ViewTarget} from a core {@link NavigateOptions}: prefer the
 * explicit `view` hint (auth), otherwise match the last path segment of `to`
 * against the auth and settings view paths.
 */
function resolveTarget(options: NavigateOptions): ViewTarget | undefined {
  if (options.view) return { section: "auth", view: options.view }

  const segment = options.to.split("?")[0].split("/").filter(Boolean).pop()
  if (!segment) return undefined

  const authEntry = (
    Object.entries(viewPaths.auth) as [AuthView, string][]
  ).find(([, path]) => path === segment)
  if (authEntry) return { section: "auth", view: authEntry[0] }

  const settingsEntry = (
    Object.entries(viewPaths.settings) as [SettingsView, string][]
  ).find(([, path]) => path === segment)
  if (settingsEntry) return { section: "settings", view: settingsEntry[0] }

  return undefined
}

/**
 * Default, router-free navigation: keeps the current target in React state so
 * `<Auth />` (and `<Settings />` / `<Organization />`) work with zero router
 * wiring. `push`/`navigate` swap the target; params (e.g. a reset `token`) are
 * held in memory.
 *
 * Call this hook and pass the result to `<AuthProvider navigation={...} />`, or
 * omit it entirely — `AuthProvider` falls back to this adapter automatically.
 */
export function useStateNavigation(
  initialView: PushTarget = "signIn"
): Navigation {
  const [target, setTarget] = useState<ViewTarget>(() =>
    toViewTarget(initialView)
  )
  const paramsRef = useRef<Record<string, string>>({})

  const push = useCallback<Navigation["push"]>((next, options) => {
    paramsRef.current = options?.params ?? {}
    setTarget(toViewTarget(next))
  }, [])

  const navigate = useCallback<Navigation["navigate"]>((options) => {
    const next = resolveTarget(options)
    paramsRef.current = options.params ?? {}
    if (next) setTarget(next)
  }, [])

  const current = useCallback(() => target, [target])
  const getParam = useCallback((key: string) => paramsRef.current[key], [])

  return useMemo(
    () => ({ push, current, getParam, navigate }),
    [push, current, getParam, navigate]
  )
}
