import { type ComponentType, useMemo, useState } from "react"
import { Platform } from "react-native"
import { cn } from "../lib/cn"
import { formatDateTime } from "../lib/format-date"
import { Box, Btn, Txt } from "./styled"

export type DatePickerMode = "date" | "time" | "datetime"

export interface DatePickerProps {
  value?: Date
  onChange?: (date: Date) => void
  mode?: DatePickerMode
  placeholder?: string
  isDisabled?: boolean
  className?: string
}

type NativeDateTimePickerProps = {
  value: Date
  mode?: "date" | "time"
  onChange?: (event: { type: string }, date?: Date) => void
}

/**
 * Resolve the optional native peer lazily, at render time — never at module
 * eval. The package barrel pulls this module in (additional-field → `<Auth/>`),
 * so a top-level `import "@react-native-community/datetimepicker"` would bind to
 * a native module at eval time and crash the whole app on import wherever that
 * native module isn't linked (e.g. Expo Go), even on screens with no date
 * field. The `require` sits in a try/catch so Metro treats it as an optional
 * dependency: if it's absent the field renders but the picker won't open.
 */
function resolveNativePicker(): ComponentType<NativeDateTimePickerProps> | null {
  try {
    return require("@react-native-community/datetimepicker").default
  } catch {
    return null
  }
}

function displayFor(value: Date, mode: DatePickerMode): string {
  if (mode === "time") return formatDateTime(value, { timeStyle: "short" })
  if (mode === "datetime")
    return formatDateTime(value, { dateStyle: "medium", timeStyle: "short" })
  return formatDateTime(value, { dateStyle: "medium" })
}

/**
 * A date/time field over `@react-native-community/datetimepicker` (an optional
 * peer): a pressable that shows the value and opens the native picker. Used by
 * additional-field `date`/`datetime`/`time` inputs.
 */
export function DatePicker({
  value,
  onChange,
  mode = "date",
  placeholder = "Select…",
  isDisabled = false,
  className
}: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const DateTimePicker = useMemo(resolveNativePicker, [])

  const disabled = isDisabled || !DateTimePicker

  return (
    <Box className={cn("w-full", className)}>
      <Btn
        disabled={disabled}
        onPress={() => setOpen(true)}
        className={cn(
          "h-11 justify-center rounded-lg border border-border px-3",
          disabled && "opacity-50"
        )}
      >
        <Txt
          className={cn("text-base", value ? "text-foreground" : "text-muted")}
        >
          {value ? displayFor(value, mode) : placeholder}
        </Txt>
      </Btn>

      {open && DateTimePicker && (
        <DateTimePicker
          value={value ?? new Date()}
          mode={mode === "datetime" ? "date" : mode}
          onChange={(event, date) => {
            if (Platform.OS !== "ios") setOpen(false)
            if (event.type === "set" && date) onChange?.(date)
          }}
        />
      )}
    </Box>
  )
}

/** Date-only field. */
export function DateField(props: Omit<DatePickerProps, "mode">) {
  return <DatePicker {...props} mode="date" />
}

/** Time-only field. */
export function TimeField(props: Omit<DatePickerProps, "mode">) {
  return <DatePicker {...props} mode="time" />
}
