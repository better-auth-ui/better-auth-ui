import { useMemo } from "react"
import {
  Pressable,
  type PressableProps,
  ScrollView,
  type ScrollViewProps,
  Text,
  type TextProps,
  View,
  type ViewProps
} from "react-native"
import { useThemeColors } from "../lib/theme-colors"
import { tw } from "../lib/tw"

/**
 * `className`-aware drop-in replacements for the core React Native components.
 * They resolve the class string to a plain RN `style` via {@link tw} + the
 * active theme, so the library styles itself with ZERO nativewind / uniwind /
 * babel transform in the consuming app. A `style` prop is always merged on top
 * (and wins), so consumers override with either `className` (this library's
 * utility subset) or `style` (any RN style).
 */
type WithClass<P> = P & { className?: string }

export function Box({ className, style, ...props }: WithClass<ViewProps>) {
  const colors = useThemeColors()
  const s = useMemo(() => tw(className, colors), [className, colors])
  return <View style={style ? [s, style] : s} {...props} />
}

export function Txt({ className, style, ...props }: WithClass<TextProps>) {
  const colors = useThemeColors()
  const s = useMemo(() => tw(className, colors), [className, colors])
  return <Text style={style ? [s, style] : s} {...props} />
}

export function Btn({ className, style, ...props }: WithClass<PressableProps>) {
  const colors = useThemeColors()
  const s = useMemo(() => tw(className, colors), [className, colors])
  return (
    <Pressable
      style={(state) => {
        const cs = typeof style === "function" ? style(state) : style
        return cs ? [s, cs] : s
      }}
      {...props}
    />
  )
}

export function ScrollBox({
  className,
  contentClassName,
  style,
  contentContainerStyle,
  ...props
}: WithClass<ScrollViewProps> & { contentClassName?: string }) {
  const colors = useThemeColors()
  const s = useMemo(() => tw(className, colors), [className, colors])
  const cs = useMemo(
    () => tw(contentClassName, colors),
    [contentClassName, colors]
  )
  return (
    <ScrollView
      style={style ? [s, style] : s}
      contentContainerStyle={
        contentContainerStyle ? [cs, contentContainerStyle] : cs
      }
      {...props}
    />
  )
}
