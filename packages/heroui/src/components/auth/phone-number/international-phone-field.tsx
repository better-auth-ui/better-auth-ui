import {
  createPhoneNumberValue,
  getPhoneNumberCountries,
  type PhoneNumberAdapter,
  type PhoneNumberCountryCode,
  type PhoneNumberValue
} from "@better-auth-ui/core/plugins/phone-number"
import {
  FieldError,
  Input,
  Label,
  ListBox,
  Select,
  TextField
} from "@heroui/react"
import { useMemo } from "react"

type InternationalPhoneFieldProps = {
  adapter: PhoneNumberAdapter
  countryLabel: string
  countryCodes?: readonly PhoneNumberCountryCode[]
  error?: string
  isDisabled?: boolean
  locale?: string
  name?: string
  phoneLabel: string
  placeholder: string
  value: PhoneNumberValue
  variant?: "primary" | "secondary"
  onChange: (value: PhoneNumberValue) => void
}

export function InternationalPhoneField({
  adapter,
  countryLabel,
  countryCodes,
  error,
  isDisabled,
  locale,
  name = "phoneNumber",
  phoneLabel,
  placeholder,
  value,
  variant,
  onChange
}: InternationalPhoneFieldProps) {
  const countries = useMemo(
    () => getPhoneNumberCountries(locale, countryCodes),
    [countryCodes, locale]
  )

  return (
    <div className="grid grid-cols-[8.5rem_minmax(0,1fr)] gap-2">
      <Select
        aria-label={countryLabel}
        isDisabled={isDisabled}
        value={value.country}
        onChange={(country) => {
          if (!country) return
          const nextCountry = country as PhoneNumberCountryCode
          const input = value.display.startsWith("+") ? "" : value.display
          onChange(createPhoneNumberValue(input, nextCountry, adapter))
        }}
      >
        <Label>{countryLabel}</Label>
        <Select.Trigger>
          <Select.Value />
          <Select.Indicator />
        </Select.Trigger>
        <Select.Popover>
          <ListBox>
            {countries.map((country) => (
              <ListBox.Item
                key={country.code}
                id={country.code}
                textValue={`${country.label} ${country.callingCode}`}
              >
                <span className="flex w-full items-center justify-between gap-4">
                  <span>{country.label}</span>
                  <span className="text-muted">{country.callingCode}</span>
                </span>
                <ListBox.ItemIndicator />
              </ListBox.Item>
            ))}
          </ListBox>
        </Select.Popover>
      </Select>
      <TextField
        name={name}
        type="tel"
        autoComplete="tel-national"
        isDisabled={isDisabled}
        isInvalid={Boolean(error)}
        value={value.display}
        onChange={(input) =>
          onChange(createPhoneNumberValue(input, value.country, adapter))
        }
      >
        <Label>{phoneLabel}</Label>
        <Input
          inputMode="tel"
          placeholder={placeholder}
          required
          variant={variant}
        />
        <FieldError>{error}</FieldError>
      </TextField>
    </div>
  )
}
