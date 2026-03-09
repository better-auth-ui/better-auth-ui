"use client"

import type { Organization } from "better-auth/plugins/organization"
import { type ReactNode, useContext, useMemo } from "react"
import { useCurrentOrganization } from "../../hooks/use-current-organization"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import { cn } from "../../lib/utils"
import type { SettingsCardProps } from "../settings/shared/settings-card"
import { SettingsCard } from "../settings/shared/settings-card"
import { CardContent } from "../ui/card"
import { InvitationCell } from "./invitation-cell"

export interface OrganizationInvitationsCardProps extends SettingsCardProps {
    slug?: string
    emptyState?: ReactNode
}

export function OrganizationInvitationsCard({
    className,
    classNames,
    localization: localizationProp,
    slug: slugProp,
    emptyState,
    ...props
}: OrganizationInvitationsCardProps) {
    const {
        localization: contextLocalization,
        organization: organizationOptions
    } = useContext(AuthUIContext)

    const localization = useMemo(
        () => ({ ...contextLocalization, ...localizationProp }),
        [contextLocalization, localizationProp]
    )

    const slug = slugProp || organizationOptions?.slug

    const { data: organization } = useCurrentOrganization({ slug })

    if (!organization) return null

    return (
        <OrganizationInvitationsContent
            className={className}
            classNames={classNames}
            localization={localization}
            organization={organization}
            {...props}
        />
    )
}

function OrganizationInvitationsContent({
    className,
    classNames,
    localization: localizationProp,
    organization,
    emptyState,
    ...props
}: SettingsCardProps & { organization: Organization; emptyState?: ReactNode }) {
    const {
        hooks: { useListInvitations },
        localization: contextLocalization
    } = useContext(AuthUIContext)

    const localization = useMemo(
        () => ({ ...contextLocalization, ...localizationProp }),
        [contextLocalization, localizationProp]
    )

    const { data: invitations } = useListInvitations({
        query: { organizationId: organization.id }
    })

    const pendingInvitations = invitations?.filter(
        (invitation) => invitation.status === "pending"
    )
    if (!pendingInvitations?.length) return <>{emptyState}</>

    return (
        <SettingsCard
            className={className}
            classNames={classNames}
            title={localization.PENDING_INVITATIONS}
            description={localization.PENDING_INVITATIONS_DESCRIPTION}
            {...props}
        >
            <CardContent className={cn("grid gap-4", classNames?.content)}>
                {pendingInvitations.map((invitation) => (
                    <InvitationCell
                        key={invitation.id}
                        classNames={classNames}
                        invitation={invitation}
                        localization={localization}
                        organization={organization}
                    />
                ))}
            </CardContent>
        </SettingsCard>
    )
}
