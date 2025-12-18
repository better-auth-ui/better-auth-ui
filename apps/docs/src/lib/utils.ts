import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines class values into a single class string and resolves Tailwind CSS conflicts.
 *
 * @param inputs - Class values (strings, arrays, objects, etc.) to combine
 * @returns The resulting class string with conflicting Tailwind classes merged/removed
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}