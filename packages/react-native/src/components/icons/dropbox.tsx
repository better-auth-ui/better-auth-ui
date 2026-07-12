import Svg, { Path, type SvgProps } from "react-native-svg"

export function Dropbox(props: SvgProps) {
  return (
    <Svg width={24} height={24} viewBox="0 0 256 218" {...props}>
      <Path
        fill="#0061ff"
        d="M63.995 0L0 40.771l63.995 40.772L128 40.771zM192 0l-64 40.775l64 40.775l64.001-40.775zM0 122.321l63.995 40.772L128 122.321L63.995 81.55zM192 81.55l-64 40.775l64 40.774l64-40.774zM64 176.771l64.005 40.772L192 176.771L128.005 136z"
      />
    </Svg>
  )
}
