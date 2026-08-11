import {
  createContext,
  Fragment,
  type ReactNode,
  useContext,
  useMemo
} from "react"
import { FlatList, type FlatListProps, type ViewProps } from "react-native"
import { cn } from "../lib/cn"
import { useThemeColors } from "../lib/theme-colors"
import { Box, Btn, ScrollBox, Txt } from "./styled"
import { Check } from "./ui-icons"

/* -------------------------------------------------------------------------
 * ListBox — inline (non-Modal) single/multi-select list. Shared row-renderer
 * used by the ComboBox/Select popovers (heroui `ListBox`/`ListBox.Item`/
 * `ListBox.Section`).
 * ---------------------------------------------------------------------- */

export type ListBoxSelectionMode = "single" | "multiple" | "none"

export interface ListBoxContextValue {
  selectionMode: ListBoxSelectionMode
  selectedKeys: ReadonlySet<string>
  onSelectionChange?: (keys: Set<string>) => void
  variant: "primary" | "secondary"
}

const ListBoxContext = createContext<ListBoxContextValue | null>(null)

function useListBox(): ListBoxContextValue {
  const context = useContext(ListBoxContext)
  if (!context) {
    throw new Error(
      "[Better Auth UI] ListBox.Item/Section must be used within a ListBox"
    )
  }
  return context
}

export interface ListBoxProps extends Omit<ViewProps, "style"> {
  /** Mirrors heroui's `selectedKeys`/`onSelectionChange` selection contract. */
  selectionMode?: ListBoxSelectionMode
  selectedKeys?: Iterable<string>
  onSelectionChange?: (keys: Set<string>) => void
  variant?: "primary" | "secondary"
  className?: string
  children?: ReactNode
}

function ListBoxBase({
  selectionMode = "single",
  selectedKeys,
  onSelectionChange,
  variant = "primary",
  className,
  children,
  ...props
}: ListBoxProps) {
  const selected = useMemo(() => new Set(selectedKeys ?? []), [selectedKeys])

  const context = useMemo<ListBoxContextValue>(
    () => ({
      selectionMode,
      selectedKeys: selected,
      onSelectionChange,
      variant
    }),
    [selectionMode, selected, onSelectionChange, variant]
  )

  return (
    <ListBoxContext.Provider value={context}>
      <Box
        accessibilityRole="menu"
        className={cn("gap-0.5", className)}
        {...props}
      >
        {children}
      </Box>
    </ListBoxContext.Provider>
  )
}

export interface ListBoxItemProps {
  id: string
  /** Accessible label; also used as the fallback text when `children` is a bare string. */
  textValue?: string
  isDisabled?: boolean
  /** Leading icon/element rendered before the label. */
  icon?: ReactNode
  onPress?: (id: string) => void
  className?: string
  children?: ReactNode
}

/** A single selectable row. Renders a trailing checkmark when selected. */
function ListBoxItem({
  id,
  textValue,
  isDisabled = false,
  icon,
  onPress,
  className,
  children
}: ListBoxItemProps) {
  const { selectionMode, selectedKeys, onSelectionChange } = useListBox()
  const colors = useThemeColors()
  const isSelected = selectionMode !== "none" && selectedKeys.has(id)

  const handlePress = () => {
    if (isDisabled) return
    onPress?.(id)

    if (selectionMode === "none") return

    const next = new Set(selectedKeys)
    if (selectionMode === "single") {
      next.clear()
      next.add(id)
    } else if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    onSelectionChange?.(next)
  }

  return (
    <Btn
      accessibilityRole="menuitem"
      accessibilityState={{ disabled: isDisabled, selected: isSelected }}
      accessibilityLabel={textValue}
      disabled={isDisabled}
      onPress={handlePress}
      className={cn(
        "flex-row items-center gap-2 rounded-lg px-3 py-2.5",
        isSelected && "bg-surface-secondary",
        isDisabled && "opacity-50",
        className
      )}
    >
      {icon}

      <Box className="flex-1">
        {typeof children === "string" ? (
          <Txt className="text-sm text-foreground">{children}</Txt>
        ) : (
          (children ?? (
            <Txt className="text-sm text-foreground">{textValue}</Txt>
          ))
        )}
      </Box>

      {isSelected && <ListBoxItemIndicator color={colors.accent} />}
    </Btn>
  )
}

/** Trailing checkmark indicator, exposed separately for custom item layouts. */
function ListBoxItemIndicator({
  color,
  className
}: {
  color?: string
  className?: string
}) {
  const colors = useThemeColors()
  return (
    <Check
      width={16}
      height={16}
      color={color ?? colors.accent}
      className={className}
    />
  )
}

export interface ListBoxSectionProps {
  /** Section heading text. */
  heading?: string
  className?: string
  children?: ReactNode
}

/** Groups `ListBox.Item`s under an optional heading. */
function ListBoxSection({ heading, className, children }: ListBoxSectionProps) {
  return (
    <Box className={cn("gap-0.5", className)}>
      {heading && (
        <Txt className="px-3 pt-2 pb-1 text-xs font-medium text-muted">
          {heading}
        </Txt>
      )}
      {children}
    </Box>
  )
}

/**
 * Inline (non-Modal) selectable list, mirroring heroui's `ListBox`. Used as
 * the shared option-row renderer inside `Select`/`ComboBox` popovers, and
 * standalone for simple in-place pickers. Controlled via `selectedKeys` /
 * `onSelectionChange`.
 */
export const ListBox = Object.assign(ListBoxBase, {
  Item: ListBoxItem,
  ItemIndicator: ListBoxItemIndicator,
  Section: ListBoxSection
})

/* -------------------------------------------------------------------------
 * DataList — RN idiom replacing heroui's sortable `Table` (see primitives
 * spec §4): a flex "table" of rows, virtualized with FlatList, with an
 * optional header row and divider lines between rows.
 * ---------------------------------------------------------------------- */

export interface DataListColumn {
  key: string
  label?: string
  /** Flex proportion for this column's header cell; mirrors row cell `flex`. */
  flex?: number
  className?: string
}

export interface DataListProps<T>
  extends Omit<
    FlatListProps<T>,
    "data" | "renderItem" | "keyExtractor" | "style" | "ItemSeparatorComponent"
  > {
  data: readonly T[]
  renderItem: (item: T, index: number) => ReactNode
  keyExtractor: (item: T, index: number) => string
  /** Optional column definitions rendered as a header row above the list. */
  columns?: DataListColumn[]
  /** Rendered instead of the list when `data` is empty. */
  renderEmptyState?: () => ReactNode
  /** Disables FlatList virtualization in favor of a plain ScrollView; use for
   * short, non-virtualized lists nested inside another scroll container. */
  scrollEnabled?: boolean
  className?: string
  rowClassName?: string
}

/**
 * Light replacement for heroui's `Table`: a `bg-surface` card of rows
 * separated by `border-border` dividers, with an optional header row. Backed
 * by `FlatList` for virtualization (org members / invitations / api-keys
 * lists), or degrade to a plain stacked `ScrollView` render via
 * `scrollEnabled={false}` when nested in another scroll view.
 */
export function DataList<T>({
  data,
  renderItem,
  keyExtractor,
  columns,
  renderEmptyState,
  scrollEnabled = true,
  className,
  rowClassName,
  ...props
}: DataListProps<T>) {
  const header = columns && columns.length > 0 && (
    <Box className="flex-row items-center gap-2 border-border border-b px-4 py-2">
      {columns.map((column) => (
        <Txt
          key={column.key}
          className={cn(
            "text-muted text-xs font-medium uppercase",
            column.className
          )}
          style={{ flex: column.flex ?? 1 }}
        >
          {column.label}
        </Txt>
      ))}
    </Box>
  )

  if (data.length === 0) {
    return (
      <Box
        className={cn("rounded-2xl border border-border bg-surface", className)}
      >
        {header}
        {renderEmptyState?.()}
      </Box>
    )
  }

  if (!scrollEnabled) {
    return (
      <Box
        className={cn("rounded-2xl border border-border bg-surface", className)}
      >
        {header}
        {data.map((item, index) => (
          <Fragment key={keyExtractor(item, index)}>
            {index > 0 && <Box className="h-px bg-border" />}
            <Box className={cn("px-4 py-3", rowClassName)}>
              {renderItem(item, index)}
            </Box>
          </Fragment>
        ))}
      </Box>
    )
  }

  return (
    <Box
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-surface",
        className
      )}
    >
      {header}
      <FlatList
        data={data as T[]}
        keyExtractor={keyExtractor}
        renderItem={({ item, index }) => (
          <Box className={cn("px-4 py-3", rowClassName)}>
            {renderItem(item, index)}
          </Box>
        )}
        ItemSeparatorComponent={() => <Box className="h-px bg-border" />}
        {...props}
      />
    </Box>
  )
}

/** Optional horizontal-scroll wrapper for narrow screens with wide columns. */
export function DataListScrollContainer({
  className,
  children
}: {
  className?: string
  children?: ReactNode
}) {
  return (
    <ScrollBox horizontal className={cn(className)}>
      {children}
    </ScrollBox>
  )
}
