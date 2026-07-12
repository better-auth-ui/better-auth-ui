import { useEffect, useState } from "react"
import { Text, View } from "react-native"
import { cn } from "../lib/cn"

export type ToastType = "success" | "danger"

interface ToastItem {
  id: number
  type: ToastType
  message: string
}

type Listener = (item: ToastItem) => void

const listeners = new Set<Listener>()
let counter = 0

function emit(type: ToastType, message: string) {
  counter += 1
  const item: ToastItem = { id: counter, type, message }
  for (const listener of listeners) listener(item)
}

/**
 * Imperative toast singleton with `.success` / `.danger`. Callable from outside
 * React render (the `ErrorToaster` invokes it from react-query cache config),
 * mirroring heroui's `toast`. Requires a mounted `<ToastHost/>` (installed by
 * `AuthProvider`) to display anything.
 */
export const toast = {
  success: (message: string) => emit("success", message),
  danger: (message: string) => emit("danger", message)
}

const TOAST_DURATION_MS = 4000

/**
 * Renders active toasts as a bottom overlay. Mounted once by `AuthProvider`.
 */
export function ToastHost() {
  const [items, setItems] = useState<ToastItem[]>([])

  useEffect(() => {
    const listener: Listener = (item) => {
      setItems((prev) => [...prev, item])
      setTimeout(() => {
        setItems((prev) => prev.filter((existing) => existing.id !== item.id))
      }, TOAST_DURATION_MS)
    }
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }, [])

  if (!items.length) return null

  return (
    <View
      pointerEvents="box-none"
      className="absolute inset-x-0 bottom-10 items-center gap-2 px-4"
    >
      {items.map((item) => (
        <View
          key={item.id}
          className={cn(
            "max-w-sm rounded-xl px-4 py-3 shadow-lg",
            item.type === "success" ? "bg-green-600" : "bg-red-600"
          )}
        >
          <Text className="text-center text-sm font-medium text-white">
            {item.message}
          </Text>
        </View>
      ))}
    </View>
  )
}
