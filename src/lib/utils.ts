import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import * as z from "zod"
import type { AuthLocalization } from "../localization/auth-localization"
import type { PasswordValidation } from "../types/password-validation"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function isValidEmail(email: string) {
    const emailRegex: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

/**
 * Converts error codes from SNAKE_CASE to camelCase
 * Example: INVALID_TWO_FACTOR_COOKIE -> invalidTwoFactorCookie
 */
export function errorCodeToCamelCase(errorCode: string): string {
    return errorCode
        .toLowerCase()
        .replace(/_([a-z])/g, (_, char) => char.toUpperCase())
}

/**
 * Gets a localized error message from an error object
 */
export function getLocalizedError({
    error,
    localization,
    localizeErrors = true
}: {
    // biome-ignore lint/suspicious/noExplicitAny: ignore
    error: any
    localization?: Partial<AuthLocalization>
    localizeErrors: boolean
}) {
    const DEFAULT_ERROR_MESSAGE = "Request failed"

    // If localization is disabled, return backend error message directly
    if (!localizeErrors) {
        if (error?.message) return error.message
        if (error?.error?.message) return error.error.message

        return DEFAULT_ERROR_MESSAGE
    }

    if (typeof error === "string") {
        if (localization?.[error as keyof AuthLocalization])
            return localization[error as keyof AuthLocalization]
    }

    if (error?.error) {
        if (error.error.code) {
            const errorCode = error.error.code as keyof AuthLocalization
            if (localization?.[errorCode]) return localization[errorCode]
        }

        return (
            error.error.message ||
            error.error.code ||
            error.error.statusText ||
            localization?.REQUEST_FAILED
        )
    }

    return (
        error?.message || localization?.REQUEST_FAILED || DEFAULT_ERROR_MESSAGE
    )
}

export function getSearchParam(paramName: string) {
    return typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get(paramName)
        : null
}

export function getViewByPath<T extends object>(viewPaths: T, path?: string) {
    for (const key in viewPaths) {
        if (viewPaths[key] === path) {
            return key
        }
    }
}

export function getKeyByValue<T extends Record<string, unknown>>(
    object: T,
    value?: T[keyof T]
): keyof T | undefined {
    return (Object.keys(object) as Array<keyof T>).find(
        (key) => object[key] === value
    )
}

export function getPasswordSchema(
    passwordValidation?: PasswordValidation,
    localization?: AuthLocalization
) {
    let schema = z.string().min(1, {
        message: localization?.PASSWORD_REQUIRED
    })
    if (passwordValidation?.minLength) {
        schema = schema.min(passwordValidation.minLength, {
            message: localization?.PASSWORD_TOO_SHORT
        })
    }
    if (passwordValidation?.maxLength) {
        schema = schema.max(passwordValidation.maxLength, {
            message: localization?.PASSWORD_TOO_LONG
        })
    }
    if (passwordValidation?.regex) {
        schema = schema.regex(passwordValidation.regex, {
            message: localization?.INVALID_PASSWORD
        })
    }
    return schema
}
