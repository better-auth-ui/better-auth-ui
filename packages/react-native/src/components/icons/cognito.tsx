import Svg, { Path, type SvgProps } from "react-native-svg"

export function Cognito(props: SvgProps) {
  return (
    <Svg width={24} height={24} viewBox="0 0 48 48" {...props}>
      <Path
        fill="currentColor"
        d="M24 4L6 14v20l18 10 18-10V14L24 4zm0 4.62l13.6 7.86v15.04L24 39.38 10.4 31.52V16.48L24 8.62z"
      />
      <Path fill="currentColor" d="M22 14h4v20h-4zM14 22h20v4H14z" />
    </Svg>
  )
}
