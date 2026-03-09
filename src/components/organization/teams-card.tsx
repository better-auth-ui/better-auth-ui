"use client"
import { useContext, useMemo, useState } from "react"
import { useIsHydrated } from "../../hooks/use-hydrated"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import { cn } from "../../lib/utils"
import type { SettingsCardProps } from "../settings/shared/settings-card"
import { SettingsCard } from "../settings/shared/settings-card"
import { SettingsCellSkeleton } from "../settings/skeletons/settings-cell-skeleton"
import { CardContent } from "../ui/card"
import { CreateTeamDialog } from "./create-team-dialog"
import { TeamCell } from "./team-cell"

/**
 * Render a settings card that lists teams for the current organization and exposes a dialog to create a new team.
 *
 * The component merges provided localization with context localization, fetches teams for the current organization,
 * shows a loading skeleton while data is pending, displays a localized empty message when no teams exist,
 * and renders a TeamCell for each team. It also controls a CreateTeamDialog tied to the current organization.
 *
 * @returns A React element containing the teams settings card and the create-team dialog
 */

export interface TeamsCardProps extends SettingsCardProps {
    organizationId: string
}

export function TeamsCard({
    className,
    classNames,
    localization,
    organizationId,
    ...props
}: TeamsCardProps) {
    const {
        hooks: { useHasPermission, useListTeams },
        localization: contextLocalization
    } = useContext(AuthUIContext)

    localization = useMemo(
        () => ({ ...contextLocalization, ...localization }),
        [contextLocalization, localization]
    )

    const isHydrated = useIsHydrated()
    const [createDialogOpen, setCreateDialogOpen] = useState(false)

    const { data: hasPermissionCreate, isPending: permissionCreatePending } =
        useHasPermission({
            organizationId,
            permissions: {
                team: ["create"]
            }
        })

    const { data: hasPermissionUpdate, isPending: permissionUpdatePending } =
        useHasPermission({
            organizationId,
            permissions: {
                team: ["update"]
            }
        })

    const { data: hasPermissionDelete, isPending: permissionDeletePending } =
        useHasPermission({
            organizationId,
            permissions: {
                team: ["delete"]
            }
        })

    const {
        data: teams,
        isPending: teamsPending,
        refetch
    } = useListTeams({
        organizationId
    })

    const isPending =
        !isHydrated ||
        permissionCreatePending ||
        permissionUpdatePending ||
        permissionDeletePending ||
        teamsPending

    return (
        <>
            <SettingsCard
                action={() => setCreateDialogOpen(true)}
                actionLabel={localization.CREATE_TEAM}
                className={className}
                classNames={classNames}
                description={localization.TEAMS_DESCRIPTION}
                disabled={!hasPermissionCreate?.success}
                instructions={localization.CREATE_TEAM_INSTRUCTIONS}
                isPending={isPending}
                title={localization.TEAMS}
                {...props}
            >
                <CardContent className={cn("grid gap-4", classNames?.content)}>
                    {isPending ? (
                        <SettingsCellSkeleton />
                    ) : teams && teams.length > 0 ? (
                        teams
                            .sort(
                                (a, b) =>
                                    new Date(a.createdAt).getTime() -
                                    new Date(b.createdAt).getTime()
                            )
                            .map((team) => (
                                <TeamCell
                                    canDelete={!!hasPermissionDelete?.success}
                                    canUpdate={!!hasPermissionUpdate?.success}
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

            <CreateTeamDialog
                classNames={classNames}
                localization={localization}
                onOpenChange={setCreateDialogOpen}
                open={createDialogOpen}
                organizationId={organizationId}
                refetch={refetch}
            />
        </>
    )
}
