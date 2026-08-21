/** A finite static path registered with the administration shell. */
export type AdminRouteEntry = {
  id: string
  path: string
}

/** Resolve an exact admin path without interpreting nested or dynamic values. */
export function resolveAdminPath(
  path: string | undefined,
  entries: readonly AdminRouteEntry[]
) {
  if (path === undefined) return undefined
  return entries.find((entry) => entry.path === path)
}
