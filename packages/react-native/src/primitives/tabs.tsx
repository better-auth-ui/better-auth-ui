import { createContext, type ReactNode, useContext, useMemo } from "react"
import { ScrollView, Text, View, type ViewProps } from "react-native"
import { cn } from "../lib/cn"
import { Button } from "./button"

/**
 * Tabs as a segmented control. RN has no URL-driven tab navigation, so unlike
 * heroui's `Tabs.Tab` (which carries `href`), selection here is pure local
 * state: `selectedKey` + `onSelectionChange`. Consumers that need tabs to
 * drive navigation (e.g. the settings account/security switcher) call
 * `onSelectionChange` and update their own route/selected-key state.
 */

export interface TabsContextValue {
  selectedKey: string
  onSelectionChange: (key: string) => void
}

const TabsContext = createContext<TabsContextValue | null>(null)

function useTabsContext(): TabsContextValue {
  const context = useContext(TabsContext)
  if (!context) {
    throw new Error(
      "[Better Auth UI] Tabs.List/Tab/Panel must be used within a Tabs root"
    )
  }
  return context
}

export interface TabsProps extends Omit<ViewProps, "style"> {
  selectedKey: string
  onSelectionChange: (key: string) => void
  className?: string
  children?: ReactNode
}

function TabsBase({
  selectedKey,
  onSelectionChange,
  className,
  children,
  ...props
}: TabsProps) {
  const context = useMemo<TabsContextValue>(
    () => ({ selectedKey, onSelectionChange }),
    [selectedKey, onSelectionChange]
  )

  return (
    <TabsContext.Provider value={context}>
      <View className={cn("gap-3", className)} {...props}>
        {children}
      </View>
    </TabsContext.Provider>
  )
}

export interface TabsListProps {
  className?: string
  children?: ReactNode
  "aria-label"?: string
}

/**
 * Horizontal scrollable row of `Tabs.Tab`s, styled as a segmented control
 * (rounded pill track, `bg-surface-secondary`).
 */
function TabsList({ className, children }: TabsListProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="flex-row gap-1 rounded-xl bg-surface-secondary p-1"
      className={cn("flex-none", className)}
    >
      {children}
    </ScrollView>
  )
}

export interface TabsTabProps {
  id: string
  className?: string
  textClassName?: string
  isDisabled?: boolean
  children?: ReactNode
}

/**
 * A single segmented-control tab. Active state is styled as a raised pill
 * (`bg-surface` + `text-accent`) inside the `Tabs.List` track.
 */
function TabsTab({
  id,
  className,
  textClassName,
  isDisabled = false,
  children
}: TabsTabProps) {
  const { selectedKey, onSelectionChange } = useTabsContext()
  const isActive = selectedKey === id

  return (
    <Button
      variant="ghost"
      size="sm"
      isDisabled={isDisabled}
      onPress={() => onSelectionChange(id)}
      accessibilityState={{ selected: isActive, disabled: isDisabled }}
      className={cn(
        "rounded-lg px-3",
        isActive ? "bg-surface" : "bg-transparent",
        className
      )}
      textClassName={cn(isActive ? "text-accent" : "text-muted", textClassName)}
    >
      {children}
    </Button>
  )
}

export interface TabsPanelProps {
  id: string
  className?: string
  children?: ReactNode
}

/** Renders its children only when `id` matches the active `selectedKey`. */
function TabsPanel({ id, className, children }: TabsPanelProps) {
  const { selectedKey } = useTabsContext()
  if (selectedKey !== id) return null
  return <View className={cn(className)}>{children}</View>
}

/**
 * Segmented-control tab switcher. `Tabs` (root) + `.List` + `.Tab` + `.Panel`,
 * mirroring the heroui `Tabs` composition (minus the DOM-only `ListContainer`/
 * `Indicator`/`Separator` subparts, which have no meaningful RN equivalent —
 * the active tab is styled directly rather than an animated underline).
 */
export const Tabs = Object.assign(TabsBase, {
  List: TabsList,
  Tab: TabsTab,
  Panel: TabsPanel
})

/* -------------------------------------------------------------------------- */
/* Chip                                                                       */
/* -------------------------------------------------------------------------- */

export type ChipColor = "default" | "accent" | "success" | "warning" | "danger"

export interface ChipProps extends Omit<ViewProps, "style"> {
  color?: ChipColor
  className?: string
  textClassName?: string
  children?: ReactNode
}

const CHIP_CONTAINER: Record<ChipColor, string> = {
  default: "bg-surface-secondary",
  accent: "bg-accent/10",
  success: "bg-green-600/10",
  warning: "bg-amber-600/10",
  danger: "bg-danger/10"
}

const CHIP_TEXT: Record<ChipColor, string> = {
  default: "text-muted",
  accent: "text-accent",
  success: "text-green-600",
  warning: "text-amber-600",
  danger: "text-danger"
}

function ChipBase({
  color = "default",
  className,
  textClassName,
  children,
  ...props
}: ChipProps) {
  return (
    <View
      className={cn(
        "flex-row items-center self-start rounded-full px-2.5 py-1",
        CHIP_CONTAINER[color],
        className
      )}
      {...props}
    >
      {typeof children === "string" || typeof children === "number" ? (
        <Text
          className={cn("text-xs font-medium", CHIP_TEXT[color], textClassName)}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  )
}

function ChipLabel({
  className,
  children
}: {
  className?: string
  children?: ReactNode
}) {
  return (
    <Text className={cn("text-xs font-medium", className)}>{children}</Text>
  )
}

/**
 * Small color-coded pill. `color` selects the semantic hue (`default`/
 * `accent`/`success`/`warning`/`danger`); `success`/`warning` use raw
 * green/amber-600 tokens (no dedicated theme token for those, matching the
 * house convention already used by `toast.tsx`). String/number children are
 * auto-wrapped in a styled `Text`; use `Chip.Label` directly for custom
 * children composition.
 */
export const Chip = Object.assign(ChipBase, {
  Label: ChipLabel
})

/* -------------------------------------------------------------------------- */
/* EmptyState                                                                 */
/* -------------------------------------------------------------------------- */

export interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
  children?: ReactNode
}

/**
 * Centered empty-state block: optional icon, title, description, and an
 * optional trailing CTA (pass a `Button` as `action`, or arbitrary `children`
 * for full control). Trivial styled wrapper — no internal state.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  children
}: EmptyStateProps) {
  return (
    <View
      className={cn("items-center gap-3 rounded-2xl px-6 py-10", className)}
    >
      {icon && (
        <View className="h-12 w-12 items-center justify-center rounded-full bg-surface-secondary">
          {icon}
        </View>
      )}

      <View className="items-center gap-1">
        <Text className="text-center text-base font-semibold text-foreground">
          {title}
        </Text>
        {description && (
          <Text className="text-center text-sm text-muted">{description}</Text>
        )}
      </View>

      {action}
      {children}
    </View>
  )
}
