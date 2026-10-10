import {
  basePaths,
  viewPaths,
  type AuthView,
  type NavigateOptions
} from "@better-auth-ui/core"
import type { ViewTarget } from "./types"

export type NavigationRouteConfig = {
  basePaths?: Partial<typeof basePaths>
  viewPaths?: {
    auth?: Record<string, string | undefined>
    settings?: Record<string, string | undefined>
    admin?: Record<string, string | undefined>
    organization?: Record<string, string | undefined>
  }
  slugPrefix?: string
  baseURL?: string
  onUnhandledNavigate?: (options: NavigateOptions) => void
}

function defined<T extends object>(value: T | undefined): Partial<T> {
  return Object.fromEntries(
    Object.entries(value ?? {}).filter(([, value]) => value !== undefined)
  ) as Partial<T>
}

export function mergeRouteConfig(
  base: NavigationRouteConfig,
  overrides: NavigationRouteConfig
): NavigationRouteConfig {
  return {
    ...base,
    ...defined(overrides),
    basePaths: { ...base.basePaths, ...defined(overrides.basePaths) },
    viewPaths: {
      auth: { ...base.viewPaths?.auth, ...defined(overrides.viewPaths?.auth) },
      settings: {
        ...base.viewPaths?.settings,
        ...defined(overrides.viewPaths?.settings)
      },
      admin: {
        ...base.viewPaths?.admin,
        ...defined(overrides.viewPaths?.admin)
      },
      organization: {
        ...base.viewPaths?.organization,
        ...defined(overrides.viewPaths?.organization)
      }
    }
  }
}

export function resolveRouteConfig(config: NavigationRouteConfig = {}) {
  return {
    ...config,
    basePaths: { ...basePaths, ...defined(config.basePaths) },
    viewPaths: {
      auth: { ...viewPaths.auth, ...defined(config.viewPaths?.auth) } as Record<
        string,
        string | undefined
      >,
      settings: {
        ...viewPaths.settings,
        ...defined(config.viewPaths?.settings)
      } as Record<string, string | undefined>,
      admin: {
        ...viewPaths.admin,
        ...defined(config.viewPaths?.admin)
      } as Record<string, string | undefined>,
      organization: {
        settings: "settings",
        people: "people",
        teams: "teams",
        roles: "roles",
        ...defined(config.viewPaths?.organization)
      } as Record<string, string | undefined>
    },
    slugPrefix: config.slugPrefix ?? ""
  }
}

const trimPath = (value: string) => value.replace(/\/+$/, "") || "/"
const decode = (value: string) => {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

export function getNavigationParams(
  to: string,
  overrides?: Record<string, string>
) {
  const query = to.split("?")[1]?.split("#")[0]
  const params: Record<string, string> = {}
  for (const entry of query?.split("&") ?? []) {
    if (!entry) continue
    const separator = entry.indexOf("=")
    const key = decode(
      (separator < 0 ? entry : entry.slice(0, separator)).replaceAll("+", " ")
    )
    const value = decode(
      (separator < 0 ? "" : entry.slice(separator + 1)).replaceAll("+", " ")
    )
    if (!Object.hasOwn(params, key)) params[key] = value
  }
  return { ...params, ...overrides }
}

export function getNavigationPath(
  target: ViewTarget,
  config: NavigationRouteConfig = {},
  params?: Record<string, string>
) {
  const routes = resolveRouteConfig(config)
  const segment = routes.viewPaths[target.section][target.view] ?? target.view
  const base = trimPath(routes.basePaths[target.section])
  const slug =
    target.section === "organization" && target.slug
      ? `/${routes.slugPrefix}${encodeURIComponent(target.slug)}`
      : ""
  const query = Object.entries(params ?? {})
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
    )
    .join("&")
  return `${base === "/" ? "" : base}${slug}/${segment}${query ? `?${query}` : ""}`
}

export function resolveNavigationTarget(
  options: NavigateOptions,
  config: NavigationRouteConfig = {}
): ViewTarget | undefined {
  if (options.view) return { section: "auth", view: options.view }
  const routes = resolveRouteConfig(config)
  let destination = options.to
  if (/^[a-z][a-z\d+.-]*:/i.test(destination) || destination.startsWith("//")) {
    if (!routes.baseURL) return undefined
    try {
      const url = new URL(destination, routes.baseURL)
      const origin = new URL(routes.baseURL)
      if (
        url.username ||
        url.password ||
        url.protocol !== origin.protocol ||
        url.host !== origin.host
      )
        return undefined
      destination = url.pathname
    } catch {
      return undefined
    }
  }
  const path = trimPath(destination.split(/[?#]/)[0])
  for (const section of [
    "auth",
    "settings",
    "admin",
    "organization"
  ] as const) {
    const base = trimPath(routes.basePaths[section])
    const prefix = base === "/" ? "/" : `${base}/`
    if (!path.startsWith(prefix)) continue
    const tail = path.slice(prefix.length)
    if (section === "organization") {
      const separator = tail.indexOf("/")
      if (separator < 1) continue
      const slugSegment = tail.slice(0, separator)
      if (!slugSegment.startsWith(routes.slugPrefix)) continue
      const slug = decode(slugSegment.slice(routes.slugPrefix.length))
      const segment = tail.slice(separator + 1)
      const entry = Object.entries(routes.viewPaths.organization).find(
        ([, path]) => path === segment
      )
      if (slug && entry) return { section, view: entry[0], slug }
    } else {
      const entry = Object.entries(routes.viewPaths[section]).find(
        ([, path]) => path === tail
      )
      if (!entry) continue
      if (section === "auth") return { section, view: entry[0] as AuthView }
      return { section, view: entry[0] }
    }
  }
}

export function handleUnhandledNavigation(
  options: NavigateOptions,
  config: NavigationRouteConfig = {}
) {
  if (config.onUnhandledNavigate) {
    config.onUnhandledNavigate(options)
    return
  }
  throw new Error(
    `[Better Auth UI] No native route handles "${options.to}". Configure onUnhandledNavigate for application destinations.`
  )
}
