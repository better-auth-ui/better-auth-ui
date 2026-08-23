import {
  createPhoneNumberValue,
  getPhoneNumberCountries,
  type PhoneNumberAdapter,
  type PhoneNumberCountry,
  type PhoneNumberCountryCode,
  type PhoneNumberValue
} from "@better-auth-ui/core/plugins/phone-number"
import { createMemo, createUniqueId } from "solid-js"

import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"

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
        <Select<PhoneNumberCountry>
          disabled={props.disabled}
          itemComponent={(itemProps) => (
            <SelectItem item={itemProps.item}>
              <span class="flex w-full items-center justify-between gap-4">
                <span class="flex min-w-0 items-center gap-2">
                  <span aria-hidden="true">{itemProps.item.rawValue.flag}</span>
                  <span>{itemProps.item.rawValue.label}</span>
                </span>
                <span class="text-muted-foreground">
                  {itemProps.item.rawValue.callingCode}
                </span>
              </span>
            </SelectItem>
          )}
          onChange={(country) => {
            if (!country) return
            const input = props.value.display.startsWith("+")
              ? ""
              : props.value.display
            props.onChange(
              createPhoneNumberValue(input, country.code, props.adapter)
            )
          }}
          options={countries()}
          optionTextValue="label"
          optionValue="code"
          value={countries().find(
            (country) => country.code === props.value.country
          )}
        >
          <SelectTrigger id={`${id}-country`} class="w-full">
            <SelectValue<PhoneNumberCountry>>
              {(state) => {
                const country = state.selectedOption()

                return country ? (
                  <span class="flex items-center gap-2">
                    <span aria-hidden="true">{country.flag}</span>
                    <span>{country.callingCode}</span>
                  </span>
                ) : null
              }}
            </SelectValue>
          </SelectTrigger>
          <SelectContent />
        </Select>
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
