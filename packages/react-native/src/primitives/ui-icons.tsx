import { useMemo } from "react"
import Svg, {
  Circle,
  Line,
  Path,
  Polygon,
  Polyline,
  Rect,
  type SvgProps
} from "react-native-svg"
import { useThemeColors } from "../lib/theme-colors"
import { tw } from "../lib/tw"

/**
 * Icon props: `SvgProps` plus this library's `className` subset, resolved to a
 * plain style by {@link tw} so the icons need no styling engine in the app.
 */
export type UiIconProps = SvgProps & { className?: string }

/**
 * UI glyphs used by the auth components (the heroui port uses `@gravity-ui/
 * icons`). These are Feather-style stroked icons drawn with `react-native-svg`.
 * They stroke with `currentColor`, so pass a `color` prop (defaults to the
 * platform text color).
 */

const STROKE: Partial<SvgProps> = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round"
}

function Base({ className, style, color, ...props }: UiIconProps) {
  const colors = useThemeColors()
  const resolved = useMemo(() => tw(className, colors), [className, colors])
  // The glyphs stroke with `currentColor`, so a `text-*` class has to reach
  // react-native-svg as the `color` prop rather than as a style rule.
  const { color: classColor, ...layout } = resolved

  return (
    <Svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      {...STROKE}
      color={color ?? (classColor as string | undefined)}
      style={style ? [layout, style] : layout}
      {...props}
    />
  )
}

export function Eye(props: UiIconProps) {
  return (
    <Base {...props}>
      <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <Circle cx="12" cy="12" r="3" />
    </Base>
  )
}

export function EyeSlash(props: UiIconProps) {
  return (
    <Base {...props}>
      <Path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <Line x1="1" y1="1" x2="23" y2="23" />
    </Base>
  )
}

export function Person(props: UiIconProps) {
  return (
    <Base {...props}>
      <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <Circle cx="12" cy="7" r="4" />
    </Base>
  )
}

export function PersonPlus(props: UiIconProps) {
  return (
    <Base {...props}>
      <Path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <Circle cx="8.5" cy="7" r="4" />
      <Line x1="20" y1="8" x2="20" y2="14" />
      <Line x1="23" y1="11" x2="17" y2="11" />
    </Base>
  )
}

export function Envelope(props: UiIconProps) {
  return (
    <Base {...props}>
      <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <Polyline points="22,6 12,13 2,6" />
    </Base>
  )
}

export function Lock(props: UiIconProps) {
  return (
    <Base {...props}>
      <Rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <Path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </Base>
  )
}

export function ArrowUpRightFromSquare(props: UiIconProps) {
  return (
    <Base {...props}>
      <Path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <Polyline points="15 3 21 3 21 9" />
      <Line x1="10" y1="14" x2="21" y2="3" />
    </Base>
  )
}

export function ArrowRightFromSquare(props: UiIconProps) {
  return (
    <Base {...props}>
      <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <Polyline points="16 17 21 12 16 7" />
      <Line x1="21" y1="12" x2="9" y2="12" />
    </Base>
  )
}

export function ArrowRightToSquare(props: UiIconProps) {
  return (
    <Base {...props}>
      <Path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <Polyline points="10 17 15 12 10 7" />
      <Line x1="15" y1="12" x2="3" y2="12" />
    </Base>
  )
}

export function Gear(props: UiIconProps) {
  return (
    <Base {...props}>
      <Circle cx="12" cy="12" r="3" />
      <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </Base>
  )
}

export function ChevronsExpandVertical(props: UiIconProps) {
  return (
    <Base {...props}>
      <Polyline points="7 15 12 20 17 15" />
      <Polyline points="7 9 12 4 17 9" />
    </Base>
  )
}

export function ChevronDown(props: UiIconProps) {
  return (
    <Base {...props}>
      <Polyline points="6 9 12 15 18 9" />
    </Base>
  )
}

export function Check(props: UiIconProps) {
  return (
    <Base {...props}>
      <Polyline points="20 6 9 17 4 12" />
    </Base>
  )
}

export function Copy(props: UiIconProps) {
  return (
    <Base {...props}>
      <Rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <Path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </Base>
  )
}

export function Search(props: UiIconProps) {
  return (
    <Base {...props}>
      <Circle cx="11" cy="11" r="8" />
      <Line x1="21" y1="21" x2="16.65" y2="16.65" />
    </Base>
  )
}

export function Minus(props: UiIconProps) {
  return (
    <Base {...props}>
      <Line x1="5" y1="12" x2="19" y2="12" />
    </Base>
  )
}

export function Plus(props: UiIconProps) {
  return (
    <Base {...props}>
      <Line x1="12" y1="5" x2="12" y2="19" />
      <Line x1="5" y1="12" x2="19" y2="12" />
    </Base>
  )
}

export function Xmark(props: UiIconProps) {
  return (
    <Base {...props}>
      <Line x1="18" y1="6" x2="6" y2="18" />
      <Line x1="6" y1="6" x2="18" y2="18" />
    </Base>
  )
}

export function Sun(props: UiIconProps) {
  return (
    <Base {...props}>
      <Circle cx="12" cy="12" r="5" />
      <Line x1="12" y1="1" x2="12" y2="3" />
      <Line x1="12" y1="21" x2="12" y2="23" />
      <Line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <Line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <Line x1="1" y1="12" x2="3" y2="12" />
      <Line x1="21" y1="12" x2="23" y2="12" />
      <Line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <Line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </Base>
  )
}

export function Moon(props: UiIconProps) {
  return (
    <Base {...props}>
      <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </Base>
  )
}

export function Display(props: UiIconProps) {
  return (
    <Base {...props}>
      <Rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <Line x1="8" y1="21" x2="16" y2="21" />
      <Line x1="12" y1="17" x2="12" y2="21" />
    </Base>
  )
}

export function Smartphone(props: UiIconProps) {
  return (
    <Base {...props}>
      <Rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
      <Line x1="12" y1="18" x2="12.01" y2="18" />
    </Base>
  )
}

export function TriangleExclamation(props: UiIconProps) {
  return (
    <Base {...props}>
      <Path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <Line x1="12" y1="9" x2="12" y2="13" />
      <Line x1="12" y1="17" x2="12.01" y2="17" />
    </Base>
  )
}

export function Palette(props: UiIconProps) {
  return (
    <Base {...props}>
      <Path d="M12 22a10 10 0 1 1 0-20 8 8 0 0 1 8 8 4.5 4.5 0 0 1-4.5 4.5H14a1.5 1.5 0 0 0-1.06 2.56l.06.06A1.5 1.5 0 0 1 12 22z" />
      <Circle cx="6.5" cy="11.5" r="1.5" />
      <Circle cx="9.5" cy="7.5" r="1.5" />
      <Circle cx="14.5" cy="7.5" r="1.5" />
      <Circle cx="17.5" cy="11.5" r="1.5" />
    </Base>
  )
}

export function Briefcase(props: UiIconProps) {
  return (
    <Base {...props}>
      <Rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <Path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </Base>
  )
}

export function Upload(props: UiIconProps) {
  return (
    <Base {...props}>
      <Path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <Polyline points="17 8 12 3 7 8" />
      <Line x1="12" y1="3" x2="12" y2="15" />
    </Base>
  )
}

export function Trash(props: UiIconProps) {
  return (
    <Base {...props}>
      <Polyline points="3 6 5 6 21 6" />
      <Path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <Line x1="10" y1="11" x2="10" y2="17" />
      <Line x1="14" y1="11" x2="14" y2="17" />
    </Base>
  )
}

export function Pencil(props: UiIconProps) {
  return (
    <Base {...props}>
      <Path d="M12 20h9" />
      <Path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </Base>
  )
}

export function ChevronRight(props: UiIconProps) {
  return (
    <Base {...props}>
      <Polyline points="9 18 15 12 9 6" />
    </Base>
  )
}

export function Key(props: UiIconProps) {
  return (
    <Base {...props}>
      <Path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </Base>
  )
}

export function Users(props: UiIconProps) {
  return (
    <Base {...props}>
      <Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <Circle cx="9" cy="7" r="4" />
      <Path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <Path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </Base>
  )
}

export function Shield(props: UiIconProps) {
  return (
    <Base {...props}>
      <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </Base>
  )
}

/** Named `LinkIcon` (not `Link`) to avoid colliding with the `Link` primitive component. */
export function LinkIcon(props: UiIconProps) {
  return (
    <Base {...props}>
      <Path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <Path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </Base>
  )
}

export function LinkSlash(props: UiIconProps) {
  return (
    <Base {...props}>
      <Path d="M9 17H7A5 5 0 0 1 7 7h1" />
      <Path d="M15 7h2a5 5 0 0 1 3.55 8.55" />
      <Line x1="8" y1="12" x2="12" y2="12" />
      <Line x1="2" y1="2" x2="22" y2="22" />
    </Base>
  )
}

export function PlugConnection(props: UiIconProps) {
  return (
    <Base {...props}>
      <Path d="M12 22v-5" />
      <Path d="M9 8V2" />
      <Path d="M15 8V2" />
      <Path d="M18 8v3a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8z" />
    </Base>
  )
}

export function ArrowRightArrowLeft(props: UiIconProps) {
  return (
    <Base {...props}>
      <Polyline points="17 1 21 5 17 9" />
      <Path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <Polyline points="7 23 3 19 7 15" />
      <Path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </Base>
  )
}

export function CirclePlus(props: UiIconProps) {
  return (
    <Base {...props}>
      <Circle cx="12" cy="12" r="10" />
      <Line x1="12" y1="8" x2="12" y2="16" />
      <Line x1="8" y1="12" x2="16" y2="12" />
    </Base>
  )
}

export function Filter(props: UiIconProps) {
  return (
    <Base {...props}>
      <Polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </Base>
  )
}

export function Send(props: UiIconProps) {
  return (
    <Base {...props}>
      <Line x1="22" y1="2" x2="11" y2="13" />
      <Polygon points="22 2 15 22 11 13 2 9 22 2" />
    </Base>
  )
}

export function Clock(props: UiIconProps) {
  return (
    <Base {...props}>
      <Circle cx="12" cy="12" r="10" />
      <Polyline points="12 6 12 12 16 14" />
    </Base>
  )
}
