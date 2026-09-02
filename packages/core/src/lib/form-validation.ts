export type FormFieldError = Readonly<{ message: string }>

export type AuthFormServerError = Readonly<{
  fields?: Readonly<Record<string, FormFieldError>>
  form?: FormFieldError
}>

export type StringLengthValidation = {
  maxLength?: number
  maxLengthMessage?: string
  minLength?: number
  minLengthMessage?: string
  requiredMessage?: string
  trim?: boolean
}

export type UrlValidation = {
  allowedProtocols?: readonly string[]
  invalidMessage: string
  requiredMessage?: string
}

export function createFormFieldError(
  message: string | undefined
): FormFieldError | undefined {
  return message ? { message } : undefined
}

export function getFormFieldErrorMessage(
  errors: readonly unknown[]
): string | undefined {
  return getFormFieldErrors(errors)[0]?.message
}

/** Normalizes the error shapes accepted by TanStack Form field validators. */
export function getFormFieldErrors(
  errors: readonly unknown[]
): FormFieldError[] {
  return errors.flatMap((error) => {
    if (typeof error === "string" && error) return [{ message: error }]

    if (
      error &&
      typeof error === "object" &&
      "message" in error &&
      typeof error.message === "string" &&
      error.message
    )
      return [{ message: error.message }]

    return []
  })
}

function getErrorMessage(error: unknown): string | undefined {
  if (typeof error === "string") return error || undefined
  if (!error || typeof error !== "object") return undefined

  if ("message" in error && typeof error.message === "string" && error.message)
    return error.message

  if (
    "statusText" in error &&
    typeof error.statusText === "string" &&
    error.statusText
  )
    return error.statusText
}

function getServerFieldErrors(value: unknown) {
  if (!value || typeof value !== "object") return undefined

  const candidate =
    "fieldErrors" in value
      ? value.fieldErrors
      : "fields" in value
        ? value.fields
        : undefined

  if (!candidate || typeof candidate !== "object") return undefined

  return Object.fromEntries(
    Object.entries(candidate).flatMap(([field, error]) => {
      const message = Array.isArray(error)
        ? getFormFieldErrorMessage(error)
        : getErrorMessage(error)
      return message ? [[field, { message }]] : []
    })
  )
}

/** Normalizes thrown mutation errors for TanStack Form's global error map. */
export function normalizeAuthFormServerError(
  error: unknown,
  fallbackMessage: string
): AuthFormServerError {
  const nestedBody =
    error &&
    typeof error === "object" &&
    "body" in error &&
    error.body &&
    typeof error.body === "object"
      ? error.body
      : undefined
  const fields =
    getServerFieldErrors(error) ?? getServerFieldErrors(nestedBody) ?? undefined
  const message =
    getErrorMessage(error) ?? getErrorMessage(nestedBody) ?? fallbackMessage

  return {
    fields,
    form: createFormFieldError(message)
  }
}

export function validateStringLength(
  value: string,
  {
    maxLength,
    maxLengthMessage,
    minLength,
    minLengthMessage,
    requiredMessage,
    trim = false
  }: StringLengthValidation
): FormFieldError | undefined {
  const candidate = trim ? value.trim() : value

  if (!candidate && requiredMessage)
    return createFormFieldError(requiredMessage)
  if (minLength !== undefined && candidate.length < minLength)
    return createFormFieldError(minLengthMessage)
  if (maxLength !== undefined && candidate.length > maxLength)
    return createFormFieldError(maxLengthMessage)
}

export function validateEmailAddress(
  value: string,
  {
    invalidMessage,
    requiredMessage
  }: { invalidMessage: string; requiredMessage?: string }
): FormFieldError | undefined {
  const candidate = value.trim()

  if (!candidate)
    return requiredMessage ? createFormFieldError(requiredMessage) : undefined

  const separator = candidate.lastIndexOf("@")
  const firstSeparator = candidate.indexOf("@")
  const domain = candidate.slice(separator + 1)
  const isValid =
    separator > 0 &&
    separator === firstSeparator &&
    separator < candidate.length - 1 &&
    !candidate.includes(" ") &&
    domain.includes(".") &&
    !domain.startsWith(".") &&
    !domain.endsWith(".")

  return isValid ? undefined : createFormFieldError(invalidMessage)
}

export function validateMatchingValue(
  value: string,
  expected: string,
  message: string
): FormFieldError | undefined {
  return value === expected ? undefined : createFormFieldError(message)
}

export function validateMinimumItems<T>(
  value: readonly T[],
  minimum: number,
  message: string
): FormFieldError | undefined {
  return value.length >= minimum ? undefined : createFormFieldError(message)
}

export function validateAbsoluteUrl(
  value: string,
  { allowedProtocols, invalidMessage, requiredMessage }: UrlValidation
): FormFieldError | undefined {
  const candidate = value.trim()

  if (!candidate)
    return requiredMessage ? createFormFieldError(requiredMessage) : undefined

  try {
    const url = new URL(candidate)
    if (allowedProtocols && !allowedProtocols.includes(url.protocol))
      return createFormFieldError(invalidMessage)
    return undefined
  } catch {
    return createFormFieldError(invalidMessage)
  }
}

export function validateAbsoluteUrlList(
  value: string,
  options: UrlValidation
): FormFieldError | undefined {
  const entries = value
    .split(/\r?\n/)
    .map((entry) => entry.trim())
    .filter(Boolean)

  if (entries.length === 0)
    return options.requiredMessage
      ? createFormFieldError(options.requiredMessage)
      : undefined

  return entries.reduce<FormFieldError | undefined>(
    (error, entry) => error ?? validateAbsoluteUrl(entry, options),
    undefined
  )
}
