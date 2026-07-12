import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merge class names, mirroring the web `cn` helper: `clsx` for conditional
 * composition plus `tailwind-merge` for last-wins conflict resolution. The
 * resulting `className` string is consumed by nativewind at the app level.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
