import {
  AsYouType,
  type CountryCode,
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString
} from "libphonenumber-js/min"

export type PhoneNumberCountryCode = CountryCode

export type PhoneNumberCountry = {
  callingCode: string
  code: PhoneNumberCountryCode
  label: string
}

export type PhoneNumberValue = {
  country: PhoneNumberCountryCode
  display: string
  e164?: string
  isValid: boolean
}

export type PhoneNumberAdapter = {
  format: (value: string, country: PhoneNumberCountryCode) => string
  getCountry: (value: string) => PhoneNumberCountryCode | undefined
  normalize: (
    value: string,
    country: PhoneNumberCountryCode
  ) => string | undefined
}

export const defaultPhoneNumberAdapter: PhoneNumberAdapter = {
  format(value, country) {
    if (!value.trim()) return ""
    return new AsYouType(
      value.trim().startsWith("+") ? undefined : country
    ).input(value)
  },
  getCountry(value) {
    return parsePhoneNumberFromString(value)?.country
  },
  normalize(value, country) {
    const phoneNumber = parsePhoneNumberFromString(value, country)
    return phoneNumber?.isValid() ? phoneNumber.number : undefined
  }
}

export function createPhoneNumberValue(
  value: string,
  country: PhoneNumberCountryCode,
  adapter: PhoneNumberAdapter = defaultPhoneNumberAdapter
): PhoneNumberValue {
  const display = adapter.format(value, country)
  const e164 = adapter.normalize(display, country)
  const resolvedCountry = adapter.getCountry(e164 ?? display) ?? country

  return {
    country: resolvedCountry,
    display,
    e164,
    isValid: Boolean(e164)
  }
}

export function getPhoneNumberCountries(
  locale?: string,
  countryCodes: readonly PhoneNumberCountryCode[] = getCountries()
): PhoneNumberCountry[] {
  let displayNames: Intl.DisplayNames | undefined
  let resolvedLocale = locale

  try {
    displayNames = new Intl.DisplayNames(locale ? [locale] : undefined, {
      type: "region"
    })
  } catch {
    resolvedLocale = "en"
    displayNames = new Intl.DisplayNames(["en"], { type: "region" })
  }

  return countryCodes
    .map((code) => ({
      callingCode: `+${getCountryCallingCode(code)}`,
      code,
      label: displayNames.of(code) ?? code
    }))
    .sort((left, right) =>
      left.label.localeCompare(right.label, resolvedLocale)
    )
}
