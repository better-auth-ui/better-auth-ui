"use client"

import type { OrganizationLocalization } from "@better-auth-ui/core/plugins/organization"
import { Settings2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"

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
    <DropdownMenuTrigger>
      <Button size="sm" variant="outline" isDisabled={disabled}>
        <Settings2 data-icon="inline-start" />
        {localization.columns}
      </Button>
      <DropdownMenu placement="bottom end" aria-label={localization.columns}>
        <DropdownMenuGroup
          selectionMode="multiple"
          selectedKeys={columns
            .filter((column) => column.visible)
            .map((column) => column.id)}
          onSelectionChange={(keys) => {
            for (const column of columns) {
              const visible = keys === "all" || keys.has(column.id)
              if (visible !== column.visible) column.onVisibleChange(visible)
            }
          }}
        >
          {columns.map((column) => (
            <DropdownMenuItem
              key={column.id}
              id={column.id}
              textValue={column.label}
              shouldCloseOnSelect={false}
            >
              {column.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenu>
    </DropdownMenuTrigger>
  )
}
