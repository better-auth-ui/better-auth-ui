import type { ReactNode } from "react"
import { TextInput, type TextInputProps, View } from "react-native"
import { cn } from "../lib/cn"
import { useThemeColors } from "../lib/theme-colors"
import { type FieldType, useField } from "./field"

export type InputVariant = "primary" | "secondary"

function keyboardFor(type: FieldType): TextInputProps["keyboardType"] {
  return type === "email" ? "email-address" : "default"
}

function autoCompleteFor(value?: string): TextInputProps["autoComplete"] {
  switch (value) {
    case "email":
      return "email"
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
  placeholder?: string
  required?: boolean
  variant?: InputVariant
  className?: string
  /** Override password masking (used by the show/hide toggle). */
  secureTextEntry?: boolean
  /** Forwarded autoComplete; overrides the enclosing field's. */
  autoComplete?: string
}

/**
 * Text input bound to the enclosing `TextField` context (value, validation,
 * keyboard/masking derived from the field `type`).
 */
export function Input({
  placeholder,
  className,
  secureTextEntry,
  autoComplete
}: InputProps) {
  const field = useField()
  const colors = useThemeColors()
  const isPassword = field.type === "password"

  return (
    <TextInput
      value={field.value}
      onChangeText={field.setValue}
      editable={!field.isDisabled}
      placeholder={placeholder}
      placeholderTextColor={colors.muted}
      autoCapitalize={field.type === "text" ? "sentences" : "none"}
      autoCorrect={field.type === "text"}
      autoComplete={autoCompleteFor(autoComplete ?? field.autoComplete)}
      keyboardType={keyboardFor(field.type)}
      secureTextEntry={secureTextEntry ?? isPassword}
      className={cn(BASE_INPUT, field.isDisabled && "opacity-50", className)}
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
    <View
      className={cn(
        "h-11 flex-row items-center rounded-lg border border-border pl-3",
        className
      )}
    >
      {children}
    </View>
  )
}

function InputGroupInput({
  name: _name,
  placeholder,
  type = "text",
  required: _required,
  autoComplete,
  className
}: {
  name?: string
  placeholder?: string
  type?: "text" | "password"
  required?: boolean
  autoComplete?: string
  className?: string
}) {
  const field = useField()
  const colors = useThemeColors()
  return (
    <TextInput
      value={field.value}
      onChangeText={field.setValue}
      editable={!field.isDisabled}
      placeholder={placeholder}
      placeholderTextColor={colors.muted}
      autoCapitalize="none"
      autoComplete={autoCompleteFor(autoComplete ?? field.autoComplete)}
      secureTextEntry={type === "password"}
      className={cn("h-full flex-1 text-base text-foreground", className)}
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
    <View className={cn("h-full items-center justify-center px-2", className)}>
      {children}
    </View>
  )
}

export const InputGroup = Object.assign(InputGroupBase, {
  Input: InputGroupInput,
  Prefix: InputGroupAdornment,
  Suffix: InputGroupAdornment
})
