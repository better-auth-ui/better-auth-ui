import {
  getFormFieldErrorMessage,
  resolveInputType
} from "@better-auth-ui/core"
import { useAuth } from "@better-auth-ui/react"
import { type ComponentType, useEffect, useRef, useState } from "react"
import type { AdditionalFieldProps } from "../../lib/auth-plugin"
import { copyText } from "../../lib/clipboard"
import { Button } from "../../primitives/button"
import { Checkbox } from "../../primitives/checkbox"
import { ComboBox } from "../../primitives/combobox"
import { DatePicker } from "../../primitives/date-picker"
import { FieldError, Label, TextField } from "../../primitives/field"
import { Input, InputGroup } from "../../primitives/input"
import { NumberField, TextArea } from "../../primitives/inputs-extra"
import { Select } from "../../primitives/menu"
import { Slider } from "../../primitives/slider"
import { Box, Txt } from "../../primitives/styled"
import { Switch } from "../../primitives/switch-radio"
import { toast } from "../../primitives/toast"
import { Check, Copy } from "../../primitives/ui-icons"

export type { AdditionalFieldProps } from "../../lib/auth-plugin"

function CopyButton({
  value,
  isDisabled
}: {
  value: string
  isDisabled?: boolean
}) {
  const { localization } = useAuth()
  const [copied, setCopied] = useState(false)
  const timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => () => clearTimeout(timeout.current), [])
  return (
    <Button
      isIconOnly
      size="sm"
      variant="ghost"
      isDisabled={isDisabled}
      aria-label={
        copied
          ? localization.settings.copiedToClipboard
          : localization.settings.copyToClipboard
      }
      onPress={async () => {
        try {
          await copyText(value)
          setCopied(true)
          clearTimeout(timeout.current)
          timeout.current = setTimeout(() => setCopied(false), 1500)
        } catch {
          toast.danger(localization.errors.copyFailed)
        }
      }}
    >
      {copied ? (
        <Check width={16} height={16} />
      ) : (
        <Copy width={16} height={16} />
      )}
    </Button>
  )
}

function AdditionalComboBox({
  field,
  value,
  onChange,
  onBlur,
  isPending
}: AdditionalFieldProps) {
  const options = (field.options ?? []).map((option) => ({
    key: option.value,
    label: typeof option.label === "string" ? option.label : option.value
  }))
  const selectedKey = value == null ? undefined : String(value)
  const selectedLabel =
    options.find((option) => option.key === selectedKey)?.label ?? ""
  const [query, setQuery] = useState(selectedLabel)
  const [previousLabel, setPreviousLabel] = useState(selectedLabel)
  if (previousLabel !== selectedLabel) {
    setPreviousLabel(selectedLabel)
    setQuery(selectedLabel)
  }
  return (
    <ComboBox
      options={options}
      inputValue={query}
      onInputValueChange={(next) => {
        setQuery(next)
        if (!next) onChange(null)
      }}
      selectedKey={selectedKey}
      onSelectionChange={(key) => {
        onChange(key)
        onBlur()
      }}
      placeholder={field.placeholder}
      isDisabled={isPending || field.readOnly}
      aria-label={typeof field.label === "string" ? field.label : field.name}
    />
  )
}

/** A controlled native renderer for the shared additional-field form contract. */
export function AdditionalField(props: AdditionalFieldProps) {
  const {
    name,
    field,
    value,
    onBlur,
    onChange,
    isPending,
    isInvalid,
    errors,
    variant,
    optionalLabel
  } = props
  const { locale, localization } = useAuth()
  const inputType = resolveInputType(field)
  const error = isInvalid ? getFormFieldErrorMessage(errors ?? []) : undefined
  const disabled = isPending || field.readOnly
  const inputVariant = variant === "transparent" ? "primary" : "secondary"
  const label = (
    <>
      {field.label}
      {!field.required ? optionalLabel : null}
    </>
  )
  const stringValue =
    value == null
      ? ""
      : value instanceof Date
        ? Number.isNaN(value.getTime())
          ? ""
          : value.toISOString()
        : String(value)
  const changeText = (next: string) => {
    if (field.type === "number") {
      const parsed = Number(next)
      onChange(next === "" || !Number.isFinite(parsed) ? null : parsed)
    } else onChange(next || null)
  }
  const commit = (next: Parameters<typeof onChange>[0]) => {
    onChange(next)
    onBlur()
  }

  if (field.render) {
    const Renderer = field.render as ComponentType<AdditionalFieldProps>
    return <Renderer {...props} />
  }
  if (inputType === "hidden") return null

  let control
  if (inputType === "textarea") {
    control = (
      <TextArea
        value={stringValue}
        onChangeText={changeText}
        onBlur={onBlur}
        placeholder={field.placeholder}
        isDisabled={disabled}
        accessibilityLabel={
          typeof field.label === "string" ? field.label : name
        }
      />
    )
  } else if (inputType === "number") {
    control = (
      <NumberField
        value={typeof value === "number" ? value : Number.NaN}
        onChange={(next) => onChange(Number.isFinite(next) ? next : null)}
        onBlur={onBlur}
        minValue={field.min}
        maxValue={field.max}
        step={
          field.step ??
          (field.formatOptions?.maximumFractionDigits
            ? 1 / 10 ** field.formatOptions.maximumFractionDigits
            : 1)
        }
        isDisabled={isPending}
        isReadOnly={field.readOnly}
        placeholder={field.placeholder}
        aria-label={typeof field.label === "string" ? field.label : name}
      />
    )
  } else if (inputType === "slider") {
    control = (
      <>
        <Txt className="text-sm text-muted">
          {new Intl.NumberFormat(
            locale.languageTag,
            field.formatOptions
          ).format(typeof value === "number" ? value : (field.min ?? 0))}
        </Txt>
        <Slider
          value={typeof value === "number" ? value : (field.min ?? 0)}
          minimumValue={field.min}
          maximumValue={field.max}
          step={
            field.step ??
            (field.formatOptions?.maximumFractionDigits
              ? 1 / 10 ** field.formatOptions.maximumFractionDigits
              : 1)
          }
          onChange={commit}
          isDisabled={disabled}
        />
      </>
    )
  } else if (inputType === "switch" || inputType === "checkbox") {
    const Control = inputType === "switch" ? Switch : Checkbox
    control = (
      <Control
        name={name}
        isSelected={value === true}
        onChange={commit}
        isDisabled={disabled}
      >
        {label}
      </Control>
    )
  } else if (inputType === "select") {
    control = (
      <Select
        selectedKey={value == null ? undefined : String(value)}
        onSelectionChange={(next) => commit(next || null)}
        options={(field.options ?? []).map((option) => ({
          key: option.value,
          label: typeof option.label === "string" ? option.label : option.value
        }))}
        placeholder={field.placeholder}
        isDisabled={disabled}
      />
    )
  } else if (inputType === "combobox") {
    control = <AdditionalComboBox {...props} />
  } else if (inputType === "date" || inputType === "datetime") {
    const date =
      value instanceof Date
        ? value
        : typeof value === "string"
          ? new Date(value)
          : undefined
    control = (
      <DatePicker
        value={date && !Number.isNaN(date.getTime()) ? date : undefined}
        onChange={(next) => commit(next ?? null)}
        accessibilityLabel={
          typeof field.label === "string" ? field.label : name
        }
        doneLabel={localization.settings.saveChanges}
        mode={inputType}
        placeholder={field.placeholder}
        isDisabled={disabled}
      />
    )
  } else {
    const prefix = field.prefix != null
    const suffix = field.suffix != null || field.copyable
    return (
      <TextField
        name={name}
        value={stringValue}
        onChange={changeText}
        onBlur={onBlur}
        error={error}
        isDisabled={disabled}
      >
        <Label>{label}</Label>
        {prefix || suffix ? (
          <InputGroup variant={inputVariant}>
            {prefix ? (
              <InputGroup.Prefix>
                {typeof field.prefix === "string" ? (
                  <Txt>{field.prefix}</Txt>
                ) : (
                  field.prefix
                )}
              </InputGroup.Prefix>
            ) : null}
            <InputGroup.Input
              placeholder={field.placeholder}
              keyboardType={field.type === "number" ? "decimal-pad" : undefined}
            />
            {field.copyable ? (
              <InputGroup.Suffix>
                <CopyButton value={stringValue} isDisabled={isPending} />
              </InputGroup.Suffix>
            ) : field.suffix != null ? (
              <InputGroup.Suffix>
                {typeof field.suffix === "string" ? (
                  <Txt>{field.suffix}</Txt>
                ) : (
                  field.suffix
                )}
              </InputGroup.Suffix>
            ) : null}
          </InputGroup>
        ) : (
          <Input
            variant={inputVariant}
            placeholder={field.placeholder}
            keyboardType={field.type === "number" ? "decimal-pad" : undefined}
          />
        )}
        <FieldError />
      </TextField>
    )
  }
  return (
    <Box className="gap-1.5">
      {inputType !== "switch" && inputType !== "checkbox" ? (
        <Label>{label}</Label>
      ) : null}
      {control}
      {error ? (
        <Txt accessibilityRole="alert" className="text-sm text-danger">
          {error}
        </Txt>
      ) : null}
    </Box>
  )
}
