"use client"

import type { Team } from "better-auth/plugins"
import { Loader2, UsersIcon } from "lucide-react"
import { useContext, useState } from "react"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import { cn, getLocalizedError } from "../../lib/utils"
import type { AuthLocalization } from "../../localization/auth-localization"
import { authClient } from "../../types/auth-client"
import type { Refetch } from "../../types/refetch"
import type { SettingsCardClassNames } from "../settings/shared/settings-card"
import { Button } from "../ui/button"
import { Card } from "../ui/card"

export interface UpdateMemberTeamCellProps {
    className?: string
    classNames?: SettingsCardClassNames
    localization?: Partial<AuthLocalization>
    userId: string
    team: Team
    added: boolean
    refetch?: Refetch
}

export function UpdateMemberTeamCell({
    className,
    classNames,
    userId,
    team,
    added,
    localization,
    refetch
}: UpdateMemberTeamCellProps) {
    const {
        localization: contextLocalization,
        toast,
        localizeErrors
    } = useContext(AuthUIContext)
    console.log({ userId, team, added })

    localization = { ...contextLocalization, ...localization }

    const [isUpdating, setIsUpdating] = useState(false)

    const handleAddRemoveTeam = async () => {
        try {
            setIsUpdating(true)
            if (added) {
                await authClient.organization.removeTeamMember({
                    teamId: team.id,
                    userId: userId,
                    fetchOptions: { throw: true }
                })
                toast({
                    variant: "success",
                    message: localization.REMOVE_TEAM_MEMBER_SUCCESS
                })
            } else {
                await authClient.organization.addTeamMember({
                    teamId: team.id,
                    userId: userId,
                    fetchOptions: { throw: true }
                })
                toast({
                    variant: "success",
                    message: localization.ADD_TEAM_MEMBER_SUCCESS
                })
            }
            await refetch?.()
        } catch (error) {
            toast({
                variant: "error",
                message: getLocalizedError({
                    error,
                    localization,
                    localizeErrors
                })
            })
        } finally {
            setIsUpdating(false)
        }
    }

    return (
        <Card
            className={cn(
                "flex-row items-center gap-3 px-4 py-3",
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

            <Button
                className={cn(
                    "relative ms-auto",
                    classNames?.button,
                    classNames?.outlineButton
                )}
                disabled={isUpdating}
                size="sm"
                variant="outline"
                onClick={handleAddRemoveTeam}
            >
                {isUpdating && <Loader2 className="animate-spin" />}
                {added ? localization.REMOVE : localization.ADD}
            </Button>
        </Card>
    )
}
