import { useId } from "react"
import Svg, {
  Defs,
  LinearGradient,
  Path,
  Stop,
  type SvgProps
} from "react-native-svg"

export function Atlassian(props: SvgProps) {
  const gradientId = useId()
  return (
    <Svg width={24} height={24} viewBox="0 0 256 256" {...props}>
      <Defs>
        <LinearGradient
          id={gradientId}
          x1="99.687%"
          x2="39.836%"
          y1="15.801%"
          y2="97.438%"
        >
          <Stop offset="0%" stopColor="#0052cc" />
          <Stop offset="92.3%" stopColor="#2684ff" />
        </LinearGradient>
      </Defs>
      <Path
        fill={`url(#${gradientId})`}
        d="M75.793 117.95c-3.82-4.08-9.77-3.85-12.367 1.342L.791 244.565a7.488 7.488 0 0 0 6.697 10.838h87.228a7.22 7.22 0 0 0 6.699-4.14c18.808-38.89 7.413-98.018-25.622-133.314"
      />
      <Path
        fill="#2681ff"
        d="M121.756 4.011c-35.033 55.505-32.721 116.979-9.646 163.13l42.06 84.121a7.49 7.49 0 0 0 6.697 4.14h87.227a7.488 7.488 0 0 0 6.697-10.838S137.445 9.837 134.493 3.964c-2.64-5.258-9.344-5.33-12.737.047"
      />
    </Svg>
  )
}
