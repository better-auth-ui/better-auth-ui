import {
  type AdditionalField as AdditionalFieldConfig,
  resolveInputType
} from "@better-auth-ui/core"
import { createCopyToClipboard, useAuth } from "@better-auth-ui/solid"
import { CalendarIcon, Check, Copy } from "lucide-solid"
import { createEffect, createMemo, createSignal, For, Show } from "solid-js"
import { toast } from "solid-sonner"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem
} from "@/components/ui/combobox"
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput
} from "@/components/ui/input-group"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

export type AdditionalFieldProps = {
  field: AdditionalFieldConfig
  isPending?: boolean
  name: string
  /** Complete suffix appended to labels for fields that are not required. */
  optionalLabel?: string
}

const valueToString = (value: AdditionalFieldConfig["defaultValue"]) =>
  value == null
    ? ""
    : value instanceof Date
      ? value.toISOString()
      : String(value)

const toDate = (value: AdditionalFieldConfig["defaultValue"]) => {
  if (value instanceof Date) return value
  if (typeof value !== "string") return undefined

  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? undefined : parsed
}

const formatTime = (date: Date) => {
  const pad = (value: number) => value.toString().padStart(2, "0")
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

export function AdditionalField(props: AdditionalFieldProps) {
  const inputType = () => resolveInputType(props.field)
  const label = () =>
    props.optionalLabel && !props.field.required
      ? `${String(props.field.label)}${props.optionalLabel}`
      : props.field.label

  if (props.field.render) {
    return (
      <>
        {props.field.render({
          ...props,
          field:
            label() === props.field.label
              ? props.field
              : { ...props.field, label: label() }
        })}
      </>
    )
  }

  if (inputType() === "hidden") {
    return (
      <input
        name={props.name}
        type="hidden"
        value={valueToString(props.field.defaultValue)}
      />
    )
  }

  if (inputType() === "textarea") {
    return (
      <Field>
        <FieldLabel for={props.name}>{label()}</FieldLabel>
        <Textarea
          disabled={props.isPending}
          id={props.name}
          name={props.name}
          placeholder={props.field.placeholder}
          readonly={props.field.readOnly}
          required={props.field.required}
          value={valueToString(props.field.defaultValue)}
        />
        <FieldError />
      </Field>
    )
  }

  if (inputType() === "number") {
    const maxFractionDigits = props.field.formatOptions?.maximumFractionDigits

    return (
      <Field>
        <FieldLabel for={props.name}>{label()}</FieldLabel>
        <Input
          disabled={props.isPending}
          id={props.name}
          inputmode={maxFractionDigits ? "decimal" : "numeric"}
          max={props.field.max}
          min={props.field.min}
          name={props.name}
          placeholder={props.field.placeholder}
          readonly={props.field.readOnly}
          required={props.field.required}
          step={
            props.field.step ??
            (maxFractionDigits ? 1 / 10 ** maxFractionDigits : undefined)
          }
          type="number"
          value={valueToString(props.field.defaultValue)}
        />
        <FieldError />
      </Field>
    )
  }

  if (inputType() === "slider") {
    return <SliderField {...props} label={label()} />
  }

  if (inputType() === "switch") {
    return (
      <Field orientation="horizontal">
        <Switch
          defaultChecked={
            props.field.defaultValue === true ||
            valueToString(props.field.defaultValue) === "true"
          }
          disabled={props.isPending || props.field.readOnly}
          id={props.name}
          name={props.name}
          required={props.field.required}
        />
        <FieldContent>
          <FieldLabel for={props.name}>{label()}</FieldLabel>
        </FieldContent>
      </Field>
    )
  }

  if (inputType() === "checkbox") {
    return (
      <Field orientation="horizontal">
        <Checkbox
          defaultChecked={
            props.field.defaultValue === true ||
            valueToString(props.field.defaultValue) === "true"
          }
          disabled={props.isPending || props.field.readOnly}
          id={props.name}
          name={props.name}
          required={props.field.required}
        />
        <FieldContent>
          <FieldLabel for={props.name}>{label()}</FieldLabel>
        </FieldContent>
      </Field>
    )
  }

  if (inputType() === "select") {
    return (
      <Field>
        <FieldLabel for={props.name}>{label()}</FieldLabel>
        <NativeSelect
          class="w-full"
          disabled={props.isPending || props.field.readOnly}
          id={props.name}
          name={props.name}
          required={props.field.required}
          value={valueToString(props.field.defaultValue)}
        >
          <Show when={props.field.placeholder}>
            <NativeSelectOption disabled value="">
              {props.field.placeholder}
            </NativeSelectOption>
          </Show>
          <For each={props.field.options ?? []}>
            {(option) => (
              <NativeSelectOption value={option.value}>
                {option.label}
              </NativeSelectOption>
            )}
          </For>
        </NativeSelect>
        <FieldError />
      </Field>
    )
  }

  if (inputType() === "combobox") {
    const options = props.field.options ?? []
    const initialValue = options.find(
      (option) => option.value === valueToString(props.field.defaultValue)
    )

    return (
      <Field>
        <FieldLabel for={props.name}>{label()}</FieldLabel>
        <Combobox
          defaultValue={initialValue}
          disabled={props.isPending || props.field.readOnly}
          itemComponent={(itemProps) => (
            <ComboboxItem item={itemProps.item}>
              {itemProps.item.rawValue.label}
            </ComboboxItem>
          )}
          name={props.name}
          optionLabel="label"
          optionTextValue="label"
          optionValue="value"
          options={options}
          placeholder={props.field.placeholder}
          required={props.field.required}
        >
          <ComboboxInput
            class="w-full"
            id={props.name}
            placeholder={props.field.placeholder}
          />
          <ComboboxContent>
            <ComboboxEmpty>No items found.</ComboboxEmpty>
          </ComboboxContent>
        </Combobox>
        <FieldError />
      </Field>
    )
  }

  if (inputType() === "date" || inputType() === "datetime") {
    return <DateInput {...props} label={label()} />
  }

  return <InputField {...props} label={label()} />
}

type LabeledAdditionalFieldProps = AdditionalFieldProps & {
  label: AdditionalFieldConfig["label"]
}

function InputField(props: LabeledAdditionalFieldProps) {
  const auth = useAuth()
  const { copied, copy } = createCopyToClipboard({
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : String(error))
  })
  let inputRef: HTMLInputElement | undefined
  const hasPrefix = () => props.field.prefix != null
  const hasSuffix = () =>
    props.field.suffix != null || props.field.copyable === true

  const copyValue = async () => {
    if (!inputRef?.value) return

    await copy(inputRef.value)
  }

  if (hasPrefix() || hasSuffix()) {
    return (
      <Field>
        <FieldLabel for={props.name}>{props.label}</FieldLabel>
        <InputGroup>
          <Show when={props.field.prefix}>
            <InputGroupAddon align="inline-start">
              {props.field.prefix}
            </InputGroupAddon>
          </Show>
          <InputGroupInput
            disabled={props.isPending}
            id={props.name}
            name={props.name}
            placeholder={props.field.placeholder}
            readonly={props.field.readOnly}
            ref={inputRef}
            required={props.field.required}
            value={valueToString(props.field.defaultValue)}
          />
          <Show
            when={props.field.copyable}
            fallback={
              <Show when={props.field.suffix}>
                <InputGroupAddon align="inline-end">
                  {props.field.suffix}
                </InputGroupAddon>
              </Show>
            }
          >
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                aria-label={
                  copied()
                    ? auth.localization.settings.copiedToClipboard
                    : auth.localization.settings.copyToClipboard
                }
                disabled={props.isPending}
                onClick={copyValue}
                title={
                  copied()
                    ? auth.localization.settings.copiedToClipboard
                    : auth.localization.settings.copyToClipboard
                }
              >
                <Show when={copied()} fallback={<Copy />}>
                  <Check />
                </Show>
              </InputGroupButton>
            </InputGroupAddon>
          </Show>
        </InputGroup>
        <FieldError />
      </Field>
    )
  }

  return (
    <Field>
      <FieldLabel for={props.name}>{props.label}</FieldLabel>
      <Input
        disabled={props.isPending}
        id={props.name}
        name={props.name}
        placeholder={props.field.placeholder}
        readonly={props.field.readOnly}
        required={props.field.required}
        value={valueToString(props.field.defaultValue)}
      />
      <FieldError />
    </Field>
  )
}

function SliderField(props: LabeledAdditionalFieldProps) {
  const maxFractionDigits = props.field.formatOptions?.maximumFractionDigits
  const min = props.field.min ?? 0
  const max = props.field.max ?? 100
  const step =
    props.field.step ?? (maxFractionDigits ? 1 / 10 ** maxFractionDigits : 1)
  const defaultValue = () =>
    typeof props.field.defaultValue === "number"
      ? props.field.defaultValue
      : props.field.defaultValue != null &&
          !Number.isNaN(Number(props.field.defaultValue))
        ? Number(props.field.defaultValue)
        : min
  const [value, setValue] = createSignal(defaultValue())
  const [isDirty, setIsDirty] = createSignal(false)
  const formatter = new Intl.NumberFormat(undefined, props.field.formatOptions)

  createEffect(() => {
    const nextValue = defaultValue()
    if (!isDirty()) setValue(nextValue)
  })

  return (
    <Field>
      <div class="flex items-center justify-between gap-2">
        <FieldLabel for={props.name}>{props.label}</FieldLabel>
        <span class="text-muted-foreground text-sm tabular-nums">
          {formatter.format(value())}
        </span>
      </div>
      <Slider
        disabled={props.isPending || props.field.readOnly}
        id={props.name}
        maxValue={max}
        minValue={min}
        name={props.name}
        onChange={(values) => {
          setIsDirty(true)
          setValue(values[0] ?? min)
        }}
        step={step}
        value={[value()]}
      />
      <FieldError />
    </Field>
  )
}

function DateInput(props: LabeledAdditionalFieldProps) {
  const auth = useAuth()
  const isDateTime = () => resolveInputType(props.field) === "datetime"
  const defaultDate = () => toDate(props.field.defaultValue)
  const initialDate = defaultDate()
  const [date, setDate] = createSignal<Date | undefined>(initialDate)
  const [time, setTime] = createSignal(
    initialDate && isDateTime() ? formatTime(initialDate) : ""
  )
  const [isDirty, setIsDirty] = createSignal(false)
  const [open, setOpen] = createSignal(false)
  const [error, setError] = createSignal<string>()

  createEffect(() => {
    const nextDate = defaultDate()
    if (isDirty()) return

    setDate(nextDate)
    setTime(nextDate && isDateTime() ? formatTime(nextDate) : "")
    if (nextDate) setError(undefined)
  })

  const formValue = createMemo(() => {
    const selectedDate = date()
    if (!selectedDate) return ""

    const value = new Date(selectedDate)
    if (isDateTime() && time().trim()) {
      const [hours = "0", minutes = "0", seconds = "0"] = time().split(":")
      value.setHours(Number(hours), Number(minutes), Number(seconds), 0)
    } else {
      value.setHours(0, 0, 0, 0)
    }
    return value.toISOString()
  })

  return (
    <Field data-invalid={Boolean(error())}>
      <FieldLabel for={`${props.name}-date`}>{props.label}</FieldLabel>
      <div class="relative flex gap-2">
        <input
          aria-label={props.label}
          class="sr-only"
          name={props.name}
          onInvalid={(event) => {
            event.preventDefault()
            setError(event.currentTarget.validationMessage)
          }}
          required={props.field.required}
          tabindex={-1}
          type="text"
          value={formValue()}
        />
        <Popover onOpenChange={setOpen} open={open()}>
          <PopoverTrigger
            aria-invalid={Boolean(error())}
            as={Button}
            class="flex-1 justify-between font-normal data-[empty=true]:text-muted-foreground"
            data-empty={!date()}
            disabled={props.isPending || props.field.readOnly}
            id={`${props.name}-date`}
            type="button"
            variant="outline"
          >
            <Show when={date()} fallback={props.field.placeholder}>
              {(selectedDate) => selectedDate().toLocaleDateString()}
            </Show>
            <CalendarIcon />
          </PopoverTrigger>
          <PopoverContent class="w-auto overflow-hidden p-0">
            <Calendar
              defaultMonth={date()}
              mode="single"
              monthYearSelection
              onValueChange={(value) => {
                setIsDirty(true)
                setDate(value ?? undefined)
                if (value) setError(undefined)
                if (!isDateTime()) setOpen(false)
              }}
              value={date() ?? null}
            />
          </PopoverContent>
        </Popover>
        <Show when={isDateTime()}>
          <Field class="w-32">
            <FieldLabel class="sr-only" for={`${props.name}-time`}>
              {auth.localization.settings.time}
            </FieldLabel>
            <Input
              class="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden"
              disabled={props.isPending || props.field.readOnly}
              id={`${props.name}-time`}
              onInput={(event) => {
                setIsDirty(true)
                setTime(event.currentTarget.value)
              }}
              step="1"
              type="time"
              value={time()}
            />
          </Field>
        </Show>
      </div>
      <FieldError>{error()}</FieldError>
    </Field>
  )
}
