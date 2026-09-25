import Svg, { Path, type SvgProps } from "react-native-svg"

export function Naver(props: SvgProps) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" {...props}>
      <Path
        fill="currentColor"
        d="M16.273 12.845L7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727z"
      />
    </Svg>
  )
}
