import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Compose and merge CSS class names, resolving conflicting Tailwind CSS classes.
 *
 * @param inputs - Class value entries (strings, arrays, objects, or conditional values) to include in the composed result
 * @returns The combined class string with Tailwind CSS conflicts resolved
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
