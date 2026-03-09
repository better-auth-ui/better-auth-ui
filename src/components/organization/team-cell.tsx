"use client"

import { Archive, Edit, EllipsisIcon, UsersIcon } from "lucide-react"
import { useState } from "react"
import { cn } from "../../lib/utils"
import type { AuthLocalization } from "../../localization/auth-localization"
import type { Team } from "../../types/auth-hooks"
import type { Refetch } from "../../types/refetch"
import type { SettingsCardClassNames } from "../settings/shared/settings-card"
import { Button } from "../ui/button"
import { Card } from "../ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "../ui/dropdown-menu"
import { DeleteTeamDialog } from "./delete-team-dialog"
import { UpdateTeamDialog } from "./update-team-dialog"

export interface TeamCellProps {
    className?: string
    classNames?: SettingsCardClassNames
    team: Team
    localization?: Partial<AuthLocalization>
    canDelete: boolean
    canUpdate: boolean
    refetch?: Refetch
}

/**
 * Render a single-row team cell with a color-coded circular avatar, the team name, and a localized "Team" label.
 *
 * @param classNames - Optional class name overrides for component parts
 * @param team - Team data object containing at least `id` and `name`
 * @param localization - Localization strings providing `TEAM` label
 * @returns The rendered team cell element
 */
export function TeamCell({
    className,
    classNames,
    team,
    localization,
    canDelete,
    canUpdate,
    refetch
}: TeamCellProps) {
    /*
  const { teams } = useContext(AuthUIContext);
  const colorCount = Math.max(1, teams?.colors.count || 5);

  const getTeamColor = (index: number) => {
    const colorIndex = (index % colorCount) + 1;
    return `hsl(var(--team-${colorIndex}))`;
  };

  // Stable color hash based on team ID (sum of char codes)
  const teamIndex =
    team.id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) %
    colorCount;
  */

    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [showUpdateDialog, setShowUpdateDialog] = useState(false)

    return (
        <>
            <Card
                className={cn(
                    "flex-row items-center gap-3 truncate px-4 py-3",
                    className,
                    classNames?.cell
                )}
            >
                <UsersIcon
                    className={cn("size-5 flex-shrink-0", classNames?.icon)}
                />

                <div className="flex flex-col truncate">
                    <div className="flex items-center gap-2">
                        <span className="truncate font-semibold text-sm">
                            {team.name}
                        </span>
                    </div>

                    <div className="truncate text-muted-foreground text-xs">
                        {localization?.TEAM}
                    </div>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            className={cn(
                                "relative ms-auto",
                                classNames?.button,
                                classNames?.outlineButton
                            )}
                            size="icon"
                            type="button"
                            variant="outline"
                        >
                            <EllipsisIcon className={classNames?.icon} />
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                        onCloseAutoFocus={(e) => e.preventDefault()}
                    >
                        <DropdownMenuItem
                            disabled={!canUpdate}
                            onSelect={() => setShowUpdateDialog(true)}
                        >
                            <Edit className={classNames?.icon} />
                            <span> {localization?.UPDATE_TEAM}</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                            disabled={!canDelete}
                            onClick={() => setShowDeleteDialog(true)}
                            variant="destructive"
                        >
                            <Archive className={classNames?.icon} />
                            <span>{localization?.DELETE_TEAM}</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </Card>

            <UpdateTeamDialog
                classNames={classNames}
                localization={localization}
                onOpenChange={setShowUpdateDialog}
                open={showUpdateDialog}
                refetch={refetch}
                team={team}
            />
            <DeleteTeamDialog
                classNames={classNames}
                localization={localization}
                onOpenChange={setShowDeleteDialog}
                open={showDeleteDialog}
                refetch={refetch}
                team={team}
            />
        </>
    )
}
