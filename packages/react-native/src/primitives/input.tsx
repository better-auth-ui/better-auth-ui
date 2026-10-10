import { useNativeLocale } from "../lib/native-locale"
import type { ReactNode } from "react"
import { TextInput, type TextInputProps } from "react-native"
import { cn } from "../lib/cn"
import { useThemeColors } from "../lib/theme-colors"
import { tw } from "../lib/tw"
import { type FieldType, useField } from "./field"
import { Box } from "./styled"

export type InputVariant = "primary" | "secondary"

function keyboardFor(type: FieldType): TextInputProps["keyboardType"] {
  return type === "email" ? "email-address" : type === "url" ? "url" : "default"
}

function autoCompleteFor(value?: string): TextInputProps["autoComplete"] {
  switch (value) {
    case "email":
      return "email"
    case "one-time-code":
      return "one-time-code"
    case "name":
      return "name"
    case "current-password":
      return "current-password"
    case "new-password":
      return "new-password"
    default:
      return "off"
  }
}

const BASE_INPUT =
  "h-11 rounded-lg border border-border px-3 text-base text-foreground"

export interface InputProps {
  multiline?: boolean
  numberOfLines?: number
  autoCapitalize?: TextInputProps["autoCapitalize"]
  placeholder?: string
  required?: boolean
  variant?: InputVariant
  className?: string
  /** Override password masking (used by the show/hide toggle). */
  secureTextEntry?: boolean
  /** Forwarded autoComplete; overrides the enclosing field's. */
  autoComplete?: string
  /** Override the keyboard type (e.g. numeric for a number additional field). */
  keyboardType?: TextInputProps["keyboardType"]
}

/**
 * Text input bound to the enclosing `TextField` context (value, validation,
 * keyboard/masking derived from the field `type`).
 */
export function Input({
  multiline,
  numberOfLines,
  placeholder,
  className,
  secureTextEntry,
  autoCapitalize,
  autoComplete,
  keyboardType
}: InputProps) {
  const { direction } = useNativeLocale()
  const field = useField()
  const colors = useThemeColors()
  const isPassword = field.type === "password"

  return (
    <TextInput
      aria-labelledby={field.labelId}
      accessibilityLabelledBy={field.labelId}
      accessibilityLabel={field.accessibilityLabel}
      accessibilityHint={field.error}
      multiline={multiline}
      numberOfLines={numberOfLines}
      textAlignVertical={multiline ? "top" : "center"}
      value={field.value}
      onChangeText={field.setValue}
      onBlur={field.onBlur}
      editable={!field.isDisabled}
      placeholder={placeholder}
      placeholderTextColor={colors.muted}
      autoCapitalize={
        autoCapitalize ?? (field.type === "text" ? "sentences" : "none")
      }
      autoCorrect={field.type === "text"}
      autoComplete={autoCompleteFor(autoComplete ?? field.autoComplete)}
      keyboardType={keyboardType ?? keyboardFor(field.type)}
      secureTextEntry={secureTextEntry ?? isPassword}
      style={[
        {
          writingDirection: direction,
          textAlign: direction === "rtl" ? "right" : "left"
        },
        tw(
          cn(
            BASE_INPUT,
            multiline && "h-auto min-h-24 py-3",
            field.isDisabled && "opacity-50",
            className
          ),
          colors
        )
      ]}
    />
  )
}

/**
 * Input container with leading/trailing adornment slots (`InputGroup.Prefix`,
 * `InputGroup.Input`, `InputGroup.Suffix`). Used for the password show/hide
 * pattern: a masked `InputGroup.Input` with a toggle `Button` in the `Suffix`.
 */
function InputGroupBase({
  className,
  children
}: {
  variant?: InputVariant
  className?: string
  children?: ReactNode
}) {
  return (
    <Box
      className={cn(
        "h-11 flex-row items-center rounded-lg border border-border pl-3",
        className
      )}
    >
      {children}
    </Box>
  )
}

function InputGroupInput({
  name: _name,
  placeholder,
  type = "text",
  required: _required,
  autoComplete,
  keyboardType,
  className
}: {
  name?: string
  placeholder?: string
  type?: "text" | "password"
  required?: boolean
  autoComplete?: string
  keyboardType?: TextInputProps["keyboardType"]
  className?: string
}) {
  const { direction } = useNativeLocale()
  const field = useField()
  const colors = useThemeColors()
  return (
    <TextInput
      aria-labelledby={field.labelId}
      accessibilityLabelledBy={field.labelId}
      accessibilityLabel={field.accessibilityLabel}
      accessibilityHint={field.error}
      value={field.value}
      onChangeText={field.setValue}
      onBlur={field.onBlur}
      editable={!field.isDisabled}
      placeholder={placeholder}
      placeholderTextColor={colors.muted}
      autoCapitalize="none"
      autoComplete={autoCompleteFor(autoComplete ?? field.autoComplete)}
      keyboardType={keyboardType}
      secureTextEntry={type === "password"}
      style={[
        {
          writingDirection: direction,
          textAlign: direction === "rtl" ? "right" : "left"
        },
        tw(cn("h-full flex-1 text-base text-foreground", className), colors)
      ]}
    />
  )
}

function InputGroupAdornment({
  className,
  children
}: {
  className?: string
  children?: ReactNode
}) {
  return (
    <Box className={cn("h-full items-center justify-center px-2", className)}>
      {children}
    </Box>
  )
}

export const InputGroup = Object.assign(InputGroupBase, {
  Input: InputGroupInput,
  Prefix: InputGroupAdornment,
  Suffix: InputGroupAdornment
})
