import { useState } from "react"
import { TextInput, type TextInputProps } from "react-native"
import { cn } from "../lib/cn"
import { useNativeLocale } from "../lib/native-locale"
import { directionalStyle } from "../lib/directional-style"
import { useThemeColors } from "../lib/theme-colors"
import { tw } from "../lib/tw"
import { Box, Btn } from "./styled"
import { Minus, Plus, Search, Xmark } from "./ui-icons"

/* -------------------------------------------------------------------------
 * SearchField
 * ---------------------------------------------------------------------- */

export interface SearchFieldProps {
  value: string
  onChangeText: (value: string) => void
  placeholder?: string
  isDisabled?: boolean
  className?: string
  /** Additional className applied to the inner `TextInput`. */
  inputClassName?: string
  "aria-label"?: string
}

/**
 * A search `Input` with a leading search icon and a trailing clear (`Xmark`)
 * button that appears once `value` is non-empty. Mirrors heroui's
 * `SearchField` (`.Group`/`.SearchIcon`/`.Input`/`.ClearButton`) as a single
 * controlled component — no debouncing (matches heroui, which filters
 * synchronously in the parent).
 */
export function SearchField({
  value,
  onChangeText,
  placeholder = "Search",
  isDisabled = false,
  className,
  inputClassName,
  "aria-label": ariaLabel
}: SearchFieldProps) {
  const colors = useThemeColors()
  const { direction } = useNativeLocale()

  return (
    <Box
      className={cn(
        "h-11 flex-row items-center rounded-lg border border-border pl-3 pr-2",
        isDisabled && "opacity-50",
        className
      )}
    >
      <Search width={18} height={18} color={colors.muted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        editable={!isDisabled}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        autoCapitalize="none"
        autoCorrect={false}
        accessibilityLabel={ariaLabel ?? placeholder}
        style={[
          directionalStyle(
            tw(
              cn(
                "h-full flex-1 px-2 text-base text-foreground",
                inputClassName
              ),
              colors
            ),
            direction
          ),
          {
            writingDirection: direction,
            textAlign: direction === "rtl" ? "right" : "left"
          }
        ]}
      />
      {value.length > 0 && (
        <Btn
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          disabled={isDisabled}
          onPress={() => onChangeText("")}
          hitSlop={8}
          className="h-7 w-7 items-center justify-center rounded-full"
        >
          <Xmark width={14} height={14} color={colors.muted} />
        </Btn>
      )}
    </Box>
  )
}

/* -------------------------------------------------------------------------
 * TextArea
 * ---------------------------------------------------------------------- */

export interface TextAreaProps extends Omit<
  TextInputProps,
  "multiline" | "onChangeText" | "value" | "style" | "className"
> {
  value: string
  onChangeText: (value: string) => void
  placeholder?: string
  isDisabled?: boolean
  numberOfLines?: number
  className?: string
}

/**
 * Multiline text input styled like `Input`. Reuses the same border/typography
 * tokens; not wired to `useField()` since heroui's `TextArea` is a standalone
 * child slot used outside the MVP `TextField` context (see additional-field).
 */
export function TextArea({
  value,
  onChangeText,
  placeholder,
  isDisabled = false,
  numberOfLines = 4,
  className,
  ...props
}: TextAreaProps) {
  const colors = useThemeColors()
  const { direction } = useNativeLocale()

  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      editable={!isDisabled}
      placeholder={placeholder}
      placeholderTextColor={colors.muted}
      multiline
      numberOfLines={numberOfLines}
      textAlignVertical="top"
      style={[
        directionalStyle(
          tw(
            cn(
              "min-h-24 rounded-lg border border-border px-3 py-2 text-base text-foreground",
              isDisabled && "opacity-50",
              className
            ),
            colors
          ),
          direction
        ),
        {
          writingDirection: direction,
          textAlign: direction === "rtl" ? "right" : "left"
        }
      ]}
      {...props}
    />
  )
}

/* -------------------------------------------------------------------------
 * NumberField
 * ---------------------------------------------------------------------- */

export interface NumberFieldProps {
  value: number
  onChange: (value: number) => void
  onBlur?: () => void
  minValue?: number
  maxValue?: number
  step?: number
  isDisabled?: boolean
  isReadOnly?: boolean
  placeholder?: string
  className?: string
  "aria-label"?: string
}

function clamp(value: number, min?: number, max?: number): number {
  let next = value
  if (typeof min === "number") next = Math.max(min, next)
  if (typeof max === "number") next = Math.min(max, next)
  return next
}

/**
 * Numeric `TextInput` flanked by decrement/increment `Pressable`s, mirroring
 * heroui's `NumberField.Group` (`.DecrementButton`/`.Input`/`.IncrementButton`).
 * Controlled `value: number` / `onChange`; typed input is parsed on change and
 * clamped to `minValue`/`maxValue`.
 */
export function NumberField({
  value,
  onChange,
  onBlur,
  minValue,
  maxValue,
  step = 1,
  isDisabled = false,
  isReadOnly = false,
  placeholder,
  className,
  "aria-label": ariaLabel
}: NumberFieldProps) {
  const colors = useThemeColors()
  const display = (number: number) =>
    Number.isFinite(number) ? String(number) : ""
  const [text, setText] = useState(() => display(value))
  const [previous, setPrevious] = useState(value)
  if (!Object.is(previous, value)) {
    setPrevious(value)
    if (!Object.is(Number(text), value) || text === "") setText(display(value))
  }

  const commit = (next: number) => {
    const clamped = clamp(next, minValue, maxValue)
    onChange(clamped)
    setText(String(clamped))
  }

  const canDecrement =
    !isDisabled &&
    !isReadOnly &&
    (minValue === undefined || !Number.isFinite(value) || value > minValue)
  const canIncrement =
    !isDisabled &&
    !isReadOnly &&
    (maxValue === undefined || !Number.isFinite(value) || value < maxValue)

  return (
    <Box
      className={cn(
        "h-11 flex-row items-center rounded-lg border border-border",
        isDisabled && "opacity-50",
        className
      )}
    >
      <Btn
        accessibilityRole="button"
        accessibilityLabel="Decrement"
        disabled={!canDecrement}
        onPress={() =>
          commit((Number.isFinite(value) ? value : (minValue ?? 0)) - step)
        }
        hitSlop={8}
        className={cn(
          "h-full w-11 items-center justify-center border-r border-border",
          !canDecrement && "opacity-40"
        )}
      >
        <Minus width={16} height={16} color={colors.foreground} />
      </Btn>

      <TextInput
        value={text}
        onChangeText={(raw) => {
          setText(raw)
          const parsed = Number(raw)
          onChange(
            raw === "" || !Number.isFinite(parsed)
              ? Number.NaN
              : clamp(parsed, minValue, maxValue)
          )
        }}
        onBlur={() => {
          if (text !== "" && Number.isFinite(Number(text))) commit(Number(text))
          onBlur?.()
        }}
        editable={!isDisabled && !isReadOnly}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        keyboardType="numeric"
        accessibilityLabel={ariaLabel}
        style={tw(
          "h-full flex-1 px-2 text-center text-base text-foreground",
          colors
        )}
      />

      <Btn
        accessibilityRole="button"
        accessibilityLabel="Increment"
        disabled={!canIncrement}
        onPress={() =>
          commit((Number.isFinite(value) ? value : (minValue ?? 0)) + step)
        }
        hitSlop={8}
        className={cn(
          "h-full w-11 items-center justify-center border-l border-border",
          !canIncrement && "opacity-40"
        )}
      >
        <Plus width={16} height={16} color={colors.foreground} />
      </Btn>
    </Box>
  )
}
