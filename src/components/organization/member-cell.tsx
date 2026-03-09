"use client"

import type { User } from "better-auth"
import type { Member } from "better-auth/plugins/organization"
import { EllipsisIcon, UserCogIcon, Users, UserXIcon } from "lucide-react"
import { useContext, useState } from "react"

import { AuthUIContext } from "../../lib/auth-ui-provider"
import { cn } from "../../lib/utils"
import type { AuthLocalization } from "../../localization/auth-localization"
import type { SettingsCardClassNames } from "../settings/shared/settings-card"
import { Button } from "../ui/button"
import { Card } from "../ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "../ui/dropdown-menu"
import { UserView } from "../user-view"
import { LeaveOrganizationDialog } from "./leave-organization-dialog"
import { RemoveMemberDialog } from "./remove-member-dialog"
import { UpdateMemberRoleDialog } from "./update-member-role-dialog"
import { UpdateMemberTeamsDialog } from "./update-member-teams-dialog"

export interface MemberCellProps {
    className?: string
    classNames?: SettingsCardClassNames
    member: Member & { user?: Partial<User> | null }
    localization?: AuthLocalization
    hideActions?: boolean
}

export function MemberCell({
    className,
    classNames,
    member,
    localization: localizationProp,
    hideActions
}: MemberCellProps) {
    const {
        teams: teamOptions,
        organization: organizationOptions,
        hooks: {
            useListMembers,
            useSession,
            useListOrganizations,
            useHasPermission
        },
        localization: contextLocalization
    } = useContext(AuthUIContext)
    const { enabled: teamsEnabled } = teamOptions || {}
    const localization = { ...contextLocalization, ...localizationProp }

    const { data: sessionData } = useSession()
    const [removeDialogOpen, setRemoveDialogOpen] = useState(false)
    const [leaveDialogOpen, setLeaveDialogOpen] = useState(false)
    const [updateRoleDialogOpen, setUpdateRoleDialogOpen] = useState(false)
    const [updateTeamsDialogOpen, setUpdateTeamsDialogOpen] = useState(false)

    const builtInRoles = [
        { role: "owner", label: localization.OWNER },
        { role: "admin", label: localization.ADMIN },
        { role: "member", label: localization.MEMBER }
    ]

    const { data } = useListMembers({
        query: { organizationId: member.organizationId }
    })

    const members = data?.members

    const myRole = members?.find(
        (m) => m.user?.id === sessionData?.user.id
    )?.role
    const roles = [...builtInRoles, ...(organizationOptions?.customRoles || [])]
    const role = roles.find((r) => r.role === member.role)

    const isSelf = sessionData?.user.id === member?.userId

    const { data: organizations } = useListOrganizations()
    const organization = organizations?.find(
        (org) => org.id === member.organizationId
    )

    const { data: hasPermissionToUpdateMember } = useHasPermission({
        organizationId: member.organizationId,
        permission: { member: ["update"] }
    })

    return (
        <>
            <Card
                className={cn(
                    "flex-row items-center p-4",
                    className,
                    classNames?.cell
                )}
            >
                <UserView
                    user={member.user}
                    localization={localization}
                    className="flex-1"
                />

                <span className="text-xs opacity-70">{role?.label}</span>

                {!hideActions &&
                    (isSelf ||
                        member.role !== "owner" ||
                        myRole === "owner") && (
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
                                    <EllipsisIcon
                                        className={classNames?.icon}
                                    />
                                </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent
                                onCloseAutoFocus={(e) => e.preventDefault()}
                            >
                                {hasPermissionToUpdateMember?.success && (
                                    <>
                                        <DropdownMenuItem
                                            onClick={() =>
                                                setUpdateRoleDialogOpen(true)
                                            }
                                        >
                                            <UserCogIcon
                                                className={classNames?.icon}
                                            />
                                            {localization?.UPDATE_ROLE}
                                        </DropdownMenuItem>
                                        {teamsEnabled && (
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    setUpdateTeamsDialogOpen(
                                                        true
                                                    )
                                                }
                                            >
                                                <Users
                                                    className={classNames?.icon}
                                                />
                                                {localization?.UPDATE_TEAMS}
                                            </DropdownMenuItem>
                                        )}
                                    </>
                                )}

                                <DropdownMenuItem
                                    onClick={() =>
                                        isSelf
                                            ? setLeaveDialogOpen(true)
                                            : setRemoveDialogOpen(true)
                                    }
                                    variant="destructive"
                                >
                                    <UserXIcon className={classNames?.icon} />
                                    {isSelf
                                        ? localization?.LEAVE_ORGANIZATION
                                        : localization?.REMOVE_MEMBER}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
            </Card>

            <RemoveMemberDialog
                open={removeDialogOpen}
                onOpenChange={setRemoveDialogOpen}
                member={member}
                classNames={classNames}
                localization={localization}
            />

            {organization && (
                <LeaveOrganizationDialog
                    open={leaveDialogOpen}
                    onOpenChange={setLeaveDialogOpen}
                    organization={organization}
                    classNames={classNames}
                    localization={localization}
                />
            )}

            <UpdateMemberRoleDialog
                open={updateRoleDialogOpen}
                onOpenChange={setUpdateRoleDialogOpen}
                member={member}
                classNames={classNames}
                localization={localization}
            />
            {teamsEnabled && (
                <UpdateMemberTeamsDialog
                    open={updateTeamsDialogOpen}
                    onOpenChange={setUpdateTeamsDialogOpen}
                    member={member}
                    classNames={classNames}
                    localization={localization}
                />
            )}
        </>
    )
}
