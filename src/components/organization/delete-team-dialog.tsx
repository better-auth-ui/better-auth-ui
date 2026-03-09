"use client"

import { Loader2, UsersIcon } from "lucide-react"
import { type ComponentProps, useContext, useMemo, useState } from "react"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import { cn, getLocalizedError } from "../../lib/utils"
import type { AuthLocalization } from "../../localization/auth-localization"
import type { Team } from "../../types/auth-hooks"
import type { Refetch } from "../../types/refetch"
import type { SettingsCardClassNames } from "../settings/shared/settings-card"
import { Button } from "../ui/button"
import { Card } from "../ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "../ui/dialog"

interface DeleteTeamDialogProps extends ComponentProps<typeof Dialog> {
    classNames?: SettingsCardClassNames
    team: Team
    localization?: AuthLocalization
    refetch?: Refetch
}

export function DeleteTeamDialog({
    classNames,
    team,
    localization: localizationProp,
    refetch,
    onOpenChange,
    ...props
}: DeleteTeamDialogProps) {
    const {
        authClient,
        localization: contextLocalization,
        toast,
        localizeErrors
    } = useContext(AuthUIContext)

    const localization = useMemo(
        () => ({
            ...contextLocalization,
            ...localizationProp
        }),
        [contextLocalization, localizationProp]
    )

    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        try {
            setIsDeleting(true)
            await authClient.organization.removeTeam({
                teamId: team.id,
                organizationId: team.organizationId,
                fetchOptions: { throw: true }
            })

            toast({
                variant: "success",
                message: localization.DELETE_TEAM_SUCCESS
            })
            await refetch?.()
            onOpenChange?.(false)
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
            setIsDeleting(false)
        }
    }

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
                        {localization.DELETE_TEAM}
                    </DialogTitle>

                    <DialogDescription
                        className={cn(
                            "text-xs md:text-sm",
                            classNames?.description
                        )}
                    >
                        {localization.REMOVE_TEAM_CONFIRM}
                    </DialogDescription>
                </DialogHeader>

                <Card
                    className={cn(
                        "my-2 flex-row items-center gap-3 px-4 py-3",
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
                </Card>

                <DialogFooter className={classNames?.dialog?.footer}>
                    <Button
                        className={cn(
                            classNames?.button,
                            classNames?.secondaryButton
                        )}
                        disabled={isDeleting}
                        onClick={() => onOpenChange?.(false)}
                        type="button"
                        variant="secondary"
                    >
                        {localization.CANCEL}
                    </Button>

                    <Button
                        className={cn(
                            classNames?.button,
                            classNames?.destructiveButton
                        )}
                        disabled={isDeleting}
                        onClick={handleDelete}
                        type="button"
                        variant="destructive"
                    >
                        {isDeleting && <Loader2 className="animate-spin" />}
                        {localization.DELETE}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
