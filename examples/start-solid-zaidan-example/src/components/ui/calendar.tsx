import Calendar from "@corvu/calendar"
import { getWeek } from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-solid"
import {
  type ComponentProps,
  Index,
  type JSX,
  mergeProps,
  Show,
  splitProps
} from "solid-js"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

type CalendarSingleValue = Date | null
type CalendarMultipleValue = Date[]
type CalendarRangeValue = { from: Date | null; to: Date | null }

/**
 * Props passed to the customCell render function
 */
type CustomCellProps = {
  /** The date of the cell */
  date: Date
  /** Whether the date is outside the current month */
  isOutsideMonth: boolean
  /** Whether the date is selected */
  isSelected: boolean
  /** Whether the date is disabled */
  isDisabled: boolean
  /** Whether the date is today */
  isToday: boolean
}

type CalendarBaseProps = Omit<ComponentProps<"div">, "onChange"> & {
  /**
   * Whether to show days from the previous/next months
   * @default true
   */
  showOutsideDays?: boolean
  /**
   * Whether to always show 6 weeks in the calendar
   * @default false
   */
  fixedWeeks?: boolean
  /**
   * Number of months to display
   * @default 1
   */
  numberOfMonths?: number
  /**
   * Function to disable specific dates (grayed out, not selectable)
   */
  disabled?: (date: Date) => boolean
  /**
   * Function to mark specific dates as booked (strikethrough styling)
   * Booked dates are also disabled but have different visual styling
   */
  booked?: (date: Date) => boolean
  /**
   * The controlled month to display
   */
  month?: Date
  /**
   * Callback when the displayed month changes
   */
  onMonthChange?: (month: Date) => void
  /**
   * The initial month to display (uncontrolled)
   */
  defaultMonth?: Date
  /**
   * Which day of the week to start on (0 = Sunday, 1 = Monday, etc.)
   * @default 1
   */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
  /**
   * Whether to show week numbers in the calendar
   * @default false
   */
  weekNumbers?: boolean
  /**
   * Custom render function for day cells
   * Allows adding metadata like prices, events, etc.
   */
  customCell?: (props: CustomCellProps) => JSX.Element
  /**
   * Enable month/year selection via dropdown selects
   * @default false
   */
  monthYearSelection?: boolean
  /**
   * Start year for the year dropdown (only used when monthYearSelection is true)
   * @default current year - 100
   */
  startYear?: number
  /**
   * End year for the year dropdown (only used when monthYearSelection is true)
   * @default current year + 10
   */
  endYear?: number
}

type CalendarSingleProps = CalendarBaseProps & {
  mode?: "single"
  value?: CalendarSingleValue
  onValueChange?: (value: CalendarSingleValue) => void
  defaultValue?: CalendarSingleValue
}

type CalendarMultipleProps = CalendarBaseProps & {
  mode: "multiple"
  value?: CalendarMultipleValue
  onValueChange?: (value: CalendarMultipleValue) => void
  defaultValue?: CalendarMultipleValue
}

type CalendarRangeProps = CalendarBaseProps & {
  mode: "range"
  value?: CalendarRangeValue
  onValueChange?: (value: CalendarRangeValue) => void
  defaultValue?: CalendarRangeValue
}

type CalendarProps =
  | CalendarSingleProps
  | CalendarMultipleProps
  | CalendarRangeProps

const MONTHS = [
  { label: "Jan", value: 0 },
  { label: "Feb", value: 1 },
  { label: "Mar", value: 2 },
  { label: "Apr", value: 3 },
  { label: "May", value: 4 },
  { label: "Jun", value: 5 },
  { label: "Jul", value: 6 },
  { label: "Aug", value: 7 },
  { label: "Sep", value: 8 },
  { label: "Oct", value: 9 },
  { label: "Nov", value: 10 },
  { label: "Dec", value: 11 }
]

const CalendarComponent = (props: CalendarProps) => {
  const currentYear = new Date().getFullYear()

  const mergedProps = mergeProps(
    {
      mode: "single" as const,
      showOutsideDays: true,
      fixedWeeks: false,
      numberOfMonths: 1,
      weekStartsOn: 1 as const,
      weekNumbers: false,
      monthYearSelection: false,
      startYear: currentYear - 100,
      endYear: currentYear + 10
    },
    props
  )

  const [local, others] = splitProps(mergedProps, [
    "class",
    "mode",
    "value",
    "onValueChange",
    "defaultValue",
    "showOutsideDays",
    "fixedWeeks",
    "numberOfMonths",
    "disabled",
    "booked",
    "month",
    "onMonthChange",
    "defaultMonth",
    "weekStartsOn",
    "weekNumbers",
    "customCell",
    "monthYearSelection",
    "startYear",
    "endYear"
  ])

  const formatMonth = (date: Date) => {
    return date.toLocaleString("default", { month: "long", year: "numeric" })
  }

  const formatWeekday = (date: Date) => {
    return date.toLocaleString("default", { weekday: "short" }).slice(0, 2)
  }

  // Generate years array for dropdown
  const years = () =>
    Array.from({ length: local.endYear - local.startYear + 1 }, (_, i) => {
      const year = local.startYear + i
      return { label: year.toString(), value: year }
    })

  return (
    // @ts-expect-error - Calendar component is not typed correctly
    <Calendar
      mode={local.mode}
      value={local.value as Date | null}
      onValueChange={local.onValueChange as (value: Date | null) => void}
      initialValue={local.defaultValue as Date | null}
      month={local.month}
      onMonthChange={local.onMonthChange}
      initialMonth={local.defaultMonth}
      numberOfMonths={local.numberOfMonths}
      fixedWeeks={local.fixedWeeks}
      disableOutsideDays={!local.showOutsideDays}
      disabled={(date: Date) =>
        local.disabled?.(date) || local.booked?.(date) || false
      }
      startOfWeek={local.weekStartsOn}
    >
      {/* @ts-expect-error - Calendar component is not typed correctly */}
      {(calendarProps) => (
        <div
          data-slot="calendar"
          class={cn(
            "group/calendar z-calendar w-fit bg-popover p-3",
            "in-data-[slot=card-content]:bg-transparent in-data-[slot=popover-content]:bg-transparent",
            local.class
          )}
          {...others}
        >
          <div class="flex flex-col gap-4 md:flex-row">
            <Index each={calendarProps.months}>
              {(monthData, index) => (
                <div
                  data-slot="calendar-month"
                  class="flex w-full flex-col gap-4"
                >
                  {/* Navigation and Header */}
                  <nav
                    data-slot="calendar-header"
                    class="flex h-(--cell-size) w-full items-center justify-between gap-1"
                  >
                    <Calendar.Nav
                      action="prev-month"
                      as={Button}
                      variant="ghost"
                      class={cn(
                        buttonVariants({ variant: "ghost" }),
                        "size-(--cell-size) select-none p-0"
                      )}
                    >
                      <ChevronLeft class="size-4" />
                      <span class="sr-only">Previous month</span>
                    </Calendar.Nav>

                    {/* Month/Year Selection or Label */}
                    <Show
                      when={local.monthYearSelection}
                      fallback={
                        <h2
                          class="flex-1 select-none text-center font-medium text-sm"
                          data-slot="calendar-label"
                          id={calendarProps.labelIds[index]?.()}
                        >
                          {formatMonth(monthData().month)}
                        </h2>
                      }
                    >
                      <div class="flex flex-1 items-center justify-center gap-2">
                        <Select<(typeof MONTHS)[number]>
                          options={MONTHS}
                          optionValue="value"
                          optionTextValue="label"
                          value={MONTHS.find(
                            (m) => m.value === monthData().month.getMonth()
                          )}
                          onChange={(selectedMonth) => {
                            if (selectedMonth) {
                              const newDate = new Date(monthData().month)
                              newDate.setMonth(selectedMonth.value)
                              calendarProps.setMonth(newDate)
                            }
                          }}
                          itemComponent={(itemProps) => (
                            <SelectItem item={itemProps.item}>
                              {itemProps.item.rawValue.label}
                            </SelectItem>
                          )}
                        >
                          <SelectTrigger size="sm">
                            <SelectValue<(typeof MONTHS)[number]>>
                              {(state) => state.selectedOption().label}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent />
                        </Select>
                        <Select<{ label: string; value: number }>
                          options={years()}
                          optionValue="value"
                          optionTextValue="label"
                          value={years().find(
                            (y) => y.value === monthData().month.getFullYear()
                          )}
                          onChange={(selectedYear) => {
                            if (selectedYear) {
                              const newDate = new Date(monthData().month)
                              newDate.setFullYear(selectedYear.value)
                              calendarProps.setMonth(newDate)
                            }
                          }}
                          itemComponent={(itemProps) => (
                            <SelectItem item={itemProps.item}>
                              {itemProps.item.rawValue.label}
                            </SelectItem>
                          )}
                        >
                          <SelectTrigger size="sm">
                            <SelectValue<{ label: string; value: number }>>
                              {(state) => state.selectedOption().label}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent />
                        </Select>
                      </div>
                    </Show>

                    <Calendar.Nav
                      action="next-month"
                      as={Button}
                      variant="ghost"
                      class={cn(
                        buttonVariants({ variant: "ghost" }),
                        "size-(--cell-size) select-none p-0"
                      )}
                    >
                      <ChevronRight class="size-4" />
                      <span class="sr-only">Next month</span>
                    </Calendar.Nav>
                  </nav>

                  <Calendar.Table index={index} class="w-full border-collapse">
                    <thead data-slot="calendar-weekdays">
                      <tr class="flex">
                        {/* Week number header */}
                        <Show when={local.weekNumbers}>
                          <th
                            data-slot="calendar-week-number-header"
                            class="w-8 flex-none select-none rounded-(--cell-radius) font-normal text-[0.8rem] text-muted-foreground"
                          >
                            #
                          </th>
                        </Show>
                        <Index each={calendarProps.weekdays}>
                          {(weekday) => (
                            <Calendar.HeadCell
                              data-slot="calendar-weekday"
                              class="flex-1 select-none rounded-(--cell-radius) font-normal text-[0.8rem] text-muted-foreground"
                            >
                              {formatWeekday(weekday())}
                            </Calendar.HeadCell>
                          )}
                        </Index>
                      </tr>
                    </thead>
                    <tbody data-slot="calendar-weeks">
                      <Index each={monthData().weeks}>
                        {(week) => (
                          <tr
                            data-slot="calendar-week"
                            class="mt-2 flex w-full"
                          >
                            {/* Week number cell */}
                            <Show when={local.weekNumbers}>
                              <td
                                data-slot="calendar-week-number"
                                class="flex w-8 flex-none select-none items-center justify-center font-normal text-[0.75rem] text-muted-foreground"
                              >
                                {getWeekNumber(week())}
                              </td>
                            </Show>
                            <Index each={week()}>
                              {(day) => (
                                <Show
                                  when={day()}
                                  fallback={<td class="flex-1 p-0" />}
                                >
                                  {(d) => (
                                    <CalendarDay
                                      day={d()}
                                      month={monthData().month}
                                      mode={local.mode}
                                      value={calendarProps.value}
                                      disabled={local.disabled}
                                      booked={local.booked}
                                      customCell={local.customCell}
                                    />
                                  )}
                                </Show>
                              )}
                            </Index>
                          </tr>
                        )}
                      </Index>
                    </tbody>
                  </Calendar.Table>
                </div>
              )}
            </Index>
          </div>
        </div>
      )}
    </Calendar>
  )
}

/**
 * Get the ISO week number for a week (using the first non-null day)
 */
const getWeekNumber = (week: (Date | null)[]): number => {
  const firstDay = week.find((d) => d !== null)
  if (!firstDay) return 0
  return getWeek(firstDay, { weekStartsOn: 1 })
}

type CalendarDayProps = {
  day: Date
  month: Date
  mode: "single" | "multiple" | "range"
  value: Date | null | Date[] | { from: Date | null; to: Date | null }
  disabled?: (date: Date) => boolean
  booked?: (date: Date) => boolean
  customCell?: (props: CustomCellProps) => JSX.Element
}

const CalendarDay = (props: CalendarDayProps) => {
  const isOutsideMonth = () => props.day.getMonth() !== props.month.getMonth()
  const isToday = () => isSameDay(props.day, new Date())
  const isDisabled = () => props.disabled?.(props.day) ?? false
  const isBooked = () => props.booked?.(props.day) ?? false

  const isSelected = () => {
    const value = props.value
    if (value === null || value === undefined) return false

    if (value instanceof Date) {
      return isSameDay(value, props.day)
    }
    if (Array.isArray(value)) {
      return value.some((d) => isSameDay(d, props.day))
    }
    if (typeof value === "object" && "from" in value) {
      const { from, to } = value as CalendarRangeValue
      if (from && isSameDay(from, props.day)) return true
      if (to && isSameDay(to, props.day)) return true
      return false
    }
    return false
  }

  const isRangeStart = () => {
    const value = props.value
    if (!value || typeof value !== "object" || !("from" in value)) return false
    const { from } = value as CalendarRangeValue
    return from && isSameDay(from, props.day)
  }

  const isRangeEnd = () => {
    const value = props.value
    if (!value || typeof value !== "object" || !("from" in value)) return false
    const { to } = value as CalendarRangeValue
    return to && isSameDay(to, props.day)
  }

  const isInRange = () => {
    const value = props.value
    if (!value || typeof value !== "object" || !("from" in value)) return false
    const { from, to } = value as CalendarRangeValue
    if (!from || !to) return false
    return props.day > from && props.day < to
  }

  const isSingleSelected = () =>
    isSelected() && !isRangeStart() && !isRangeEnd() && !isInRange()

  return (
    <Calendar.Cell
      data-slot="calendar-day"
      class={cn(
        "group/day relative aspect-square h-full w-full flex-1 select-none rounded-(--cell-radius) p-0 text-center",
        "[&:first-child[data-selected=true]_button]:rounded-l-(--cell-radius)",
        "[&:last-child[data-selected=true]_button]:rounded-r-(--cell-radius)",
        isRangeStart() &&
          "isolate z-0 rounded-l-(--cell-radius) bg-muted after:absolute after:inset-y-0 after:right-0 after:w-4 after:bg-muted",
        isRangeEnd() &&
          "isolate z-0 rounded-r-(--cell-radius) bg-muted after:absolute after:inset-y-0 after:left-0 after:w-4 after:bg-muted",
        isInRange() && "rounded-none"
      )}
      data-selected={isSelected() || undefined}
      data-outside={isOutsideMonth() || undefined}
    >
      <Calendar.CellTrigger
        day={props.day}
        month={props.month}
        data-slot="calendar-day-button"
        class={cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "relative isolate z-10 flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-0.5 border-0 font-normal leading-none",
          // Focus states
          "group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-[3px] group-data-[focused=true]/day:ring-ring/50",
          // Today styling
          "data-[today=true]:data-[selected=true]:rounded-none data-[today=true]:rounded-(--cell-radius) data-[today=true]:bg-muted data-[today=true]:text-foreground",
          // Single selection
          isSingleSelected() && "bg-primary text-primary-foreground",
          // Range selection
          isRangeStart() &&
            "rounded-(--cell-radius) rounded-l-(--cell-radius) bg-primary text-primary-foreground",
          isRangeEnd() &&
            "rounded-(--cell-radius) rounded-r-(--cell-radius) bg-primary text-primary-foreground",
          isInRange() && "rounded-none bg-muted text-foreground",
          // Outside month
          "data-[outside=true]:text-muted-foreground data-[outside=true]:aria-selected:text-muted-foreground",
          // Disabled (not selectable, grayed out)
          "data-disabled:text-muted-foreground data-disabled:opacity-50",
          // Booked (strikethrough styling)
          isBooked() && "line-through",
          // Custom cell styling - add padding if custom cell is provided
          props.customCell && "h-auto min-h-(--cell-size) py-1"
        )}
        data-outside={isOutsideMonth() || undefined}
      >
        <span>{props.day.getDate()}</span>
        <Show when={props.customCell}>
          {(renderCustomCell) =>
            renderCustomCell()({
              date: props.day,
              isOutsideMonth: isOutsideMonth(),
              isSelected: isSelected(),
              isDisabled: isDisabled(),
              isToday: isToday()
            })
          }
        </Show>
      </Calendar.CellTrigger>
    </Calendar.Cell>
  )
}

// Helper function
const isSameDay = (a: Date, b: Date): boolean => {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export {
  CalendarComponent as Calendar,
  type CalendarProps,
  type CustomCellProps
}
