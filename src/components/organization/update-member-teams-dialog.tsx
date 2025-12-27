"use client"

import type { User } from "better-auth"
import type { Member } from "better-auth/plugins/organization"
import { type ComponentProps, useContext, useMemo } from "react"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import { cn } from "../../lib/utils"
import type { AuthLocalization } from "../../localization/auth-localization"
import type { SettingsCardClassNames } from "../settings/shared/settings-card"
import { SettingsCellSkeleton } from "../settings/skeletons/settings-cell-skeleton"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "../ui/dialog"
import { MemberCell } from "./member-cell"
import { UpdateMemberTeamCell } from "./update-member-team-cell"

export interface UpdateMemberTeamsDialogProps
    extends ComponentProps<typeof Dialog> {
    classNames?: SettingsCardClassNames
    localization?: AuthLocalization
    member: Member & { user?: Partial<User> | null }
}

export function UpdateMemberTeamsDialog({
    member,
    classNames,
    localization: localizationProp,
    onOpenChange,
    ...props
}: UpdateMemberTeamsDialogProps) {
    const {
        hooks: { useListTeams, useListUserTeams },
        localization: contextLocalization
    } = useContext(AuthUIContext)

    const localization = useMemo(
        () => ({ ...contextLocalization, ...localizationProp }),
        [contextLocalization, localizationProp]
    )

    const {
        data: memberTeams,
        isPending: memberTeamsPending,
        refetch
    } = useListUserTeams()

    function isAdded(teamId: string) {
        return memberTeams?.some((mt) => mt.id === teamId) ?? false
    }

    const { data: orgTeams, isPending: orgTeamsPending } = useListTeams({
        organizationId: member.organizationId
    })

    const isPending = memberTeamsPending || orgTeamsPending

    return (
        <Dialog onOpenChange={onOpenChange} {...props}>
            <DialogContent
                className={classNames?.dialog?.content}
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
                <DialogHeader className={classNames?.dialog?.header}>
                    <DialogTitle
                        className={cn("text-lg md:text-xl", classNames?.title)}
                    >
                        {localization.UPDATE_TEAMS}
                    </DialogTitle>

                    <DialogDescription
                        className={cn(
                            "text-xs md:text-sm",
                            classNames?.description
                        )}
                    >
                        {localization.UPDATE_TEAMS_DESCRIPTION}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <MemberCell
                        className={classNames?.cell}
                        member={member}
                        localization={localization}
                        hideActions
                    />
                    <Card>
                        <CardHeader>
                            <CardTitle>{localization.TEAMS}</CardTitle>
                        </CardHeader>
                        <CardContent
                            className={cn("grid gap-4", classNames?.content)}
                        >
                            {isPending ? (
                                <SettingsCellSkeleton
                                    key="skeleton"
                                    classNames={classNames}
                                />
                            ) : orgTeams && orgTeams.length > 0 ? (
                                orgTeams
                                    .sort(
                                        (a, b) =>
                                            new Date(a.createdAt).getTime() -
                                            new Date(b.createdAt).getTime()
                                    )
                                    .map((team) => (
                                        <UpdateMemberTeamCell
                                            classNames={classNames}
                                            key={team.id}
                                            added={isAdded(team.id)}
                                            userId={member.userId}
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
                    </Card>
                </div>

                <DialogFooter className={classNames?.dialog?.footer}>
                    <Button
                        type="button"
                        onClick={() => onOpenChange?.(false)}
                        className={cn(
                            classNames?.button,
                            classNames?.primaryButton
                        )}
                        disabled={isPending}
                    >
                        {localization.DONE}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
