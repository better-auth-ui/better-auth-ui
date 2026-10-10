import Svg, { Path, type SvgProps } from "react-native-svg"

export function Microsoft(props: SvgProps) {
  return (
    <Svg width={24} height={24} viewBox="0 0 256 256" {...props}>
      <Path fill="#f1511b" d="M121.666 121.666H0V0h121.666z"></Path>
      <Path fill="#80cc28" d="M256 121.666H134.335V0H256z"></Path>
      <Path fill="#00adef" d="M121.663 256.002H0V134.336h121.663z"></Path>
      <Path fill="#fbbc09" d="M256 256.002H134.335V134.336H256z"></Path>
    </Svg>
  )
}
