import Svg, {
  Circle,
  Line,
  Path,
  Polyline,
  Rect,
  type SvgProps
} from "react-native-svg"

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

function Base(props: SvgProps) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" {...STROKE} {...props} />
  )
}

export function Eye(props: SvgProps) {
  return (
    <Base {...props}>
      <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <Circle cx="12" cy="12" r="3" />
    </Base>
  )
}

export function EyeSlash(props: SvgProps) {
  return (
    <Base {...props}>
      <Path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <Line x1="1" y1="1" x2="23" y2="23" />
    </Base>
  )
}

export function Person(props: SvgProps) {
  return (
    <Base {...props}>
      <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <Circle cx="12" cy="7" r="4" />
    </Base>
  )
}

export function PersonPlus(props: SvgProps) {
  return (
    <Base {...props}>
      <Path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <Circle cx="8.5" cy="7" r="4" />
      <Line x1="20" y1="8" x2="20" y2="14" />
      <Line x1="23" y1="11" x2="17" y2="11" />
    </Base>
  )
}

export function Envelope(props: SvgProps) {
  return (
    <Base {...props}>
      <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <Polyline points="22,6 12,13 2,6" />
    </Base>
  )
}

export function Lock(props: SvgProps) {
  return (
    <Base {...props}>
      <Rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <Path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </Base>
  )
}

export function ArrowUpRightFromSquare(props: SvgProps) {
  return (
    <Base {...props}>
      <Path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <Polyline points="15 3 21 3 21 9" />
      <Line x1="10" y1="14" x2="21" y2="3" />
    </Base>
  )
}

export function ArrowRightFromSquare(props: SvgProps) {
  return (
    <Base {...props}>
      <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <Polyline points="16 17 21 12 16 7" />
      <Line x1="21" y1="12" x2="9" y2="12" />
    </Base>
  )
}

export function ArrowRightToSquare(props: SvgProps) {
  return (
    <Base {...props}>
      <Path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <Polyline points="10 17 15 12 10 7" />
      <Line x1="15" y1="12" x2="3" y2="12" />
    </Base>
  )
}

export function Gear(props: SvgProps) {
  return (
    <Base {...props}>
      <Circle cx="12" cy="12" r="3" />
      <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </Base>
  )
}

export function ChevronsExpandVertical(props: SvgProps) {
  return (
    <Base {...props}>
      <Polyline points="7 15 12 20 17 15" />
      <Polyline points="7 9 12 4 17 9" />
    </Base>
  )
}

export function Check(props: SvgProps) {
  return (
    <Base {...props}>
      <Polyline points="20 6 9 17 4 12" />
    </Base>
  )
}

export function Copy(props: SvgProps) {
  return (
    <Base {...props}>
      <Rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <Path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </Base>
  )
}
