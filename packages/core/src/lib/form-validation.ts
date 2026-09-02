export type FormFieldError = Readonly<{ message: string }>

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
  for (const error of errors) {
    if (typeof error === "string" && error) return error

    if (
      error &&
      typeof error === "object" &&
      "message" in error &&
      typeof error.message === "string" &&
      error.message
    )
      return error.message
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
