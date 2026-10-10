import {
  getNavigationParams,
  getNavigationPath,
  resolveNavigationTarget,
  handleUnhandledNavigation,
  type NavigationRouteConfig
} from "./route-config"
import { useCallback, useMemo, useRef, useState } from "react"
import {
  type Navigation,
  type PushTarget,
  toViewTarget,
  type ViewTarget
} from "./types"

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
  const routesRef = useRef<NavigationRouteConfig>({})
  const configure = useCallback((config: NavigationRouteConfig) => {
    routesRef.current = config
  }, [])
  const paramsRef = useRef<Record<string, string>>({})

  const push = useCallback<Navigation["push"]>((next, options) => {
    const target = toViewTarget(next)
    paramsRef.current = {
      ...(target.section === "auth" && paramsRef.current.redirectTo
        ? { redirectTo: paramsRef.current.redirectTo }
        : {}),
      ...options?.params
    }
    setTarget(toViewTarget(next))
  }, [])

  const navigate = useCallback<Navigation["navigate"]>((options) => {
    const next = resolveNavigationTarget(options, routesRef.current)
    paramsRef.current = getNavigationParams(options.to, options.params)
    if (next) setTarget(next)
    else handleUnhandledNavigation(options, routesRef.current)
  }, [])

  const current = useCallback(() => target, [target])
  const getPath = useCallback(
    (next?: ViewTarget) =>
      getNavigationPath(
        next ?? target,
        routesRef.current,
        next ? undefined : paramsRef.current
      ),
    [target]
  )
  const getParam = useCallback((key: string) => paramsRef.current[key], [])

  return useMemo(
    () => ({ push, current, getParam, navigate, configure, getPath }),
    [push, current, getParam, navigate, configure, getPath]
  )
}
