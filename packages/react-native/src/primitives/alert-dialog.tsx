import { createContext, type ReactNode, useContext, useMemo } from "react"
import { KeyboardAvoidingView, Modal, Platform } from "react-native"
import { cn } from "../lib/cn"
import { useThemeColors } from "../lib/theme-colors"
import { tw } from "../lib/tw"
import { Box, Btn, ScrollBox, Txt } from "./styled"
import { Xmark } from "./ui-icons"

export type AlertDialogPlacement = "auto" | "top" | "center" | "bottom"
export type AlertDialogSize = "xs" | "sm" | "md" | "lg" | "cover"
export type AlertDialogIconStatus =
  | "default"
  | "accent"
  | "success"
  | "warning"
  | "danger"

interface AlertDialogContextValue {
  onOpenChange: (open: boolean) => void
}

const AlertDialogContext = createContext<AlertDialogContextValue | null>(null)

function useAlertDialog(): AlertDialogContextValue {
  const context = useContext(AlertDialogContext)
  if (!context) {
    throw new Error(
      "[Better Auth UI] AlertDialog.* subcomponents must be used within an AlertDialog"
    )
  }
  return context
}

export interface AlertDialogProps {
  /** Whether the dialog is visible. */
  isOpen: boolean
  /** Called with `false` when the dialog should close (backdrop, back button, close trigger). */
  onOpenChange: (open: boolean) => void
  /**
   * Allow tapping the backdrop to dismiss.
   * @default false
   */
  isDismissable?: boolean
  /**
   * Allow the Android hardware back button (or iOS swipe) to dismiss.
   * @default false
   */
  isKeyboardDismissDisabled?: boolean
  className?: string
  children?: ReactNode
}

/**
 * Root AlertDialog: a controlled `Modal` wrapping a centered/placed dialog
 * card. Mirrors heroui's `AlertDialog.Backdrop` + `.Container` + `.Dialog`
 * collapsed into one component (RN has no floating-popover layering concerns,
 * so the three web layers fold into a single `Modal`). Compose with
 * `AlertDialog.Header/Icon/Heading/Body/Footer/CloseTrigger`, or pass
 * `placement`/`size` via the nested `AlertDialog.Container` if finer control
 * over positioning/sizing is needed — otherwise this root renders a sensible
 * centered `"md"` card directly.
 *
 * Usage (matches the heroui call-site shape, minus the redundant
 * Backdrop/Container/Dialog nesting):
 * ```tsx
 * <AlertDialog isOpen={isOpen} onOpenChange={setOpen}>
 *   <AlertDialog.CloseTrigger />
 *   <AlertDialog.Header>
 *     <AlertDialog.Icon status="danger"><Trash /></AlertDialog.Icon>
 *     <AlertDialog.Heading>Delete organization?</AlertDialog.Heading>
 *   </AlertDialog.Header>
 *   <AlertDialog.Body>...</AlertDialog.Body>
 *   <AlertDialog.Footer>
 *     <Button variant="tertiary" onPress={() => setOpen(false)}>Cancel</Button>
 *     <Button variant="danger" onPress={onConfirm}>Delete</Button>
 *   </AlertDialog.Footer>
 * </AlertDialog>
 * ```
 */
function AlertDialogBase({
  isOpen,
  onOpenChange,
  isDismissable = false,
  isKeyboardDismissDisabled = true,
  className,
  children
}: AlertDialogProps) {
  const colors = useThemeColors()
  const context = useMemo<AlertDialogContextValue>(
    () => ({ onOpenChange }),
    [onOpenChange]
  )

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => {
        if (!isKeyboardDismissDisabled) onOpenChange(false)
      }}
    >
      <AlertDialogContext.Provider value={context}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={tw("flex-1", colors)}
        >
          <Btn
            accessibilityViewIsModal
            className="flex-1 items-center justify-center bg-black/50 p-4"
            onPress={() => {
              if (isDismissable) onOpenChange(false)
            }}
          >
            <Btn
              accessibilityRole="alert"
              onPress={(event) => event.stopPropagation()}
              className={cn(
                "w-full max-w-sm gap-4 rounded-2xl border border-border bg-surface p-5",
                className
              )}
            >
              {children}
            </Btn>
          </Btn>
        </KeyboardAvoidingView>
      </AlertDialogContext.Provider>
    </Modal>
  )
}

const PLACEMENT_CLASSES: Record<AlertDialogPlacement, string> = {
  auto: "justify-center",
  center: "justify-center",
  top: "justify-start",
  bottom: "justify-end"
}

const SIZE_CLASSES: Record<AlertDialogSize, string> = {
  xs: "max-w-xs",
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  cover: "max-w-full"
}

export interface AlertDialogContainerProps {
  /**
   * Where the dialog card sits within the screen.
   * @default "auto" (renders as centered)
   */
  placement?: AlertDialogPlacement
  /**
   * Max-width cap on the dialog card.
   * @default "sm"
   */
  size?: AlertDialogSize
  className?: string
  children?: ReactNode
}

/**
 * Optional wrapper for finer control over dialog placement/size than the
 * `AlertDialog` root's default centered card provides. Use in place of
 * relying on the root's built-in layout when a call site needs a bottom-sheet
 * feel (`placement="bottom"`) or a wider/narrower card (`size`).
 */
function AlertDialogContainer({
  placement = "auto",
  size = "sm",
  className,
  children
}: AlertDialogContainerProps) {
  return (
    <Box
      className={cn(
        "w-full flex-1",
        "items-center",
        PLACEMENT_CLASSES[placement],
        className
      )}
    >
      <Box className={cn("w-full", SIZE_CLASSES[size])}>{children}</Box>
    </Box>
  )
}

export interface AlertDialogDialogProps {
  className?: string
  children?: ReactNode
}

/**
 * The dialog card surface itself. Only needed when composing through
 * `AlertDialog.Container` for custom placement/size — the `AlertDialog` root
 * already renders this styling directly when used without a `Container`.
 */
function AlertDialogDialog({ className, children }: AlertDialogDialogProps) {
  return (
    <Box
      accessibilityRole="alert"
      className={cn(
        "gap-4 rounded-2xl border border-border bg-surface p-5",
        className
      )}
    >
      {children}
    </Box>
  )
}

export interface AlertDialogHeaderProps {
  className?: string
  children?: ReactNode
}

/** Header row: typically an `Icon` + `Heading`. */
function AlertDialogHeader({ className, children }: AlertDialogHeaderProps) {
  return <Box className={cn("gap-3 pr-6", className)}>{children}</Box>
}

const ICON_STATUS_CLASSES: Record<AlertDialogIconStatus, string> = {
  default: "bg-surface-secondary",
  accent: "bg-accent/15",
  success: "bg-accent/15",
  warning: "bg-danger/10",
  danger: "bg-danger/15"
}

export interface AlertDialogIconProps {
  /**
   * Visual emphasis of the icon badge.
   * @default "danger"
   */
  status?: AlertDialogIconStatus
  className?: string
  children?: ReactNode
}

/**
 * Circular colored badge wrapping a leading icon in the header, e.g.
 * `<AlertDialog.Icon status="danger"><Trash /></AlertDialog.Icon>`. Children
 * are cloned with a `color` matching the status unless the child already
 * supplies its own — simplest is for callers to pass `currentColor`-style
 * icons and let this component pass `color` explicitly via context-free
 * convention (RN svg icons take a `color` prop directly, so callers
 * typically just pass `color={colors.danger}` themselves; this wrapper only
 * supplies the background + sizing).
 */
function AlertDialogIcon({
  status = "danger",
  className,
  children
}: AlertDialogIconProps) {
  return (
    <Box
      className={cn(
        "h-10 w-10 items-center justify-center rounded-full",
        ICON_STATUS_CLASSES[status],
        className
      )}
    >
      {children}
    </Box>
  )
}

export interface AlertDialogHeadingProps {
  className?: string
  children?: ReactNode
}

/** Dialog title text. */
function AlertDialogHeading({ className, children }: AlertDialogHeadingProps) {
  return (
    <Txt
      className={cn("text-lg font-semibold text-foreground", className)}
      accessibilityRole="header"
    >
      {children}
    </Txt>
  )
}

export interface AlertDialogBodyProps {
  /** Applied to the scroll container (outer sizing, e.g. max height). */
  className?: string
  /** Applied to the scroll content (child spacing, e.g. `gap-4`). */
  contentClassName?: string
  children?: ReactNode
}

/** Scrollable body area (description text, optional form fields). */
function AlertDialogBody({
  className,
  contentClassName,
  children
}: AlertDialogBodyProps) {
  return (
    <ScrollBox
      className={cn("max-h-96", className)}
      contentContainerClassName={cn("gap-3", contentClassName)}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollBox>
  )
}

export interface AlertDialogFooterProps {
  className?: string
  children?: ReactNode
}

/** Button row, right-aligned by default. */
function AlertDialogFooter({ className, children }: AlertDialogFooterProps) {
  return (
    <Box className={cn("flex-row justify-end gap-2", className)}>
      {children}
    </Box>
  )
}

export interface AlertDialogCloseTriggerProps {
  /**
   * Optional explicit handler. When omitted, closes the enclosing
   * `AlertDialog` via context (equivalent to heroui's `slot="close"`
   * convention, which RN has no equivalent for — see primitives spec).
   */
  onPress?: () => void
  className?: string
  "aria-label"?: string
}

/** Small `X` affordance, absolutely positioned in the dialog's top-right corner. */
function AlertDialogCloseTrigger({
  onPress,
  className,
  "aria-label": ariaLabel = "Close"
}: AlertDialogCloseTriggerProps) {
  const { onOpenChange } = useAlertDialog()
  const colors = useThemeColors()

  return (
    <Btn
      accessibilityRole="button"
      accessibilityLabel={ariaLabel}
      onPress={() => (onPress ? onPress() : onOpenChange(false))}
      className={cn(
        "absolute top-3 right-3 z-10 h-8 w-8 items-center justify-center rounded-full",
        className
      )}
      hitSlop={8}
    >
      <Xmark width={16} height={16} color={colors.muted} />
    </Btn>
  )
}

/**
 * Modal-based confirm/alert dialog compound, full parity with heroui's
 * `AlertDialog.*`. Controlled via `isOpen`/`onOpenChange` — there is no
 * uncontrolled/trigger-driven variant (matches every call site in the web
 * codebase: create/delete/leave org, remove member, invite member, api-key
 * create/delete/new, passkey add/delete).
 *
 * RN deviation: `AlertDialog.CloseTrigger` takes an explicit `onPress` (or
 * defaults to closing via context) instead of react-aria-components'
 * `slot="close"` convention, since RN `Button`/`Pressable` has no slot
 * mechanism.
 */
export const AlertDialog = Object.assign(AlertDialogBase, {
  Container: AlertDialogContainer,
  Dialog: AlertDialogDialog,
  Header: AlertDialogHeader,
  Icon: AlertDialogIcon,
  Heading: AlertDialogHeading,
  Body: AlertDialogBody,
  Footer: AlertDialogFooter,
  CloseTrigger: AlertDialogCloseTrigger
})
