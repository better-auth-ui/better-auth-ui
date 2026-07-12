import type { AuthView } from "@better-auth-ui/core"
import type { ReactNode } from "react"
import { Linking, Text } from "react-native"
import { cn } from "../lib/cn"
import { useAuthNavigation } from "../navigation/navigation-context"

export interface LinkProps {
  /** Internal auth view to navigate to (preferred for in-app links). */
  view?: AuthView
  /** External URL — opened in the system browser. */
  href?: string
  params?: Record<string, string>
  replace?: boolean
  isDisabled?: boolean
  className?: string
  /** Escape hatch for custom press handling. */
  onPress?: () => void
  children?: ReactNode
}

/**
 * Inline text link. Renders as a pressable `Text` so it composes inside a
 * `Description` (RN can't nest a `Pressable`/`View` inside `Text`). Internal
 * `view` links go through the navigation adapter; external `href` links open
 * in the system browser. For button-styled links use `Button` instead.
 */
export function Link({
  view,
  href,
  params,
  replace,
  isDisabled,
  className,
  onPress,
  children
}: LinkProps) {
  const navigation = useAuthNavigation()

  const handlePress = () => {
    if (isDisabled) return
    if (onPress) {
      onPress()
      return
    }
    if (view) {
      navigation.push(view, { params, replace })
      return
    }
    if (href && /^https?:\/\//.test(href)) {
      void Linking.openURL(href)
    }
  }

  return (
    <Text
      accessibilityRole="link"
      onPress={handlePress}
      className={cn(
        "font-medium text-neutral-900 dark:text-neutral-50",
        isDisabled && "opacity-50",
        className
      )}
    >
      {children}
    </Text>
  )
}
