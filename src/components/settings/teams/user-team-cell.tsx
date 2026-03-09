"use client"

import type { Team } from "better-auth/plugins"
import { Loader2, UsersIcon } from "lucide-react"
import { useContext, useState } from "react"
import { AuthUIContext } from "../../../lib/auth-ui-provider"
import { cn, getLocalizedError } from "../../../lib/utils"
import type { AuthLocalization } from "../../../localization/auth-localization"
import type { Refetch } from "../../../types/refetch"
import { Button } from "../../ui/button"
import { Card } from "../../ui/card"
import type { SettingsCardClassNames } from "../shared/settings-card"

export interface UserTeamCellProps {
    className?: string
    classNames?: SettingsCardClassNames
    localization?: Partial<AuthLocalization>
    team: Team
    refetch?: Refetch
}

export function UserTeamCell({
    className,
    classNames,
    team,
    localization,
    refetch
}: UserTeamCellProps) {
    const {
        authClient,
        hooks: { useSession },
        localization: contextLocalization,
        toast,
        localizeErrors
    } = useContext(AuthUIContext)

    localization = { ...contextLocalization, ...localization }

    const { data: sessionData, refetch: refetchSession } = useSession()
    // @ts-expect-error
    const isCurrentTeam = team.id === sessionData?.session?.activeTeamId

    const [isUpdating, setIsUpdating] = useState(false)

    const handleSetActiveTeam = async () => {
        try {
            setIsUpdating(true)
            await authClient.organization.setActiveTeam({
                teamId: team.id,
                fetchOptions: { throw: true }
            })
            toast({
                variant: "success",
                message: localization.UPDATE_TEAM_SUCCESS
            })
            await refetchSession?.()
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
                disabled={isCurrentTeam || isUpdating}
                size="sm"
                variant="outline"
                onClick={handleSetActiveTeam}
            >
                {isUpdating && <Loader2 className="animate-spin" />}
                {isCurrentTeam
                    ? localization.TEAM_ACTIVE
                    : localization.TEAM_SET_ACTIVE}
            </Button>
        </Card>
    )
}
