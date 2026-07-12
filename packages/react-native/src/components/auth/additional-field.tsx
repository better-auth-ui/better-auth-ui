import { resolveInputType } from "@better-auth-ui/core"
import { useAuth } from "@better-auth-ui/react"
import {
  type ComponentType,
  useCallback,
  useEffect,
  useRef,
  useState
} from "react"
import { Text, View } from "react-native"
import type { AdditionalFieldProps } from "../../lib/auth-plugin"
import { copyText } from "../../lib/clipboard"
import { Button } from "../../primitives/button"
import { Checkbox } from "../../primitives/checkbox"
import { ComboBox } from "../../primitives/combobox"
import { DateField, DatePicker } from "../../primitives/date-picker"
import { FieldError, Label, TextField } from "../../primitives/field"
import { useForm } from "../../primitives/form"
import { Input, InputGroup } from "../../primitives/input"
import { NumberField, TextArea } from "../../primitives/inputs-extra"
import { Select } from "../../primitives/menu"
import { Slider } from "../../primitives/slider"
import { Switch } from "../../primitives/switch-radio"
import { toast } from "../../primitives/toast"
import { Check, Copy } from "../../primitives/ui-icons"

// Re-exported here so the main entrypoint surface is unchanged.
export type { AdditionalFieldProps } from "../../lib/auth-plugin"

/** Coerce a `defaultValue` into a display string for text-like inputs. */
function toStringValue(value: unknown): string {
  if (value == null) return ""
  if (value instanceof Date) return value.toISOString()
  return String(value)
}

/** Coerce a `defaultValue` into a `number`, or `undefined` if unparseable. */
function toNumberValue(value: unknown): number | undefined {
  if (typeof value === "number") return value
  if (value == null || value === "") return undefined
  const parsed = Number(value)
  return Number.isNaN(parsed) ? undefined : parsed
}

/** Coerce a `defaultValue` into a `boolean` (mirrors heroui's `"true"` string check). */
function toBooleanValue(value: unknown): boolean {
  return value === true || value === "true"
}

/** Coerce a `defaultValue` into a `Date`, or `undefined` if unparseable/absent. */
function toDateValue(value: unknown): Date | undefined {
  if (value instanceof Date) return value
  if (typeof value === "string") {
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? undefined : parsed
  }
  return undefined
}

/** Format a numeric value with the field's `Intl.NumberFormat` options (mirrors
 * heroui's `Slider.Output`/`NumberField` `formatOptions`), falling back to the
 * raw string if `Intl` rejects the options. */
function formatNumber(
  value: number,
  options?: Intl.NumberFormatOptions
): string {
  if (!options) return String(value)
  try {
    return new Intl.NumberFormat(undefined, options).format(value)
  } catch {
    return String(value)
  }
}

/**
 * Registers a `field.required` validator with the enclosing `Form` (when
 * present) so an empty required field blocks submission and surfaces a
 * localized error — mirroring heroui, which forwards `required`/`isRequired`
 * on these branches. `isEmpty` reports whether the current value counts as
 * missing; `notifyChange` clears/refreshes an already-visible error live
 * (after a failed submit) so it disappears as soon as the field is filled.
 */
function useRequiredValidator(
  required: boolean | undefined,
  isEmpty: () => boolean
) {
  const { localization } = useAuth()
  const form = useForm()
  const [error, setError] = useState<string | undefined>(undefined)

  const isEmptyRef = useRef(isEmpty)
  isEmptyRef.current = isEmpty
  const errorRef = useRef(error)
  errorRef.current = error

  const message = localization.auth.fieldRequired

  useEffect(() => {
    if (!form || !required) return
    return form.register(() => {
      const next = isEmptyRef.current() ? message : undefined
      setError(next)
      return next
    })
  }, [form, required, message])

  const notifyChange = useCallback(
    (empty: boolean) => {
      if (errorRef.current) setError(empty ? message : undefined)
    },
    [message]
  )

  return { error, notifyChange }
}

/** Inline required-field error for the non-`TextField` branches (which have no
 * `FieldError` slot of their own). */
function RequiredError({ error }: { error?: string }) {
  if (!error) return null
  return <Text className="text-sm text-danger">{error}</Text>
}

/**
 * Icon-only copy button used as an `InputGroup.Suffix`. Reads the *live*
 * controlled field value at press time (no ref/uncontrolled-DOM escape hatch
 * needed on RN — the value is already available from local state).
 */
function CopyButton({
  getValue,
  isDisabled
}: {
  getValue: () => string | undefined
  isDisabled?: boolean
}) {
  const { localization } = useAuth()
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    const value = getValue()
    if (!value) return

    try {
      await copyText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch (error) {
      toast.danger(error instanceof Error ? error.message : String(error))
    }
  }

  return (
    <Button
      isIconOnly
      aria-label={localization.settings.copyToClipboard}
      size="sm"
      variant="ghost"
      isDisabled={isDisabled}
      onPress={handleCopy}
    >
      {copied ? (
        <Check width={16} height={16} />
      ) : (
        <Copy width={16} height={16} />
      )}
    </Button>
  )
}

/**
 * Renders a single additional user field. Mirrors the heroui `AdditionalField`
 * input-type dispatcher, adapted for React Native: every branch is a
 * controlled component (no `FormData`) that owns its local input state,
 * seeded from `field.defaultValue`, and reports parsed value changes back to
 * the parent form via `onChange`.
 */
export function AdditionalField({
  name,
  field,
  isPending,
  variant,
  onChange
}: AdditionalFieldProps) {
  const inputType = resolveInputType(field)

  if (field.render) {
    const FieldRenderer = field.render as ComponentType<AdditionalFieldProps>
    return (
      <FieldRenderer
        name={name}
        field={field}
        isPending={isPending}
        variant={variant}
        onChange={onChange}
      />
    )
  }

  if (inputType === "hidden") {
    // No DOM/FormData on RN — a hidden field contributes nothing to the
    // render tree; its `defaultValue` is already part of the parent's
    // payload (it's never surfaced as an editable control either way).
    return null
  }

  if (inputType === "textarea") {
    return (
      <TextAreaField field={field} isPending={isPending} onChange={onChange} />
    )
  }

  if (inputType === "number") {
    return (
      <NumberInputField
        name={name}
        field={field}
        isPending={isPending}
        onChange={onChange}
      />
    )
  }

  if (inputType === "slider") {
    return (
      <SliderField field={field} isPending={isPending} onChange={onChange} />
    )
  }

  if (inputType === "switch") {
    return (
      <SwitchField field={field} isPending={isPending} onChange={onChange} />
    )
  }

  if (inputType === "checkbox") {
    return (
      <CheckboxField field={field} isPending={isPending} onChange={onChange} />
    )
  }

  if (inputType === "select") {
    return (
      <SelectField field={field} isPending={isPending} onChange={onChange} />
    )
  }

  if (inputType === "combobox") {
    return (
      <ComboBoxField
        name={name}
        field={field}
        isPending={isPending}
        onChange={onChange}
      />
    )
  }

  if (inputType === "date" || inputType === "datetime") {
    return (
      <DateInputField
        field={field}
        isPending={isPending}
        isDateTime={inputType === "datetime"}
        onChange={onChange}
      />
    )
  }

  return (
    <HeroInputField
      name={name}
      field={field}
      isPending={isPending}
      variant={variant}
      onChange={onChange}
    />
  )
}

/* -------------------------------------------------------------------------
 * textarea
 * ---------------------------------------------------------------------- */

function TextAreaField({
  field,
  isPending,
  onChange
}: Omit<AdditionalFieldProps, "name">) {
  const [value, setValue] = useState(() => toStringValue(field.defaultValue))
  const { error, notifyChange } = useRequiredValidator(
    field.required,
    () => value.trim() === ""
  )

  return (
    <View className="gap-1.5">
      <Label>{field.label}</Label>

      <TextArea
        value={value}
        onChangeText={(next) => {
          setValue(next)
          onChange?.(next === "" ? null : next)
          notifyChange(next.trim() === "")
        }}
        placeholder={field.placeholder}
        isDisabled={isPending || field.readOnly}
      />

      <RequiredError error={error} />
    </View>
  )
}

/* -------------------------------------------------------------------------
 * number
 * ---------------------------------------------------------------------- */

function NumberInputField({
  name,
  field,
  isPending,
  onChange
}: AdditionalFieldProps) {
  const maxFractionDigits = field.formatOptions?.maximumFractionDigits
  const [value, setValue] = useState(
    () => toNumberValue(field.defaultValue) ?? field.min ?? 0
  )

  return (
    <View className="gap-1.5">
      <Label>{field.label}</Label>

      <NumberField
        value={value}
        onChange={(next) => {
          setValue(next)
          onChange?.(next)
        }}
        minValue={field.min}
        maxValue={field.max}
        step={
          field.step ?? (maxFractionDigits ? 1 / 10 ** maxFractionDigits : 1)
        }
        isDisabled={isPending}
        isReadOnly={field.readOnly}
        placeholder={field.placeholder}
        aria-label={typeof field.label === "string" ? field.label : name}
      />
    </View>
  )
}

/* -------------------------------------------------------------------------
 * slider
 * ---------------------------------------------------------------------- */

function SliderField({
  field,
  isPending,
  onChange
}: Omit<AdditionalFieldProps, "name">) {
  const maxFractionDigits = field.formatOptions?.maximumFractionDigits
  const minValue = field.min ?? 0
  const maxValue = field.max ?? 100
  const [value, setValue] = useState(
    () => toNumberValue(field.defaultValue) ?? minValue
  )

  return (
    <View className="gap-2">
      <View className="flex-row items-center justify-between gap-2">
        <Label>{field.label}</Label>
        <Text className="text-sm text-muted">
          {formatNumber(value, field.formatOptions)}
        </Text>
      </View>

      <Slider
        value={value}
        onChange={(next) => {
          setValue(next)
          onChange?.(next)
        }}
        minimumValue={minValue}
        maximumValue={maxValue}
        step={
          field.step ?? (maxFractionDigits ? 1 / 10 ** maxFractionDigits : 1)
        }
        isDisabled={isPending || field.readOnly}
      />
    </View>
  )
}

/* -------------------------------------------------------------------------
 * switch
 * ---------------------------------------------------------------------- */

function SwitchField({
  field,
  isPending,
  onChange
}: Omit<AdditionalFieldProps, "name">) {
  const [value, setValue] = useState(() => toBooleanValue(field.defaultValue))

  return (
    <Switch
      isSelected={value}
      onChange={(next) => {
        setValue(next)
        onChange?.(next)
      }}
      isDisabled={isPending || field.readOnly}
    >
      {field.label}
    </Switch>
  )
}

/* -------------------------------------------------------------------------
 * checkbox
 * ---------------------------------------------------------------------- */

function CheckboxField({
  field,
  isPending,
  onChange
}: Omit<AdditionalFieldProps, "name">) {
  const [value, setValue] = useState(() => toBooleanValue(field.defaultValue))
  const { error, notifyChange } = useRequiredValidator(
    field.required,
    () => !value
  )

  return (
    <View className="gap-1.5">
      <Checkbox
        isSelected={value}
        onChange={(next) => {
          setValue(next)
          onChange?.(next)
          notifyChange(!next)
        }}
        isDisabled={isPending || field.readOnly}
      >
        {field.label}
      </Checkbox>

      <RequiredError error={error} />
    </View>
  )
}

/* -------------------------------------------------------------------------
 * select
 * ---------------------------------------------------------------------- */

function SelectField({
  field,
  isPending,
  onChange
}: Omit<AdditionalFieldProps, "name">) {
  const [value, setValue] = useState<string | undefined>(
    field.defaultValue != null ? String(field.defaultValue) : undefined
  )
  const { error, notifyChange } = useRequiredValidator(
    field.required,
    () => value == null || value === ""
  )

  return (
    <View className="gap-1.5">
      <Select
        label={typeof field.label === "string" ? field.label : undefined}
        placeholder={field.placeholder}
        options={(field.options ?? []).map((option) => ({
          key: option.value,
          label: typeof option.label === "string" ? option.label : option.value
        }))}
        selectedKey={value}
        onSelectionChange={(key) => {
          setValue(key)
          onChange?.(key === "" ? null : key)
          notifyChange(key == null || key === "")
        }}
        isDisabled={isPending || field.readOnly}
      />

      <RequiredError error={error} />
    </View>
  )
}

/* -------------------------------------------------------------------------
 * combobox
 * ---------------------------------------------------------------------- */

function ComboBoxField({
  name,
  field,
  isPending,
  onChange
}: AdditionalFieldProps) {
  const options = (field.options ?? []).map((option) => ({
    key: option.value,
    label: typeof option.label === "string" ? option.label : option.value
  }))

  const [selectedKey, setSelectedKey] = useState<string | undefined>(
    field.defaultValue != null ? String(field.defaultValue) : undefined
  )
  const [inputValue, setInputValue] = useState(
    () => options.find((option) => option.key === selectedKey)?.label ?? ""
  )
  const { error, notifyChange } = useRequiredValidator(
    field.required,
    () => selectedKey == null || selectedKey === ""
  )

  return (
    <View className="gap-1.5">
      <Label>{field.label}</Label>

      <ComboBox
        options={options}
        inputValue={inputValue}
        onInputValueChange={setInputValue}
        selectedKey={selectedKey}
        onSelectionChange={(key) => {
          setSelectedKey(key)
          onChange?.(key === "" ? null : key)
          notifyChange(key == null || key === "")
        }}
        placeholder={field.placeholder}
        isDisabled={isPending || field.readOnly}
        aria-label={typeof field.label === "string" ? field.label : name}
      />

      <RequiredError error={error} />
    </View>
  )
}

/* -------------------------------------------------------------------------
 * date / datetime
 * ---------------------------------------------------------------------- */

function DateInputField({
  field,
  isPending,
  isDateTime,
  onChange
}: Omit<AdditionalFieldProps, "name"> & { isDateTime: boolean }) {
  const [value, setValue] = useState(() => toDateValue(field.defaultValue))
  const { error, notifyChange } = useRequiredValidator(
    field.required,
    () => value == null
  )

  return (
    <View className="w-full gap-1.5">
      <Label>{field.label}</Label>

      {isDateTime ? (
        <DatePicker
          value={value}
          onChange={(next) => {
            setValue(next)
            onChange?.(next)
            notifyChange(next == null)
          }}
          mode="datetime"
          placeholder={field.placeholder}
          isDisabled={isPending || field.readOnly}
        />
      ) : (
        <DateField
          value={value}
          onChange={(next) => {
            setValue(next)
            onChange?.(next)
            notifyChange(next == null)
          }}
          placeholder={field.placeholder}
          isDisabled={isPending || field.readOnly}
        />
      )}

      <RequiredError error={error} />
    </View>
  )
}

/* -------------------------------------------------------------------------
 * fallback ("input") — plain text field, optionally with prefix/suffix
 * ---------------------------------------------------------------------- */

function HeroInputField({
  name,
  field,
  isPending,
  variant,
  onChange
}: AdditionalFieldProps) {
  const { localization } = useAuth()
  const inputVariant = variant === "transparent" ? "primary" : "secondary"

  const hasPrefix = field.prefix != null
  const hasSuffix = field.suffix != null || field.copyable

  // Numeric fields get a numeric keyboard (decimal pad when fractional digits
  // are allowed), mirroring heroui's native `type`/`inputMode` on number inputs.
  const isNumeric = field.type === "number"
  const keyboardType = isNumeric
    ? field.formatOptions?.maximumFractionDigits
      ? "decimal-pad"
      : "numeric"
    : undefined

  const validate = field.required
    ? (next: string) => (!next ? localization.auth.fieldRequired : undefined)
    : undefined

  const [value, setValue] = useState(() => toStringValue(field.defaultValue))

  function handleChange(next: string) {
    setValue(next)
    if (field.type === "number") {
      onChange?.(next === "" ? null : (toNumberValue(next) ?? null))
    } else {
      onChange?.(next === "" ? null : next)
    }
  }

  if (hasPrefix || hasSuffix) {
    return (
      <TextField
        name={name}
        isDisabled={isPending}
        value={value}
        onChange={handleChange}
        validate={validate}
      >
        <Label>{field.label}</Label>

        <InputGroup variant={inputVariant}>
          {hasPrefix && (
            <InputGroup.Prefix>
              {typeof field.prefix === "string" ? (
                <Text className="text-sm text-muted">{field.prefix}</Text>
              ) : (
                field.prefix
              )}
            </InputGroup.Prefix>
          )}

          <InputGroup.Input
            placeholder={field.placeholder}
            required={field.required}
            keyboardType={keyboardType}
          />

          {field.copyable ? (
            <InputGroup.Suffix className="px-0">
              <CopyButton getValue={() => value} isDisabled={isPending} />
            </InputGroup.Suffix>
          ) : (
            field.suffix != null && (
              <InputGroup.Suffix>
                {typeof field.suffix === "string" ? (
                  <Text className="text-sm text-muted">{field.suffix}</Text>
                ) : (
                  field.suffix
                )}
              </InputGroup.Suffix>
            )
          )}
        </InputGroup>

        <FieldError />
      </TextField>
    )
  }

  return (
    <TextField
      name={name}
      isDisabled={isPending}
      value={value}
      onChange={handleChange}
      validate={validate}
    >
      <Label>{field.label}</Label>

      <Input
        placeholder={field.placeholder}
        variant={inputVariant}
        keyboardType={keyboardType}
      />

      <FieldError />
    </TextField>
  )
}
