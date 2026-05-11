import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Built-in organization roles shipped by the Better Auth organization plugin. */
export type BaseOrganizationRoles = "owner" | "admin" | "member"
