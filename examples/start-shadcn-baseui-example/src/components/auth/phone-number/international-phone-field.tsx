"use client"

import {
  createPhoneNumberValue,
  getPhoneNumberCountries,
  type PhoneNumberAdapter,
  type PhoneNumberCountryCode,
  type PhoneNumberValue
} from "@better-auth-ui/core/plugins/phone-number"
import { useId, useMemo } from "react"

import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
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

export function InternationalPhoneField({
  adapter,
  countryLabel,
  countryCodes,
  disabled,
  error,
  locale,
  name = "phoneNumber",
  phoneLabel,
  placeholder,
  value,
  onChange
}: InternationalPhoneFieldProps) {
  const id = useId()
  const countries = useMemo(
    () => getPhoneNumberCountries(locale, countryCodes),
    [countryCodes, locale]
  )
  const countryItems = countries.map((country) => ({
    label: `${country.flag} ${country.callingCode}`,
    value: country.code
  }))

  return (
    <div className="grid grid-cols-[8.5rem_minmax(0,1fr)] gap-2">
      <Field>
        <FieldLabel htmlFor={`${id}-country`}>{countryLabel}</FieldLabel>
        <Select
          items={countryItems}
          disabled={disabled}
          value={value.country}
          onValueChange={(country) => {
            if (!country) return
            const nextCountry = country as PhoneNumberCountryCode
            const input = value.display.startsWith("+") ? "" : value.display
            onChange(createPhoneNumberValue(input, nextCountry, adapter))
          }}
        >
          <SelectTrigger id={`${id}-country`} className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {countries.map((country) => (
                <SelectItem key={country.code} value={country.code}>
                  <span className="flex w-full items-center justify-between gap-4">
                    <span className="flex min-w-0 items-center gap-2">
                      <span aria-hidden="true">{country.flag}</span>
                      <span>{country.label}</span>
                    </span>
                    <span className="text-muted-foreground">
                      {country.callingCode}
                    </span>
                  </span>
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>
      <Field data-invalid={Boolean(error)}>
        <FieldLabel htmlFor={`${id}-number`}>{phoneLabel}</FieldLabel>
        <Input
          id={`${id}-number`}
          aria-invalid={Boolean(error)}
          autoComplete="tel-national"
          disabled={disabled}
          inputMode="tel"
          name={name}
          placeholder={placeholder}
          required
          type="tel"
          value={value.display}
          onChange={(event) =>
            onChange(
              createPhoneNumberValue(event.target.value, value.country, adapter)
            )
          }
        />
        <FieldError>{error}</FieldError>
      </Field>
    </div>
  )
}
