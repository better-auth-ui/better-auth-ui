/** Data type of the additional field. */
export type AdditionalFieldType = "string" | "number" | "boolean" | "date"

/** Runtime value held by an `AdditionalField` (matches `AdditionalFieldType`). */
export type AdditionalFieldValue = string | number | boolean | Date

/** UI rendering choice. Default is inferred from `AdditionalField.type`. */
export type AdditionalFieldInputType =
  | "input"
  | "textarea"
  | "number"
  | "slider"
  | "switch"
  | "checkbox"
  | "select"
  | "combobox"
  | "date"
  | "datetime"
  | "hidden"

/**
 * Augmentation target for widening `AdditionalField` slot types
 * (`label`, `renderProps`, `renderResult`) in UI packages.
 *
 * @example
 * declare module "@better-auth-ui/core" {
 *   interface AdditionalFieldRegister { label: ReactNode }
 * }
 */
// biome-ignore lint/suspicious/noEmptyInterface: augmentation target
export interface AdditionalFieldRegister {}

/** Resolved label type. Defaults to `string`. */
export type AdditionalFieldLabel = AdditionalFieldRegister extends {
  label: infer L
}
  ? L
  : string

/** Resolved argument type for `AdditionalField.render`. */
export type AdditionalFieldRenderProps = AdditionalFieldRegister extends {
  renderProps: infer P
}
  ? P
  : { name: string; field: AdditionalField; isPending?: boolean }

/** Resolved return type for `AdditionalField.render`. */
export type AdditionalFieldRenderResult = AdditionalFieldRegister extends {
  renderResult: infer R
}
  ? R
  : unknown

/** Option for a `select` input. */
export interface AdditionalFieldOption {
  label: AdditionalFieldLabel
  value: string
}

/** Configuration for a single additional user field. */
export interface AdditionalField {
  /** Field name. Used as the user object key and form input `name`. */
  name: string
  /** Data type of the field. */
  type: AdditionalFieldType
  /** Visible label rendered next to the input. */
  label: AdditionalFieldLabel
  /** Override the default UI rendering. @default inferred from `type` */
  inputType?: AdditionalFieldInputType
  /** Placeholder text. */
  placeholder?: string
  /** Content rendered as a prefix addon inside the input group. */
  prefix?: AdditionalFieldLabel
  /** Content rendered as a suffix addon inside the input group. */
  suffix?: AdditionalFieldLabel
  /**
   * `Intl.NumberFormat` options for number fields. Use `maximumFractionDigits`
   * (and optionally `minimumFractionDigits`) to allow decimals, or `style: "currency"`
   * / `style: "percent"` for richer formatting.
   */
  formatOptions?: Intl.NumberFormatOptions
  /** Minimum value. Applies to `number` and `slider` input types. */
  min?: number
  /** Maximum value. Applies to `number` and `slider` input types. */
  max?: number
  /** Step value. Applies to `number` and `slider` input types. */
  step?: number
  /** @default false */
  required?: boolean
  /**
   * Default value used to seed the input on the sign-up form. On the user
   * profile, the value is always re-seeded from the persisted session.
   */
  defaultValue?: AdditionalFieldValue | null
  /**
   * Render the field but exclude it from submission payloads.
   * @default false
   */
  readOnly?: boolean
  /**
   * Show a copy-to-clipboard button as a suffix. Input variant only.
   * @default false
   */
  copyable?: boolean
  /** Options for the select input type. */
  options?: AdditionalFieldOption[]
  /**
   * Custom client-side validation. Throw an `Error` (the `message` is shown
   * to the user) when invalid; return / resolve normally when valid.
   *
   * Receives the parsed value (after `parseAdditionalFieldValue`).
   */
  validate?: (
    value: AdditionalFieldValue | null | undefined
  ) => void | Promise<void>
  /**
   * Render on the sign-up form. Pass `"above"` to render between the `email`
   * and `password` fields; otherwise the field renders below the password
   * block. `true` is an alias for `"below"`.
   * @default false
   */
  signUp?: boolean | "above" | "below"
  /** Render on the user profile. @default true */
  profile?: boolean
  /**
   * Custom renderer. Replaces the host UI package's built-in input. Must emit
   * an input named `field.name` so the value is captured by the form's
   * `FormData`.
   */
  render?: (props: AdditionalFieldRenderProps) => AdditionalFieldRenderResult
}

/** Ordered list of `AdditionalField` configurations. */
export type AdditionalFields = AdditionalField[]

/**
 * Convert a raw form value into the JS value Better Auth expects.
 * Returns `null` for blank input (explicit clear), `undefined` when omitted
 * or unparseable. Booleans always return `true`/`false`.
 */
export function parseAdditionalFieldValue(
  field: AdditionalField,
  raw: string | null | undefined
): AdditionalFieldValue | null | undefined {
  if (field.type === "boolean") {
    // FormData: checked checkbox/switch sends "on"; unchecked sends nothing.
    return raw === "on" || raw === "true"
  }

  if (raw == null) return undefined
  if (raw === "") return null

  if (field.type === "number") {
    const parsed = Number(raw)
    return Number.isNaN(parsed) ? undefined : parsed
  }

  if (field.type === "date") {
    const parsed = new Date(raw)
    return Number.isNaN(parsed.getTime()) ? undefined : parsed
  }

  return raw
}

/** Parse and validate a model's configured fields from submitted form data. */
export async function parseAdditionalFieldValues(
  fields: AdditionalFields,
  formData: FormData
): Promise<Record<string, AdditionalFieldValue | null>> {
  const values: Record<string, AdditionalFieldValue | null> = {}

  for (const field of fields) {
    if (field.readOnly) continue

    const value = parseAdditionalFieldValue(
      field,
      formData.get(field.name) as string | null
    )
    await field.validate?.(value)
    if (value !== undefined) values[field.name] = value
  }

  return values
}

/** Seed field defaults from a Better Auth model returned by a query. */
export function fieldsWithModelValues(
  fields: AdditionalFields,
  model: Record<string, unknown>
): AdditionalFields {
  return fields.map((field) => {
    const value = model[field.name]

    if (
      value !== null &&
      typeof value !== "string" &&
      typeof value !== "number" &&
      typeof value !== "boolean" &&
      !(value instanceof Date)
    ) {
      return field
    }

    return { ...field, defaultValue: value }
  })
}

/** Format a persisted additional-field value for compact read-only display. */
export function formatAdditionalFieldValue(
  value: unknown,
  languageTag?: string
): string | undefined {
  if (value === null || value === undefined || value === "") return undefined
  if (value instanceof Date) return value.toLocaleString(languageTag)
  if (typeof value === "string") {
    const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
    if (dateOnly) {
      const [, year, month, day] = dateOnly
      return new Date(
        Number(year),
        Number(month) - 1,
        Number(day)
      ).toLocaleString(languageTag)
    }

    const parsed = new Date(value)
    if (/^\d{4}-\d{2}-\d{2}T/.test(value) && !Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleString(languageTag)
    }
    return value
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value)
  }
  return undefined
}

/** Resolve the effective `inputType`, defaulting based on `field.type`. */
export function resolveInputType(
  field: AdditionalField
): AdditionalFieldInputType {
  if (field.inputType) return field.inputType

  switch (field.type) {
    case "number":
      return "number"
    case "boolean":
      return "switch"
    case "date":
      return "date"
    default:
      return "input"
  }
}
