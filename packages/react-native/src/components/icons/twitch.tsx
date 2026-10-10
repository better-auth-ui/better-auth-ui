import Svg, { G, Path, Polygon, Rect, type SvgProps } from "react-native-svg"

export function Twitch(props: SvgProps) {
  return (
    <Svg width={24} height={24} viewBox="0 0 2400 2800" {...props}>
      <G>
        <Polygon
          fill="#FFFFFF"
          points="2200,1300 1800,1700 1400,1700 1050,2050 1050,1700 600,1700 600,200 2200,200"
        />

        <G>
          <G>
            <Path
              fill="#9146FF"
              d="M500,0L0,500v1800h600v500l500-500h400l900-900V0H500z M2200,1300l-400,400h-400l-350,350v-350H600V200h1600V1300z"
            />

            <Rect fill="#9146FF" height="600" width="200" x="1700" y="550" />
            <Rect fill="#9146FF" height="600" width="200" x="1150" y="550" />
          </G>
        </G>
      </G>
    </Svg>
  )
}
