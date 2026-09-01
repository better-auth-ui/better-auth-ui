"use client"

import type { OrganizationLocalization } from "@better-auth-ui/core/plugins/organization"
import { Settings2 } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export type OrganizationTableViewColumn = {
  id: string
  label: string
  visible: boolean
  onVisibleChange: (visible: boolean) => void
}

export function OrganizationTableViewOptions({
  columns,
  disabled,
  localization
}: {
  columns: OrganizationTableViewColumn[]
  disabled?: boolean
  localization: OrganizationLocalization
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
        disabled={disabled}
      >
        <Settings2 data-icon="inline-start" />
        {localization.columns}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          {columns.map((column) => (
            <DropdownMenuCheckboxItem
              checked={column.visible}
              key={column.id}
              onCheckedChange={(checked) =>
                column.onVisibleChange(checked === true)
              }
            >
              {column.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
