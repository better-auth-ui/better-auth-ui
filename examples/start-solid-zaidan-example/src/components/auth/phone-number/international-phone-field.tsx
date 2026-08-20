import {
  createPhoneNumberValue,
  getPhoneNumberCountries,
  type PhoneNumberAdapter,
  type PhoneNumberCountryCode,
  type PhoneNumberValue
} from "@better-auth-ui/core/plugins/phone-number"
import { createMemo, createUniqueId, For } from "solid-js"

import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"

type InternationalPhoneFieldProps = {
  adapter: PhoneNumberAdapter
  countryLabel: string
  countryCodes?: readonly PhoneNumberCountryCode[]
  disabled?: boolean
  error?: string
  locale?: string
  name?: string
  phoneLabel: string
  placeholder: string
  value: PhoneNumberValue
  onChange: (value: PhoneNumberValue) => void
}

export function InternationalPhoneField(props: InternationalPhoneFieldProps) {
  const id = createUniqueId()
  const countries = createMemo(() =>
    getPhoneNumberCountries(props.locale, props.countryCodes)
  )

  return (
    <div class="grid grid-cols-[8.5rem_minmax(0,1fr)] gap-2">
      <Field>
        <FieldLabel for={`${id}-country`}>{props.countryLabel}</FieldLabel>
        <NativeSelect
          id={`${id}-country`}
          disabled={props.disabled}
          value={props.value.country}
          onChange={(event) => {
            const country = event.currentTarget.value as PhoneNumberCountryCode
            const input = props.value.display.startsWith("+")
              ? ""
              : props.value.display
            props.onChange(
              createPhoneNumberValue(input, country, props.adapter)
            )
          }}
        >
          <For each={countries()}>
            {(country) => (
              <NativeSelectOption value={country.code}>
                {country.label} ({country.callingCode})
              </NativeSelectOption>
            )}
          </For>
        </NativeSelect>
      </Field>
      <Field data-invalid={Boolean(props.error)}>
        <FieldLabel for={`${id}-number`}>{props.phoneLabel}</FieldLabel>
        <Input
          id={`${id}-number`}
          aria-invalid={Boolean(props.error)}
          autocomplete="tel-national"
          disabled={props.disabled}
          inputmode="tel"
          name={props.name ?? "phoneNumber"}
          placeholder={props.placeholder}
          required
          type="tel"
          value={props.value.display}
          onInput={(event) =>
            props.onChange(
              createPhoneNumberValue(
                event.currentTarget.value,
                props.value.country,
                props.adapter
              )
            )
          }
        />
        <FieldError>{props.error}</FieldError>
      </Field>
    </div>
  )
}
