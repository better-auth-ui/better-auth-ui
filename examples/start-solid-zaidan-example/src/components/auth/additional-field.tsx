import {
  type AdditionalField as AdditionalFieldConfig,
  type AdditionalFieldFormValue,
  getFormFieldErrors,
  resolveInputType
} from "@better-auth-ui/core"
import { createCopyToClipboard, useAuth } from "@better-auth-ui/solid"
import { CalendarIcon, Check, Copy } from "lucide-solid"
import { createSignal, For, Show } from "solid-js"
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
  value: AdditionalFieldFormValue
  onBlur: () => void
  onChange: (value: AdditionalFieldFormValue) => void
  isInvalid?: boolean
  errors?: unknown[]
  isPending?: boolean
  name: string
  /** Complete suffix appended to labels for fields that are not required. */
  optionalLabel?: string
}

const valueToString = (value: AdditionalFieldFormValue) =>
  value == null
    ? ""
    : value instanceof Date
      ? value.toISOString()
      : String(value)

const toDate = (value: AdditionalFieldFormValue) => {
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
  const fieldErrors = () => getFormFieldErrors(props.errors ?? [])
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
        value={valueToString(props.value)}
      />
    )
  }

  if (inputType() === "textarea") {
    return (
      <Field data-invalid={props.isInvalid}>
        <FieldLabel for={props.name}>{label()}</FieldLabel>
        <Textarea
          disabled={props.isPending}
          id={props.name}
          name={props.name}
          placeholder={props.field.placeholder}
          readonly={props.field.readOnly}
          aria-invalid={props.isInvalid}
          aria-required={props.field.required}
          onBlur={props.onBlur}
          onInput={(event) => props.onChange(event.currentTarget.value || null)}
          value={valueToString(props.value)}
        />
        <FieldError errors={fieldErrors()} />
      </Field>
    )
  }

  if (inputType() === "number") {
    const maxFractionDigits = props.field.formatOptions?.maximumFractionDigits

    return (
      <Field data-invalid={props.isInvalid}>
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
          aria-invalid={props.isInvalid}
          aria-required={props.field.required}
          onBlur={props.onBlur}
          onInput={(event) =>
            props.onChange(
              event.currentTarget.value === ""
                ? null
                : event.currentTarget.valueAsNumber
            )
          }
          step={
            props.field.step ??
            (maxFractionDigits ? 1 / 10 ** maxFractionDigits : undefined)
          }
          type="number"
          value={typeof props.value === "number" ? props.value : ""}
        />
        <FieldError errors={fieldErrors()} />
      </Field>
    )
  }

  if (inputType() === "slider") {
    return <SliderField {...props} label={label()} />
  }

  if (inputType() === "switch") {
    return (
      <Field data-invalid={props.isInvalid} orientation="horizontal">
        <Switch
          checked={props.value === true}
          disabled={props.isPending || props.field.readOnly}
          id={props.name}
          name={props.name}
          onBlur={props.onBlur}
          onChange={props.onChange}
          validationState={props.isInvalid ? "invalid" : "valid"}
        />
        <FieldContent>
          <FieldLabel for={props.name}>{label()}</FieldLabel>
        </FieldContent>
        <FieldError errors={fieldErrors()} />
      </Field>
    )
  }

  if (inputType() === "checkbox") {
    return (
      <Field data-invalid={props.isInvalid} orientation="horizontal">
        <Checkbox
          checked={props.value === true}
          disabled={props.isPending || props.field.readOnly}
          id={props.name}
          name={props.name}
          onBlur={props.onBlur}
          onChange={props.onChange}
          validationState={props.isInvalid ? "invalid" : "valid"}
        />
        <FieldContent>
          <FieldLabel for={props.name}>{label()}</FieldLabel>
        </FieldContent>
        <FieldError errors={fieldErrors()} />
      </Field>
    )
  }

  if (inputType() === "select") {
    return (
      <Field data-invalid={props.isInvalid}>
        <FieldLabel for={props.name}>{label()}</FieldLabel>
        <NativeSelect
          class="w-full"
          disabled={props.isPending || props.field.readOnly}
          id={props.name}
          name={props.name}
          aria-invalid={props.isInvalid}
          aria-required={props.field.required}
          onBlur={props.onBlur}
          onChange={(event) =>
            props.onChange(event.currentTarget.value || null)
          }
          value={valueToString(props.value)}
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
        <FieldError errors={fieldErrors()} />
      </Field>
    )
  }

  if (inputType() === "combobox") {
    const options = props.field.options ?? []
    const selectedValue = options.find(
      (option) => option.value === valueToString(props.value)
    )

    return (
      <Field data-invalid={props.isInvalid}>
        <FieldLabel for={props.name}>{label()}</FieldLabel>
        <Combobox
          value={selectedValue}
          disabled={props.isPending || props.field.readOnly}
          itemComponent={(itemProps) => (
            <ComboboxItem item={itemProps.item}>
              {itemProps.item.rawValue.label}
            </ComboboxItem>
          )}
          name={props.name}
          onBlur={props.onBlur}
          onChange={(option) => props.onChange(option?.value ?? null)}
          optionLabel="label"
          optionTextValue="label"
          optionValue="value"
          options={options}
          placeholder={props.field.placeholder}
          validationState={props.isInvalid ? "invalid" : "valid"}
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
        <FieldError errors={fieldErrors()} />
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
  const fieldErrors = () => getFormFieldErrors(props.errors ?? [])

  const copyValue = async () => {
    if (!inputRef?.value) return

    await copy(inputRef.value)
  }

  if (hasPrefix() || hasSuffix()) {
    return (
      <Field data-invalid={props.isInvalid}>
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
            aria-invalid={props.isInvalid}
            aria-required={props.field.required}
            onBlur={props.onBlur}
            onInput={(event) =>
              props.onChange(event.currentTarget.value || null)
            }
            value={valueToString(props.value)}
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
        <FieldError errors={fieldErrors()} />
      </Field>
    )
  }

  return (
    <Field data-invalid={props.isInvalid}>
      <FieldLabel for={props.name}>{props.label}</FieldLabel>
      <Input
        disabled={props.isPending}
        id={props.name}
        name={props.name}
        placeholder={props.field.placeholder}
        readonly={props.field.readOnly}
        aria-invalid={props.isInvalid}
        aria-required={props.field.required}
        onBlur={props.onBlur}
        onInput={(event) => props.onChange(event.currentTarget.value || null)}
        value={valueToString(props.value)}
      />
      <FieldError errors={fieldErrors()} />
    </Field>
  )
}

function SliderField(props: LabeledAdditionalFieldProps) {
  const maxFractionDigits = props.field.formatOptions?.maximumFractionDigits
  const min = props.field.min ?? 0
  const max = props.field.max ?? 100
  const step =
    props.field.step ?? (maxFractionDigits ? 1 / 10 ** maxFractionDigits : 1)
  const value = () => (typeof props.value === "number" ? props.value : min)
  const formatter = new Intl.NumberFormat(undefined, props.field.formatOptions)
  const fieldErrors = () => getFormFieldErrors(props.errors ?? [])

  return (
    <Field data-invalid={props.isInvalid}>
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
        onBlur={props.onBlur}
        onChange={(values) => {
          props.onChange(values[0] ?? min)
        }}
        step={step}
        value={[value()]}
      />
      <FieldError errors={fieldErrors()} />
    </Field>
  )
}

function DateInput(props: LabeledAdditionalFieldProps) {
  const auth = useAuth()
  const isDateTime = () => resolveInputType(props.field) === "datetime"
  const date = () => toDate(props.value)
  const initialDate = date()
  const [time, setTime] = createSignal(
    initialDate && isDateTime() ? formatTime(initialDate) : ""
  )
  const [open, setOpen] = createSignal(false)
  const fieldErrors = () => getFormFieldErrors(props.errors ?? [])

  return (
    <Field data-invalid={props.isInvalid}>
      <FieldLabel for={`${props.name}-date`}>{props.label}</FieldLabel>
      <div class="relative flex gap-2">
        <Popover onOpenChange={setOpen} open={open()}>
          <PopoverTrigger
            aria-invalid={props.isInvalid}
            aria-required={props.field.required}
            as={Button}
            class="flex-1 justify-between font-normal data-[empty=true]:text-muted-foreground"
            data-empty={!date()}
            disabled={props.isPending || props.field.readOnly}
            id={`${props.name}-date`}
            onBlur={props.onBlur}
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
                if (!value) {
                  props.onChange(null)
                } else {
                  const nextValue = new Date(value)
                  if (isDateTime() && time().trim()) {
                    const [hours = "0", minutes = "0", seconds = "0"] =
                      time().split(":")
                    nextValue.setHours(
                      Number(hours),
                      Number(minutes),
                      Number(seconds),
                      0
                    )
                  } else {
                    nextValue.setHours(0, 0, 0, 0)
                  }
                  props.onChange(nextValue)
                }
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
                const nextTime = event.currentTarget.value
                setTime(nextTime)
                const selectedDate = date()
                if (!selectedDate) return
                const nextValue = new Date(selectedDate)
                const [hours = "0", minutes = "0", seconds = "0"] =
                  nextTime.split(":")
                nextValue.setHours(
                  Number(hours),
                  Number(minutes),
                  Number(seconds),
                  0
                )
                props.onChange(nextValue)
              }}
              step="1"
              type="time"
              value={time()}
            />
          </Field>
        </Show>
      </div>
      <FieldError errors={fieldErrors()} />
    </Field>
  )
}
