import { Separator } from "@heroui/react"
import type { ReactNode } from "react"

export function FieldSeparator({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-4">
      <Separator className="flex-1" />

      <p className="text-xs text-muted shrink-0">{children}</p>

      <Separator className="flex-1" />
    </div>
  )
}
