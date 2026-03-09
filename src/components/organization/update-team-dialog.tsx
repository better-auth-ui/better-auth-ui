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
import { Field, FieldLabel } from "../ui/field"
import { Input } from "../ui/input"

interface UpdateTeamDialogProps extends ComponentProps<typeof Dialog> {
    classNames?: SettingsCardClassNames
    team: Team
    localization?: AuthLocalization
    refetch?: Refetch
}

export function UpdateTeamDialog({
    classNames,
    team,
    localization: localizationProp,
    refetch,
    onOpenChange,
    ...props
}: UpdateTeamDialogProps) {
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

    const [isUpdating, setIsUpdating] = useState(false)
    const [name, setName] = useState(team.name)

    const handleUpdate = async () => {
        try {
            setIsUpdating(true)
            await authClient.organization.updateTeam({
                teamId: team.id,
                data: { name },
                fetchOptions: { throw: true }
            })

            toast({
                variant: "success",
                message: localization.UPDATE_TEAM_SUCCESS
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
            setIsUpdating(false)
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
                        {localization.UPDATE_TEAM}
                    </DialogTitle>

                    <DialogDescription
                        className={cn(
                            "text-xs md:text-sm",
                            classNames?.description
                        )}
                    >
                        {localization.UPDATE_TEAM_DESCRIPTION}
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
                <Field className="grid gap-2">
                    <FieldLabel htmlFor="name">
                        {localization.TEAM_NAME}
                    </FieldLabel>
                    <Input
                        id="name"
                        onChange={(e) => setName(e.target.value)}
                        placeholder={localization.TEAM_NAME_PLACEHOLDER}
                        required
                        value={name}
                    />
                </Field>

                <DialogFooter className={classNames?.dialog?.footer}>
                    <Button
                        className={cn(
                            classNames?.button,
                            classNames?.secondaryButton
                        )}
                        disabled={isUpdating}
                        onClick={() => onOpenChange?.(false)}
                        type="button"
                        variant="secondary"
                    >
                        {localization.CANCEL}
                    </Button>

                    <Button
                        className={cn(
                            classNames?.button,
                            classNames?.primaryButton
                        )}
                        disabled={isUpdating || name.trim().length === 0}
                        onClick={handleUpdate}
                        type="button"
                    >
                        {isUpdating && <Loader2 className="animate-spin" />}
                        {localization.UPDATE}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
