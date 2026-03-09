"use client"
import { useContext } from "react"

import { AuthUIContext } from "../../../lib/auth-ui-provider"
import { cn } from "../../../lib/utils"
import type { AuthLocalization } from "../../../localization/auth-localization"
import { CardContent } from "../../ui/card"
import type { SettingsCardClassNames } from "../shared/settings-card"
import { SettingsCard } from "../shared/settings-card"
import { SettingsCellSkeleton } from "../skeletons/settings-cell-skeleton"
import { UserTeamCell } from "./user-team-cell"

export interface UserTeamsCardProps {
    className?: string
    classNames?: SettingsCardClassNames
    localization?: Partial<AuthLocalization>
}

export function UserTeamsCard({
    className,
    classNames,
    localization
}: UserTeamsCardProps) {
    const {
        hooks: { useListUserTeams },
        localization: contextLocalization
    } = useContext(AuthUIContext)

    localization = { ...contextLocalization, ...localization }

    const { data: teams, isPending, refetch } = useListUserTeams()

    return (
        <SettingsCard
            className={className}
            classNames={classNames}
            description={localization.USER_TEAMS_DESCRIPTION}
            isPending={isPending}
            title={localization.TEAMS}
        >
            <CardContent className={cn("grid gap-4", classNames?.content)}>
                {isPending ? (
                    <SettingsCellSkeleton
                        key="skeleton"
                        classNames={classNames}
                    />
                ) : teams && teams.length > 0 ? (
                    teams
                        .sort(
                            (a, b) =>
                                new Date(a.createdAt).getTime() -
                                new Date(b.createdAt).getTime()
                        )
                        .map((team) => (
                            <UserTeamCell
                                classNames={classNames}
                                key={team.id}
                                localization={localization}
                                refetch={refetch}
                                team={team}
                            />
                        ))
                ) : (
                    <p className="text-muted-foreground text-sm">
                        {localization.NO_TEAMS_FOUND}
                    </p>
                )}
            </CardContent>
        </SettingsCard>
    )
}
