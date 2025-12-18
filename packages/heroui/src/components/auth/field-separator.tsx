import { Fieldset, Separator } from "@heroui/react"
import type { ReactNode } from "react"

export function FieldSeparator({ children }: { children: ReactNode }) {
  return (
    <Fieldset.Actions className="gap-4 -my-1">
      <Separator className="flex-1 bg-surface-quaternary" />

      <p className="text-xs text-muted shrink-0">{children}</p>

      <Separator className="flex-1 bg-surface-quaternary" />
    </Fieldset.Actions>
  )
}
