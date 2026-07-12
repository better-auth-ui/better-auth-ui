import { Text, View } from "react-native"
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

/**
 * Web fallback: `@react-native-community/datetimepicker` is native-only. On web
 * this shows the value in a static field. Use on native for the real picker.
 */
export function DatePicker({
  value,
  placeholder = "Select…",
  isDisabled = false,
  className
}: DatePickerProps) {
  return (
    <View className={cn("w-full", className)}>
      <View
        className={cn(
          "h-11 justify-center rounded-lg border border-border px-3",
          isDisabled && "opacity-50"
        )}
      >
        <Text
          className={cn("text-base", value ? "text-foreground" : "text-muted")}
        >
          {value ? formatDateTime(value) : placeholder}
        </Text>
      </View>
    </View>
  )
}

/** Date-only field (web fallback). */
export function DateField(props: Omit<DatePickerProps, "mode">) {
  return <DatePicker {...props} mode="date" />
}

/** Time-only field (web fallback). */
export function TimeField(props: Omit<DatePickerProps, "mode">) {
  return <DatePicker {...props} mode="time" />
}
