import type { AuthClient, AuthConfig } from "@better-auth-ui/core"

type ShouldProjectChild = (property: PropertyKey, depth: number) => boolean

const reactivePluginFields = new Set<PropertyKey>([
  "additionalFields",
  "localization",
  "roles"
])

function createReactiveProjection<T extends object>(
  read: () => T,
  shouldProjectChild: ShouldProjectChild = () => true,
  depth = 0
): T {
  const initialValue = read()
  const childProjections = new Map<PropertyKey, object>()
  const target = Array.isArray(initialValue) ? [] : {}

  return new Proxy(target as T, {
    get: (_target, property) => {
      const value = Reflect.get(read(), property)

      if (
        value === null ||
        typeof value !== "object" ||
        !shouldProjectChild(property, depth)
      ) {
        return value
      }

      const existing = childProjections.get(property)
      if (existing) return existing

      const projection = createReactiveProjection(
        () => Reflect.get(read(), property) as object,
        shouldProjectChild,
        depth + 1
      )
      childProjections.set(property, projection)
      return projection
    },
    getOwnPropertyDescriptor: (_target, property) => {
      const descriptor = Reflect.getOwnPropertyDescriptor(read(), property)
      if (!descriptor) return undefined

      return {
        ...descriptor,
        configurable: !(Array.isArray(initialValue) && property === "length")
      }
    },
    has: (_target, property) => Reflect.has(read(), property),
    ownKeys: () => Reflect.ownKeys(read())
  })
}

/** Keeps locale-sensitive config objects stable while reading their latest values. */
export function createReactiveAuthConfig<TAuthClient extends AuthClient>(
  read: () => AuthConfig<TAuthClient>
): AuthConfig<TAuthClient> {
  const locale = createReactiveProjection(() => read().locale)
  const localization = createReactiveProjection(() => read().localization)
  const plugins = createReactiveProjection(
    () => read().plugins,
    (property, depth) => depth === 0 || reactivePluginFields.has(property)
  )

  return new Proxy({} as AuthConfig<TAuthClient>, {
    get: (_target, property) => {
      if (property === "locale") return locale
      if (property === "localization") return localization
      if (property === "plugins") return plugins

      return read()[property as keyof AuthConfig]
    }
  })
}
