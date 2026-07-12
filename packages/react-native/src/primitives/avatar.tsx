import {
  createContext,
  type ReactNode,
  useContext,
  useMemo,
  useState
} from "react"
import { Image, Text, View } from "react-native"
import { cn } from "../lib/cn"

export type AvatarSize = "sm" | "md" | "lg"

const SIZE_CLASS: Record<AvatarSize, string> = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12"
}

interface AvatarContextValue {
  loaded: boolean
  setLoaded: (loaded: boolean) => void
}

const AvatarContext = createContext<AvatarContextValue | null>(null)

export interface AvatarProps {
  size?: AvatarSize
  className?: string
  children?: ReactNode
}

function AvatarBase({ size = "sm", className, children }: AvatarProps) {
  const [loaded, setLoaded] = useState(false)
  const context = useMemo(() => ({ loaded, setLoaded }), [loaded])

  return (
    <AvatarContext.Provider value={context}>
      <View
        className={cn(
          "items-center justify-center overflow-hidden rounded-full bg-surface-secondary",
          SIZE_CLASS[size],
          className
        )}
      >
        {children}
      </View>
    </AvatarContext.Provider>
  )
}

function AvatarImage({ src, alt }: { src?: string; alt?: string }) {
  const context = useContext(AvatarContext)
  if (!src) return null

  return (
    <Image
      accessibilityLabel={alt}
      source={{ uri: src }}
      onLoad={() => context?.setLoaded(true)}
      onError={() => context?.setLoaded(false)}
      resizeMode="cover"
      className="absolute inset-0 h-full w-full"
    />
  )
}

function AvatarFallback({
  className,
  children
}: {
  /** Accepted for parity; the image simply overlays the fallback when loaded. */
  delayMs?: number
  className?: string
  children?: ReactNode
}) {
  return (
    <View className={cn("items-center justify-center", className)}>
      {typeof children === "string" ? (
        <Text className="text-sm font-medium text-foreground">{children}</Text>
      ) : (
        children
      )}
    </View>
  )
}

/**
 * Rounded avatar with an image that overlays an initials/icon fallback.
 * `Avatar.Fallback` renders underneath; `Avatar.Image` covers it once loaded.
 */
export const Avatar = Object.assign(AvatarBase, {
  Image: AvatarImage,
  Fallback: AvatarFallback
})
