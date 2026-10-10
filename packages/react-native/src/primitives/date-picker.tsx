import { type ComponentType, useMemo, useState } from "react"
import { Platform, TextInput } from "react-native"
import { cn } from "../lib/cn"
import { formatDateTime } from "../lib/format-date"
import { useNativeLocale } from "../lib/native-locale"
import { useThemeColors } from "../lib/theme-colors"
import { tw } from "../lib/tw"
import { Box, Btn, Txt } from "./styled"
import { Button } from "./button"
export type DatePickerMode = "date" | "time" | "datetime"
export interface DatePickerProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  accessibilityLabel?: string
  invalidMessage?: string
  doneLabel?: string
  mode?: DatePickerMode
  placeholder?: string
  isDisabled?: boolean
  className?: string
}
type NativeDateTimePickerProps = {
  value: Date
  mode?: DatePickerMode
  locale?: string
  onChange?: (event: { type: string }, date?: Date) => void
}
function resolveNativePicker(): ComponentType<NativeDateTimePickerProps> | null {
  try {
    return require("@react-native-community/datetimepicker").default
  } catch {
    return null
  }
}
function localDate(value: Date, mode: DatePickerMode) {
  const pad = (n: number) => String(n).padStart(2, "0")
  const date = `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`
  const time = `${pad(value.getHours())}:${pad(value.getMinutes())}`
  return mode === "time" ? time : mode === "datetime" ? `${date}T${time}` : date
}
/** Use the native picker when installed, with an editable ISO date/time field otherwise. */
export function DatePicker({
  value,
  onChange,
  mode = "date",
  placeholder,
  isDisabled = false,
  className,
  accessibilityLabel,
  invalidMessage = "Enter a valid date or time.",
  doneLabel = "Done"
}: DatePickerProps) {
  const { languageTag } = useNativeLocale()
  const colors = useThemeColors()
  const [open, setOpen] = useState(false)
  const [phase, setPhase] = useState<"date" | "time">("date")
  const [draft, setDraft] = useState<Date>()
  const [text, setText] = useState(value ? localDate(value, mode) : "")
  const [invalid, setInvalid] = useState(false)
  const [previous, setPrevious] = useState(value)
  if (previous !== value) {
    setPrevious(value)
    setText(value ? localDate(value, mode) : "")
    setInvalid(false)
  }
  const Picker = useMemo(resolveNativePicker, [])
  const display =
    value && !Number.isNaN(value.getTime())
      ? formatDateTime(
          value,
          mode === "time"
            ? { timeStyle: "short" }
            : mode === "datetime"
              ? { dateStyle: "medium", timeStyle: "short" }
              : { dateStyle: "medium" },
          languageTag
        )
      : (placeholder ??
        (mode === "time"
          ? "HH:mm"
          : mode === "datetime"
            ? "YYYY-MM-DDTHH:mm"
            : "YYYY-MM-DD"))
  if (!Picker)
    return (
      <Box className={className}>
        <TextInput
          accessibilityLabel={accessibilityLabel ?? placeholder ?? mode}
          editable={!isDisabled}
          autoCapitalize="none"
          value={text}
          placeholder={
            placeholder ??
            (mode === "time"
              ? "HH:mm"
              : mode === "datetime"
                ? "YYYY-MM-DDTHH:mm"
                : "YYYY-MM-DD")
          }
          placeholderTextColor={colors.muted}
          style={tw(
            "h-11 rounded-lg border border-border px-3 text-foreground",
            colors
          )}
          onChangeText={(raw) => {
            setText(raw)
            if (!raw) {
              setInvalid(false)
              onChange?.(undefined)
              return
            }
            const candidate = new Date(
              mode === "time"
                ? `${localDate(value ?? new Date(), "date")}T${raw}`
                : mode === "date"
                  ? `${raw}T00:00`
                  : raw
            )
            const valid =
              !Number.isNaN(candidate.getTime()) &&
              localDate(candidate, mode) === raw
            setInvalid(!valid)
            onChange?.(valid ? candidate : new Date(Number.NaN))
          }}
        />
        {invalid ? (
          <Txt accessibilityRole="alert" className="text-danger">
            {invalidMessage}
          </Txt>
        ) : null}
      </Box>
    )
  return (
    <Box className={cn("w-full", className)}>
      <Btn
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? placeholder ?? display}
        onPress={() => {
          setPhase("date")
          setDraft(value)
          setOpen(true)
        }}
        className={cn(
          "h-11 justify-center rounded-lg border border-border px-3",
          isDisabled && "opacity-50"
        )}
      >
        <Txt>{display}</Txt>
      </Btn>
      {open ? (
        <Picker
          value={draft ?? value ?? new Date()}
          mode={mode === "datetime" && Platform.OS !== "ios" ? phase : mode}
          locale={languageTag}
          onChange={(event, date) => {
            if (event.type !== "set" || !date) {
              setOpen(false)
              return
            }
            if (
              mode === "datetime" &&
              Platform.OS !== "ios" &&
              phase === "date"
            ) {
              setDraft(date)
              setPhase("time")
              return
            }
            setDraft(date)
            onChange?.(date)
            if (Platform.OS !== "ios") setOpen(false)
          }}
        />
      ) : null}
      {open && Platform.OS === "ios" ? (
        <Button size="sm" onPress={() => setOpen(false)}>
          {doneLabel}
        </Button>
      ) : null}
    </Box>
  )
}
export function DateField(props: Omit<DatePickerProps, "mode">) {
  return <DatePicker {...props} mode="date" />
}
export function TimeField(props: Omit<DatePickerProps, "mode">) {
  return <DatePicker {...props} mode="time" />
}
