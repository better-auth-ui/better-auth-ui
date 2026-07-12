import type { ReactNode } from "react"
import { TextInput, type TextInputProps, View } from "react-native"
import { cn } from "../lib/cn"
import { type FieldType, useField } from "./field"

export type InputVariant = "primary" | "secondary"

const PLACEHOLDER_COLOR = "#9ca3af"

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
  "h-11 rounded-lg border px-3 text-base text-neutral-900 dark:text-neutral-50"

function variantBorder(variant: InputVariant): string {
  return variant === "primary"
    ? "border-neutral-400 dark:border-neutral-500"
    : "border-neutral-300 dark:border-neutral-700"
}

export interface InputProps {
  placeholder?: string
  required?: boolean
  variant?: InputVariant
  className?: string
  /** Override password masking (used by the show/hide toggle). */
  secureTextEntry?: boolean
}

/**
 * Text input bound to the enclosing `TextField` context (value, validation,
 * keyboard/masking derived from the field `type`).
 */
export function Input({
  placeholder,
  variant = "secondary",
  className,
  secureTextEntry
}: InputProps) {
  const field = useField()
  const isPassword = field.type === "password"

  return (
    <TextInput
      value={field.value}
      onChangeText={field.setValue}
      editable={!field.isDisabled}
      placeholder={placeholder}
      placeholderTextColor={PLACEHOLDER_COLOR}
      autoCapitalize={field.type === "text" ? "sentences" : "none"}
      autoCorrect={field.type === "text"}
      autoComplete={autoCompleteFor(field.autoComplete)}
      keyboardType={keyboardFor(field.type)}
      secureTextEntry={secureTextEntry ?? isPassword}
      className={cn(
        BASE_INPUT,
        variantBorder(variant),
        field.isDisabled && "opacity-50",
        className
      )}
    />
  )
}

/**
 * Input container with leading/trailing adornment slots (`InputGroup.Prefix`,
 * `InputGroup.Input`, `InputGroup.Suffix`). Used for the password show/hide
 * pattern: a masked `InputGroup.Input` with a toggle `Button` in the `Suffix`.
 */
function InputGroupBase({
  variant = "secondary",
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
        "h-11 flex-row items-center rounded-lg border pl-3",
        variantBorder(variant),
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
  className
}: {
  name?: string
  placeholder?: string
  type?: "text" | "password"
  required?: boolean
  className?: string
}) {
  const field = useField()
  return (
    <TextInput
      value={field.value}
      onChangeText={field.setValue}
      editable={!field.isDisabled}
      placeholder={placeholder}
      placeholderTextColor={PLACEHOLDER_COLOR}
      autoCapitalize="none"
      autoComplete={autoCompleteFor(field.autoComplete)}
      secureTextEntry={type === "password"}
      className={cn(
        "h-full flex-1 text-base text-neutral-900 dark:text-neutral-50",
        className
      )}
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
