import {
  createPhoneNumberValue,
  getPhoneNumberCountries,
  type PhoneNumberValue,
  phoneNumberPlugin
} from "@better-auth-ui/core/plugins/phone-number"
import { useAuthPlugin } from "@better-auth-ui/react"
import { useMemo, type JSX } from "react"
import { TextField, Label, FieldError } from "../../../primitives/field"
import { Input } from "../../../primitives/input"
import { Select } from "../../../primitives/menu"
import { Box } from "../../../primitives/styled"

export function PhoneNumberField({
  value,
  onChange,
  onBlur,
  error,
  isDisabled
}: {
  value: PhoneNumberValue
  onChange: (value: PhoneNumberValue) => void
  onBlur?: () => void
  error?: string
  isDisabled?: boolean
}): JSX.Element {
  const plugin = useAuthPlugin(phoneNumberPlugin)
  const countries = useMemo(
    () => getPhoneNumberCountries(plugin.locale, plugin.countries),
    [plugin.locale, plugin.countries]
  )
  return (
    <Box className="gap-3">
      <Select
        label={plugin.localization.country}
        selectedKey={value.country}
        isDisabled={isDisabled}
        options={countries.map((country) => ({
          key: country.code,
          label: `${country.flag} ${country.label} ${country.callingCode}`
        }))}
        onSelectionChange={(key) => {
          const country = countries.find((item) => item.code === key)
          if (country)
            onChange(
              createPhoneNumberValue(
                value.display,
                country.code,
                plugin.adapter
              )
            )
        }}
      />
      <TextField
        name="phoneNumber"
        value={value.display}
        onChange={(next) => {
          onChange(createPhoneNumberValue(next, value.country, plugin.adapter))
        }}
        onBlur={onBlur}
        error={error}
        isDisabled={isDisabled}
      >
        <Label>{plugin.localization.phoneNumber}</Label>
        <Input
          keyboardType="phone-pad"
          autoCapitalize="none"
          placeholder={plugin.localization.phoneNumberPlaceholder}
        />
        <FieldError />
      </TextField>
    </Box>
  )
}
