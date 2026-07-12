import {
  type AuthView,
  type NavigateOptions,
  viewPaths
} from "@better-auth-ui/core"
import { useCallback, useMemo, useRef, useState } from "react"
import type { AuthNavigation } from "./types"

/**
 * Resolve an {@link AuthView} from a {@link NavigateOptions}: prefer the
 * explicit `view` hint (added in core), otherwise match the last path segment
 * of `to` against the default auth view paths.
 */
function resolveView(options: NavigateOptions): AuthView | undefined {
  if (options.view) return options.view

  const segment = options.to.split("?")[0].split("/").filter(Boolean).pop()
  if (!segment) return undefined

  const entries = Object.entries(viewPaths.auth) as [AuthView, string][]
  return entries.find(([, path]) => path === segment)?.[0]
}

/**
 * Default, router-free navigation: keeps the current auth view in React state
 * so `<Auth />` works with zero router wiring. `push`/`navigate` swap the view;
 * params (e.g. a reset `token`) are held in memory.
 *
 * Call this hook and pass the result to `<AuthProvider navigation={...} />`, or
 * omit it entirely — `AuthProvider` falls back to this adapter automatically.
 */
export function useStateNavigation(
  initialView: AuthView = "signIn"
): AuthNavigation {
  const [view, setView] = useState<AuthView>(initialView)
  const paramsRef = useRef<Record<string, string>>({})

  const push = useCallback<AuthNavigation["push"]>((next, options) => {
    paramsRef.current = options?.params ?? {}
    setView(next)
  }, [])

  const navigate = useCallback<AuthNavigation["navigate"]>((options) => {
    const next = resolveView(options)
    paramsRef.current = options.params ?? {}
    if (next) setView(next)
  }, [])

  const current = useCallback(() => view, [view])

  const getParam = useCallback((key: string) => paramsRef.current[key], [])

  return useMemo(
    () => ({ push, current, getParam, navigate }),
    [push, current, getParam, navigate]
  )
}
