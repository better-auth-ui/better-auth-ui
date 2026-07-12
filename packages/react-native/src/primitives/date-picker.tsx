import DateTimePicker from "@react-native-community/datetimepicker"
import { useState } from "react"
import { Platform, Pressable, Text, View } from "react-native"
import { cn } from "../lib/cn"
import { formatDateTime } from "../lib/format-date"

export type DatePickerMode = "date" | "time" | "datetime"

export interface DatePickerProps {
  value?: Date
  onChange?: (date: Date) => void
  mode?: DatePickerMode
  placeholder?: string
  isDisabled?: boolean
  className?: string
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

  return (
    <View className={cn("w-full", className)}>
      <Pressable
        disabled={isDisabled}
        onPress={() => setOpen(true)}
        className={cn(
          "h-11 justify-center rounded-lg border border-border px-3",
          isDisabled && "opacity-50"
        )}
      >
        <Text
          className={cn("text-base", value ? "text-foreground" : "text-muted")}
        >
          {value ? displayFor(value, mode) : placeholder}
        </Text>
      </Pressable>

      {open && (
        <DateTimePicker
          value={value ?? new Date()}
          mode={mode === "datetime" ? "date" : mode}
          onChange={(event, date) => {
            if (Platform.OS !== "ios") setOpen(false)
            if (event.type === "set" && date) onChange?.(date)
          }}
        />
      )}
    </View>
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
