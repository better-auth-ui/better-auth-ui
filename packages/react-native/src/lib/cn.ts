import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merge class names, mirroring the web `cn` helper: `clsx` for conditional
 * composition plus `tailwind-merge` for last-wins conflict resolution. The
 * resulting `className` string is resolved to a React Native style by this
 * package's own `tw` resolver, so no styling engine is needed in the app.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
