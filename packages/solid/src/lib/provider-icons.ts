import { providerNames } from "@better-auth-ui/core"

/**
 * Stable list of provider icon keys supported by core.
 *
 * Solid component icons are intentionally deferred to the Zaidan registry slice;
 * this helper lets consumers and registry tooling align on the same provider
 * namespace without shipping React icon components from this package.
 */
export const providerIconNames = Object.keys(providerNames).sort()
