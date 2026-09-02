import {
  getFormFieldErrorMessage,
  resolveInputType
} from "@better-auth-ui/core"
import { useAuth, useCopyToClipboard } from "@better-auth-ui/react"
import { Check, Copy } from "@gravity-ui/icons"
import {
  Button,
  Calendar,
  Checkbox,
  ComboBox,
  DateField,
  DatePicker,
  type DateValue,
  FieldError,
  Input,
  InputGroup,
  Label,
  ListBox,
  NumberField,
  Select,
  Slider,
  Switch,
  TextArea,
  TextField,
  TimeField,
  type TimeValue,
  toast
} from "@heroui/react"
import {
  type CalendarDate,
  type CalendarDateTime,
  fromDate,
  getLocalTimeZone,
  parseDate,
  parseDateTime,
  toCalendarDate,
  toCalendarDateTime
} from "@internationalized/date"
import { type ComponentType, useRef } from "react"

import type { AdditionalFieldProps } from "../../lib/auth/auth-plugin"

// Re-exported here so the main entrypoint surface is unchanged.
export type { AdditionalFieldProps } from "../../lib/auth/auth-plugin"

/** Convert a `defaultValue` into a `CalendarDate` for HeroUI date inputs. */
function toDateValue(value: unknown): CalendarDate | undefined {
  if (value instanceof Date) {
    return toCalendarDate(fromDate(value, getLocalTimeZone()))
  }

  if (typeof value === "string") {
    try {
      return parseDate(value.slice(0, 10))
    } catch {
      return undefined
    }
  }

  return undefined
}

/** Convert a `defaultValue` into a `CalendarDateTime` for datetime inputs. */
function toDateTimeValue(value: unknown): CalendarDateTime | undefined {
  if (value instanceof Date) {
    return toCalendarDateTime(fromDate(value, getLocalTimeZone()))
  }

  if (typeof value === "string") {
    try {
      // Strip trailing `Z` or timezone offset for `parseDateTime`.
      return parseDateTime(value.replace(/(Z|[+-]\d{2}:?\d{2})$/, ""))
    } catch {
      return undefined
    }
  }

  return undefined
}

/**
 * Icon-only copy button used as an `InputGroup.Suffix`. `getValue` is invoked
 * lazily on click so the button copies the input's *live* value rather than a
 * stale snapshot — important when paired with editable inputs.
 */
function CopyButton({
  getValue,
  isDisabled
}: {
  getValue: () => string | undefined
  isDisabled?: boolean
}) {
  const { localization } = useAuth()
  const { copied, copy } = useCopyToClipboard({
    onError: (error) =>
      toast.danger(error instanceof Error ? error.message : String(error))
  })

  async function handleCopy() {
    const value = getValue()
    if (!value) return

    await copy(value)
  }

  return (
    <Button
      isIconOnly
      aria-label={
        copied
          ? localization.settings.copiedToClipboard
          : localization.settings.copyToClipboard
      }
      size="sm"
      variant="ghost"
      isDisabled={isDisabled}
      onPress={handleCopy}
    >
      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
    </Button>
  )
}

/** Renders a single additional user field via HeroUI v3 components. */
export function AdditionalField({
  name,
  field: configuredField,
  value,
  onBlur,
  onChange,
  isInvalid,
  errors,
  isPending,
  optionalLabel,
  variant
}: AdditionalFieldProps) {
  const { localization } = useAuth()
  const inputType = resolveInputType(configuredField)
  const field =
    optionalLabel && !configuredField.required
      ? {
          ...configuredField,
          label:
            (inputType === "date" || inputType === "datetime") &&
            typeof configuredField.label === "string" ? (
              `${configuredField.label}${optionalLabel}`
            ) : (
              <>
                {configuredField.label}
                {optionalLabel}
              </>
            )
        }
      : configuredField
  const inputVariant = variant === "transparent" ? "primary" : "secondary"
  const errorMessage = getFormFieldErrorMessage(errors ?? [])

  if (field.render) {
    const FieldRenderer = field.render as ComponentType<AdditionalFieldProps>
    return (
      <FieldRenderer
        name={name}
        field={field}
        value={value}
        onBlur={onBlur}
        onChange={onChange}
        isInvalid={isInvalid}
        errors={errors}
        isPending={isPending}
        optionalLabel={optionalLabel}
        variant={variant}
      />
    )
  }

  if (inputType === "hidden") {
    return (
      <input
        type="hidden"
        name={name}
        value={
          value == null
            ? ""
            : value instanceof Date
              ? value.toISOString()
              : String(value)
        }
        readOnly
      />
    )
  }

  if (inputType === "textarea") {
    return (
      <TextField
        name={name}
        value={value == null ? "" : String(value)}
        onBlur={onBlur}
        onChange={(nextValue) => onChange(nextValue || null)}
        isInvalid={isInvalid}
        isDisabled={isPending}
        isReadOnly={field.readOnly}
        validationBehavior="aria"
      >
        <Label>{field.label}</Label>

        <TextArea
          placeholder={field.placeholder}
          aria-required={field.required}
          variant={inputVariant}
        />

        <FieldError>{errorMessage}</FieldError>
      </TextField>
    )
  }

  if (inputType === "number") {
    const maxFractionDigits = field.formatOptions?.maximumFractionDigits

    return (
      <NumberField
        name={name}
        value={typeof value === "number" ? value : Number.NaN}
        onBlur={onBlur}
        onChange={(nextValue) =>
          onChange(Number.isNaN(nextValue) ? null : nextValue)
        }
        isInvalid={isInvalid}
        minValue={field.min}
        maxValue={field.max}
        step={
          field.step ?? (maxFractionDigits ? 1 / 10 ** maxFractionDigits : 1)
        }
        formatOptions={field.formatOptions}
        isDisabled={isPending}
        isReadOnly={field.readOnly}
        validationBehavior="aria"
        variant={inputVariant}
      >
        <Label>{field.label}</Label>

        <NumberField.Group>
          <NumberField.DecrementButton />
          <NumberField.Input
            placeholder={field.placeholder}
            aria-required={field.required}
          />
          <NumberField.IncrementButton />
        </NumberField.Group>

        <FieldError>{errorMessage}</FieldError>
      </NumberField>
    )
  }

  if (inputType === "slider") {
    const maxFractionDigits = field.formatOptions?.maximumFractionDigits

    return (
      <Slider
        value={typeof value === "number" ? value : (field.min ?? 0)}
        onChange={(nextValue) =>
          onChange(
            Array.isArray(nextValue) ? (nextValue[0] ?? null) : nextValue
          )
        }
        minValue={field.min ?? 0}
        maxValue={field.max ?? 100}
        step={
          field.step ?? (maxFractionDigits ? 1 / 10 ** maxFractionDigits : 1)
        }
        formatOptions={field.formatOptions}
        isDisabled={isPending || field.readOnly}
        className="flex flex-col gap-2"
      >
        <div className="flex items-center justify-between gap-2">
          <Label>{field.label}</Label>
          <Slider.Output className="text-sm text-muted" />
        </div>

        <Slider.Track>
          <Slider.Fill />
          <Slider.Thumb name={name} onBlur={onBlur} aria-invalid={isInvalid} />
        </Slider.Track>
        <FieldError>{errorMessage}</FieldError>
      </Slider>
    )
  }

  if (inputType === "switch") {
    return (
      <Switch
        name={name}
        isSelected={value === true}
        onBlur={onBlur}
        onChange={onChange}
        isInvalid={isInvalid}
        isDisabled={isPending}
        isReadOnly={field.readOnly}
      >
        <Switch.Content>
          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>

          {field.label}
        </Switch.Content>
        <FieldError>{errorMessage}</FieldError>
      </Switch>
    )
  }

  if (inputType === "checkbox") {
    return (
      <Checkbox
        name={name}
        isSelected={value === true}
        onBlur={onBlur}
        onChange={onChange}
        isInvalid={isInvalid}
        isDisabled={isPending}
        isReadOnly={field.readOnly}
        aria-required={field.required}
        variant={inputVariant}
      >
        <Checkbox.Content>
          <Checkbox.Control>
            <Checkbox.Indicator />
          </Checkbox.Control>

          {field.label}
        </Checkbox.Content>
        <FieldError>{errorMessage}</FieldError>
      </Checkbox>
    )
  }

  if (inputType === "select") {
    return (
      <Select
        className="[&[data-required=true]>.label]:after:content-none"
        name={name}
        value={value == null ? null : String(value)}
        onBlur={onBlur}
        onChange={(nextValue) => onChange(nextValue || null)}
        isInvalid={isInvalid}
        placeholder={field.placeholder}
        isDisabled={isPending || field.readOnly}
        aria-required={field.required}
        validationBehavior="aria"
        variant={inputVariant}
        fullWidth
      >
        <Label>{field.label}</Label>

        <Select.Trigger>
          <Select.Value />
          <Select.Indicator />
        </Select.Trigger>

        <Select.Popover>
          <ListBox>
            {field.options?.map((option) => (
              <ListBox.Item
                key={option.value}
                id={option.value}
                textValue={
                  typeof option.label === "string" ? option.label : option.value
                }
              >
                {option.label}

                <ListBox.ItemIndicator />
              </ListBox.Item>
            ))}
          </ListBox>
        </Select.Popover>

        <FieldError>{errorMessage}</FieldError>
      </Select>
    )
  }

  if (inputType === "combobox") {
    return (
      <ComboBox
        className="[&[data-required=true]>.label]:after:content-none"
        name={name}
        selectedKey={value == null ? null : String(value)}
        onBlur={onBlur}
        onSelectionChange={(key) => onChange(key == null ? null : String(key))}
        isInvalid={isInvalid}
        isDisabled={isPending}
        isReadOnly={field.readOnly}
        aria-required={field.required}
        validationBehavior="aria"
        variant={inputVariant}
        fullWidth
      >
        <Label>{field.label}</Label>

        <ComboBox.InputGroup>
          <Input placeholder={field.placeholder} />
          <ComboBox.Trigger />
        </ComboBox.InputGroup>

        <ComboBox.Popover>
          <ListBox>
            {field.options?.map((option) => (
              <ListBox.Item
                key={option.value}
                id={option.value}
                textValue={
                  typeof option.label === "string" ? option.label : option.value
                }
              >
                {option.label}

                <ListBox.ItemIndicator />
              </ListBox.Item>
            ))}
          </ListBox>
        </ComboBox.Popover>

        <FieldError>{errorMessage}</FieldError>
      </ComboBox>
    )
  }

  if (inputType === "date" || inputType === "datetime") {
    const isDateTime = inputType === "datetime"
    const dateValue = isDateTime ? toDateTimeValue(value) : toDateValue(value)

    return (
      <DatePicker
        className="w-full [&[data-required=true]>.label]:after:content-none"
        name={name}
        value={(dateValue ?? null) as DateValue | null}
        onBlur={onBlur}
        onChange={(nextValue) =>
          onChange(nextValue?.toDate(getLocalTimeZone()) ?? null)
        }
        isInvalid={isInvalid}
        granularity={isDateTime ? "minute" : "day"}
        isDisabled={isPending}
        isReadOnly={field.readOnly}
        aria-required={field.required}
        validationBehavior="aria"
      >
        {({ state }) => (
          <>
            <Label>{field.label}</Label>

            <DateField.Group variant={inputVariant} fullWidth>
              <DateField.Input>
                {(segment) => <DateField.Segment segment={segment} />}
              </DateField.Input>

              <DateField.Suffix>
                <DatePicker.Trigger>
                  <DatePicker.TriggerIndicator />
                </DatePicker.Trigger>
              </DateField.Suffix>
            </DateField.Group>

            <FieldError>{errorMessage}</FieldError>

            <DatePicker.Popover className="flex flex-col gap-3">
              <Calendar
                aria-label={
                  typeof field.label === "string" ? field.label : name
                }
              >
                <Calendar.Header>
                  <Calendar.YearPickerTrigger>
                    <Calendar.YearPickerTriggerHeading />
                    <Calendar.YearPickerTriggerIndicator />
                  </Calendar.YearPickerTrigger>
                  <Calendar.NavButton slot="previous" />
                  <Calendar.NavButton slot="next" />
                </Calendar.Header>

                <Calendar.Grid>
                  <Calendar.GridHeader>
                    {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
                  </Calendar.GridHeader>

                  <Calendar.GridBody>
                    {(date) => <Calendar.Cell date={date} />}
                  </Calendar.GridBody>
                </Calendar.Grid>

                <Calendar.YearPickerGrid>
                  <Calendar.YearPickerGridBody>
                    {({ year }) => <Calendar.YearPickerCell year={year} />}
                  </Calendar.YearPickerGridBody>
                </Calendar.YearPickerGrid>
              </Calendar>

              {isDateTime && (
                <div className="flex items-center justify-between">
                  <Label>{localization.settings.time}</Label>

                  <TimeField
                    aria-label={localization.settings.time}
                    granularity="minute"
                    value={state.timeValue}
                    onChange={(v) => state.setTimeValue(v as TimeValue)}
                  >
                    <TimeField.Group variant="secondary">
                      <TimeField.Input>
                        {(segment) => <TimeField.Segment segment={segment} />}
                      </TimeField.Input>
                    </TimeField.Group>
                  </TimeField>
                </div>
              )}
            </DatePicker.Popover>
          </>
        )}
      </DatePicker>
    )
  }

  return (
    <HeroInputField
      name={name}
      field={field}
      value={value}
      onBlur={onBlur}
      onChange={onChange}
      isInvalid={isInvalid}
      errors={errors}
      isPending={isPending}
      variant={variant}
    />
  )
}

function HeroInputField({
  name,
  field,
  value,
  onBlur,
  onChange,
  isInvalid,
  errors,
  isPending,
  variant
}: AdditionalFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const inputVariant = variant === "transparent" ? "primary" : "secondary"

  const hasPrefix = field.prefix != null
  const hasSuffix = field.suffix != null || field.copyable

  const isNumeric = field.type === "number"
  const maxFractionDigits = field.formatOptions?.maximumFractionDigits
  const nativeInputType = isNumeric ? "number" : undefined
  const nativeInputMode = isNumeric
    ? maxFractionDigits
      ? "decimal"
      : "numeric"
    : undefined
  const nativeStep = maxFractionDigits ? 1 / 10 ** maxFractionDigits : undefined
  const errorMessage = getFormFieldErrorMessage(errors ?? [])

  if (hasPrefix || hasSuffix) {
    return (
      <TextField
        name={name}
        value={value == null ? "" : String(value)}
        onBlur={onBlur}
        onChange={(nextValue) => onChange(nextValue || null)}
        isInvalid={isInvalid}
        isDisabled={isPending}
        isReadOnly={field.readOnly}
        validationBehavior="aria"
      >
        <Label>{field.label}</Label>

        <InputGroup variant={inputVariant}>
          {hasPrefix && <InputGroup.Prefix>{field.prefix}</InputGroup.Prefix>}

          <InputGroup.Input
            ref={inputRef}
            placeholder={field.placeholder}
            aria-required={field.required}
            type={nativeInputType}
            inputMode={nativeInputMode}
            step={nativeStep}
          />

          {field.copyable ? (
            <InputGroup.Suffix className="px-0">
              <CopyButton
                getValue={() => inputRef.current?.value}
                isDisabled={isPending}
              />
            </InputGroup.Suffix>
          ) : (
            field.suffix != null && (
              <InputGroup.Suffix>{field.suffix}</InputGroup.Suffix>
            )
          )}
        </InputGroup>

        <FieldError>{errorMessage}</FieldError>
      </TextField>
    )
  }

  return (
    <TextField
      name={name}
      value={value == null ? "" : String(value)}
      onBlur={onBlur}
      onChange={(nextValue) => onChange(nextValue || null)}
      isInvalid={isInvalid}
      isDisabled={isPending}
      isReadOnly={field.readOnly}
      validationBehavior="aria"
    >
      <Label>{field.label}</Label>

      <Input
        placeholder={field.placeholder}
        aria-required={field.required}
        variant={inputVariant}
        type={nativeInputType}
        inputMode={nativeInputMode}
        step={nativeStep}
      />

      <FieldError>{errorMessage}</FieldError>
    </TextField>
  )
}
