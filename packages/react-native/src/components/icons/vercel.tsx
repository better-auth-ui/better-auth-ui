import Svg, { Path, type SvgProps } from "react-native-svg"

export function Vercel(props: SvgProps) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" {...props}>
      <Path fill="currentColor" d="M23 21.648H1L12 2.352z" />
    </Svg>
  )
}
