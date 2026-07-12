import Svg, { Path, type SvgProps } from "react-native-svg"

export function Roblox(props: SvgProps) {
  return (
    <Svg width={24} height={24} viewBox="0 0 500 500" {...props}>
      <Path
        fill="#42a5f5"
        d="m127.87 38.084l334.05 89.432l-36.055 135.03l-199.37-53.377l-10.251 38.177l-134.68-36.056zm244.26 423.83L38.08 372.482l36.056-135.03l199.01 53.377l10.251-38.176l135.03 36.055z"
        clipRule="evenodd"
      />
    </Svg>
  )
}
