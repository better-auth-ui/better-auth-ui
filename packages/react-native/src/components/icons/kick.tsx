import Svg, { Path, type SvgProps } from "react-native-svg"

export function Kick(props: SvgProps) {
  return (
    <Svg
      width={24}
      height={24}
      viewBox="0 0 512 512"
      fillRule="evenodd"
      clipRule="evenodd"
      strokeLinejoin="round"
      strokeMiterlimit={2}
      {...props}
    >
      <Path
        d="M37 .036h164.448v113.621h54.71v-56.82h54.731V.036h164.448v170.777h-54.73v56.82h-54.711v56.8h54.71v56.82h54.73V512.03H310.89v-56.82h-54.73v-56.8h-54.711v113.62H37V.036z"
        fill="#00E701"
      />
    </Svg>
  )
}
