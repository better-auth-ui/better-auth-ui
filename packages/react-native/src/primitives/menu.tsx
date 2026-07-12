import { Children, type ReactNode, useState } from "react"
import { Modal, Pressable, ScrollView, Text, View } from "react-native"
import { cn } from "../lib/cn"
import { useThemeColors } from "../lib/theme-colors"
import { Check, ChevronDown } from "./ui-icons"

export type MenuItemVariant = "default" | "danger"

export interface MenuItemProps {
  /** Selection key for this row (required to participate in single-select). */
  id?: string
  /** Leading icon, sized/coloured to match other rows. */
  icon?: ReactNode
  /** Row label. Bare strings are wrapped in a styled `Text`. */
  children?: ReactNode
  variant?: MenuItemVariant
  isDisabled?: boolean
  onPress?: () => void
  className?: string
}

/**
 * A single pressable row inside a `Menu`. When rendered inside `Menu` (which
 * clones its children to inject selection state), a leading `Check` appears
 * automatically if `id` matches the enclosing `Menu`'s `selectedKey`.
 */
function MenuItem({
  icon,
  children,
  variant = "default",
  isDisabled = false,
  onPress,
  className,
  // Injected by `Menu` when composing children — not part of the public API.
  ...injected
}: MenuItemProps & { isSelected?: boolean }) {
  const colors = useThemeColors()
  const { isSelected } = injected as { isSelected?: boolean }

  return (
    <Pressable
      accessibilityRole="menuitem"
      accessibilityState={{ disabled: isDisabled, selected: isSelected }}
      disabled={isDisabled}
      onPress={onPress}
      className={cn(
        "flex-row items-center gap-2 rounded-lg px-3 py-2.5",
        isDisabled && "opacity-50",
        className
      )}
    >
      {icon}

      {typeof children === "string" ? (
        <Text
          className={cn(
            "flex-1 text-sm text-foreground",
            variant === "danger" && "text-danger"
          )}
        >
          {children}
        </Text>
      ) : (
        <View className="flex-1">{children}</View>
      )}

      {isSelected && (
        <Check
          width={16}
          height={16}
          color={variant === "danger" ? colors.danger : colors.accent}
        />
      )}
    </Pressable>
  )
}

export interface MenuProps {
  /** Controls Modal visibility. */
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  /** The currently selected row's `id`, for single-select menus. */
  selectedKey?: string
  onSelect?: (key: string) => void
  /** `Menu.Item` rows (and arbitrary other content, e.g. a header). */
  children?: ReactNode
  className?: string
}

/**
 * Reusable trigger-less Modal bottom-sheet listing selectable rows —
 * generalises the inline action-sheet pattern used by `UserButton`. Fully
 * controlled: the parent owns `isOpen`/`onOpenChange` and renders its own
 * trigger element separately.
 *
 * Single-select: pass `selectedKey` + `onSelect`; rows created via
 * `Menu.Item` with a matching `id` render a trailing `Check`, and pressing a
 * row calls both `onSelect(id)` and the row's own `onPress` before closing.
 */
function MenuBase({
  isOpen,
  onOpenChange,
  selectedKey,
  onSelect,
  children,
  className
}: MenuProps) {
  const content = Children.map(children, (child) => {
    if (
      !child ||
      typeof child !== "object" ||
      !("type" in child) ||
      child.type !== MenuItem
    ) {
      return child
    }

    const itemProps = child.props as MenuItemProps
    const isSelected =
      itemProps.id !== undefined && itemProps.id === selectedKey

    return (
      <MenuItem
        {...itemProps}
        isSelected={isSelected}
        onPress={() => {
          if (itemProps.id !== undefined) onSelect?.(itemProps.id)
          itemProps.onPress?.()
          onOpenChange(false)
        }}
      />
    )
  })

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={() => onOpenChange(false)}
    >
      <Pressable
        accessibilityRole="none"
        className="flex-1 justify-end bg-black/30"
        onPress={() => onOpenChange(false)}
      >
        <Pressable
          onPress={(event) => event.stopPropagation()}
          className={cn(
            "max-h-[70%] gap-1 rounded-t-2xl border border-border bg-surface p-2",
            className
          )}
        >
          <ScrollView bounces={false}>{content}</ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

/**
 * Menu bottom-sheet + selectable rows. `Menu.Item` rows support `id`
 * (selection key), `icon`, `variant="danger"`, and `isDisabled`.
 */
export const Menu = Object.assign(MenuBase, {
  Item: MenuItem
})

export interface SelectOption {
  key: string
  label: string
}

export interface SelectProps {
  label?: string
  placeholder?: string
  options: SelectOption[]
  selectedKey?: string
  onSelectionChange?: (key: string) => void
  isDisabled?: boolean
  className?: string
}

/**
 * A labeled field styled like `Input` that opens a `Menu` to single-select
 * one option from `options`. Shows the selected option's label (or
 * `placeholder`) plus a trailing chevron.
 */
export function Select({
  label,
  placeholder = "Select…",
  options,
  selectedKey,
  onSelectionChange,
  isDisabled = false,
  className
}: SelectProps) {
  const [open, setOpen] = useState(false)
  const colors = useThemeColors()

  const selectedLabel = options.find(
    (option) => option.key === selectedKey
  )?.label

  return (
    <View className="gap-1.5">
      {label && (
        <Text className="text-sm font-medium text-foreground">{label}</Text>
      )}

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled, expanded: open }}
        disabled={isDisabled}
        onPress={() => setOpen(true)}
        className={cn(
          "h-11 flex-row items-center justify-between rounded-lg border border-border px-3",
          isDisabled && "opacity-50",
          className
        )}
      >
        <Text
          className={cn(
            "text-base",
            selectedLabel ? "text-foreground" : "text-muted"
          )}
        >
          {selectedLabel ?? placeholder}
        </Text>

        <ChevronDown width={16} height={16} color={colors.muted} />
      </Pressable>

      <Menu
        isOpen={open}
        onOpenChange={setOpen}
        selectedKey={selectedKey}
        onSelect={(key) => onSelectionChange?.(key)}
      >
        {options.map((option) => (
          <Menu.Item key={option.key} id={option.key}>
            {option.label}
          </Menu.Item>
        ))}
      </Menu>
    </View>
  )
}
