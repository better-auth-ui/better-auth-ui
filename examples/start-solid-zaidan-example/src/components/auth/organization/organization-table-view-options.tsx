import type { OrganizationLocalization } from "@better-auth-ui/core/plugins/organization"
import { Settings2 } from "lucide-solid"
import { For } from "solid-js"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"

export type OrganizationTableViewColumn = {
  id: string
  label: string
  visible: boolean
  onVisibleChange: (visible: boolean) => void
}

export function OrganizationTableViewOptions(props: {
  columns: OrganizationTableViewColumn[]
  disabled?: boolean
  localization: Pick<OrganizationLocalization, "columns">
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        as={Button}
        class="shrink-0"
        disabled={props.disabled}
        size="sm"
        variant="outline"
      >
        <Settings2 />
        {props.localization.columns}
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <For each={props.columns}>
          {(column) => (
            <DropdownMenuCheckboxItem
              checked={column.visible}
              onChange={column.onVisibleChange}
            >
              {column.label}
            </DropdownMenuCheckboxItem>
          )}
        </For>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
