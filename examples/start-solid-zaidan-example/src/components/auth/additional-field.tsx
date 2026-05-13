import {
  type AdditionalField as AdditionalFieldConfig,
  resolveInputType
} from "@better-auth-ui/core"
import { createSignal, For, Show } from "solid-js"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export type AdditionalFieldProps = {
  field: AdditionalFieldConfig
  isPending?: boolean
  name: string
}

const valueToString = (value: AdditionalFieldConfig["defaultValue"]) =>
  value == null
    ? ""
    : value instanceof Date
      ? value.toISOString()
      : String(value)

/**
 * Canonical Solid renderer for additional auth fields.
 *
 * The Solid/Zaidan example does not yet ship all shadcn field primitives
 * (calendar, combobox, slider, switch). Unsupported advanced input types are
 * guarded by rendering semantic native controls instead of inventing UI-only
 * behavior.
 */
export function AdditionalField(props: AdditionalFieldProps) {
  const [copied, setCopied] = createSignal(false)
  let inputRef: HTMLInputElement | undefined
  const inputType = () => resolveInputType(props.field)
  const defaultValue = () => valueToString(props.field.defaultValue)
  const isDisabled = () => props.isPending || props.field.readOnly
  const nativeType = () => {
    switch (inputType()) {
      case "number":
      case "date":
      case "hidden":
        return inputType()
      case "datetime":
        return "datetime-local"
      default:
        return props.field.type === "number" ? "number" : "text"
    }
  }

  const copyValue = async () => {
    const value = inputRef?.value
    if (!value) return

    await navigator.clipboard.writeText(value)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  if (props.field.render) {
    return <>{props.field.render(props)}</>
  }

  if (inputType() === "hidden") {
    return <input name={props.name} type="hidden" value={defaultValue()} />
  }

  if (inputType() === "textarea") {
    return (
      <div class="grid gap-2">
        <Label for={props.name}>{props.field.label}</Label>
        <textarea
          class="z-input min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground disabled:pointer-events-none disabled:opacity-50"
          disabled={props.isPending}
          id={props.name}
          name={props.name}
          placeholder={props.field.placeholder}
          readonly={props.field.readOnly}
          required={props.field.required}
        >
          {defaultValue()}
        </textarea>
      </div>
    )
  }

  if (inputType() === "select" || inputType() === "combobox") {
    return (
      <div class="grid gap-2">
        <Label for={props.name}>{props.field.label}</Label>
        <select
          class="z-input w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none disabled:pointer-events-none disabled:opacity-50"
          disabled={isDisabled()}
          id={props.name}
          name={props.name}
          required={props.field.required}
          value={defaultValue()}
        >
          <Show when={props.field.placeholder}>
            <option disabled value="">
              {props.field.placeholder}
            </option>
          </Show>
          <For each={props.field.options ?? []}>
            {(option) => <option value={option.value}>{option.label}</option>}
          </For>
        </select>
      </div>
    )
  }

  if (inputType() === "switch" || inputType() === "checkbox") {
    return (
      <label class="flex items-center gap-3 text-sm">
        <input
          checked={
            props.field.defaultValue === true || defaultValue() === "true"
          }
          disabled={isDisabled()}
          name={props.name}
          required={props.field.required}
          type="checkbox"
        />
        {props.field.label}
      </label>
    )
  }

  return (
    <div class="grid gap-2">
      <Label for={props.name}>{props.field.label}</Label>
      <div class="flex items-center gap-2">
        <Show when={props.field.prefix}>
          <span class="text-muted-foreground text-sm">
            {props.field.prefix}
          </span>
        </Show>
        <Input
          disabled={props.isPending}
          id={props.name}
          max={props.field.max}
          min={props.field.min}
          name={props.name}
          placeholder={props.field.placeholder}
          readonly={props.field.readOnly}
          ref={inputRef}
          required={props.field.required}
          step={props.field.step}
          type={nativeType()}
          value={defaultValue()}
        />
        <Show when={props.field.copyable}>
          <Button
            disabled={props.isPending}
            onClick={copyValue}
            type="button"
            variant="outline"
          >
            {copied() ? "Copied" : "Copy"}
          </Button>
        </Show>
        <Show when={props.field.suffix}>
          <span class="text-muted-foreground text-sm">
            {props.field.suffix}
          </span>
        </Show>
      </div>
    </div>
  )
}
