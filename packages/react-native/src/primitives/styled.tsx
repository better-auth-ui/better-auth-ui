import { directionalStyle } from "../lib/directional-style"
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
import { useNativeLocale } from "../lib/native-locale"
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
  const { direction } = useNativeLocale()
  const colors = useThemeColors()
  const s = useMemo(
    () => ({
      direction,
      ...directionalStyle(tw(className, colors), direction)
    }),
    [className, colors, direction]
  )
  return <View style={style ? [s, style] : s} {...props} />
}

export function Txt({ className, style, ...props }: WithClass<TextProps>) {
  const { direction } = useNativeLocale()
  const colors = useThemeColors()
  const s = useMemo(
    () => ({
      direction,
      writingDirection: direction,
      ...directionalStyle(tw(className, colors), direction)
    }),
    [className, colors, direction]
  )
  return <Text style={style ? [s, style] : s} {...props} />
}

export function Btn({ className, style, ...props }: WithClass<PressableProps>) {
  const { direction } = useNativeLocale()
  const colors = useThemeColors()
  const s = useMemo(
    () => ({
      direction,
      ...directionalStyle(tw(className, colors), direction)
    }),
    [className, colors, direction]
  )
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
  contentContainerClassName,
  style,
  contentContainerStyle,
  ...props
}: WithClass<ScrollViewProps> & { contentContainerClassName?: string }) {
  const { direction } = useNativeLocale()
  const colors = useThemeColors()
  const s = useMemo(
    () => ({
      direction,
      ...directionalStyle(tw(className, colors), direction)
    }),
    [className, colors, direction]
  )
  const cs = useMemo(
    () => directionalStyle(tw(contentContainerClassName, colors), direction),
    [contentContainerClassName, colors, direction]
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
