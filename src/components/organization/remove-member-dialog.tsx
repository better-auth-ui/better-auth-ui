"use client"

import type { User } from "better-auth"
import type { Member } from "better-auth/plugins/organization"
import { Loader2 } from "lucide-react"
import { type ComponentProps, useContext, useMemo, useState } from "react"

import { AuthUIContext } from "../../lib/auth-ui-provider"
import { cn, getLocalizedError } from "../../lib/utils"
import type { AuthLocalization } from "../../localization/auth-localization"
import type { SettingsCardClassNames } from "../settings/shared/settings-card"
import { Button } from "../ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "../ui/dialog"
import { MemberCell } from "./member-cell"

export interface RemoveMemberDialogProps extends ComponentProps<typeof Dialog> {
    classNames?: SettingsCardClassNames
    localization?: AuthLocalization
    member: Member & { user?: Partial<User> | null }
}

export function RemoveMemberDialog({
    member,
    classNames,
    localization: localizationProp,
    onOpenChange,
    ...props
}: RemoveMemberDialogProps) {
    const {
        authClient,
        hooks: { useListMembers },
        localization: contextLocalization,
        toast,
        localizeErrors
    } = useContext(AuthUIContext)

    const localization = useMemo(
        () => ({ ...contextLocalization, ...localizationProp }),
        [contextLocalization, localizationProp]
    )

    const { refetch } = useListMembers({
        query: { organizationId: member.organizationId }
    })

    const [isRemoving, setIsRemoving] = useState(false)

    const removeMember = async () => {
        setIsRemoving(true)

        try {
            await authClient.organization.removeMember({
                memberIdOrEmail: member.id,
                organizationId: member.organizationId,
                fetchOptions: { throw: true }
            })

            toast({
                variant: "success",
                message: localization.REMOVE_MEMBER_SUCCESS
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
        }

        setIsRemoving(false)
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
                        {localization.REMOVE_MEMBER}
                    </DialogTitle>

                    <DialogDescription
                        className={cn(
                            "text-xs md:text-sm",
                            classNames?.description
                        )}
                    >
                        {localization.REMOVE_MEMBER_CONFIRM}
                    </DialogDescription>
                </DialogHeader>

                <MemberCell
                    className={classNames?.cell}
                    member={member}
                    localization={localization}
                    hideActions
                />

                <DialogFooter className={classNames?.dialog?.footer}>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange?.(false)}
                        className={cn(
                            classNames?.button,
                            classNames?.outlineButton
                        )}
                        disabled={isRemoving}
                    >
                        {localization.CANCEL}
                    </Button>

                    <Button
                        type="button"
                        variant="destructive"
                        onClick={removeMember}
                        className={cn(
                            classNames?.button,
                            classNames?.destructiveButton
                        )}
                        disabled={isRemoving}
                    >
                        {isRemoving && <Loader2 className="animate-spin" />}

                        {localization.REMOVE_MEMBER}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
