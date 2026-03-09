"use client"

import { CheckIcon, Loader2, XIcon } from "lucide-react"
import { useCallback, useContext, useEffect, useMemo, useState } from "react"

import { useAuthenticate } from "../../hooks/use-authenticate"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import { cn, getLocalizedError, getSearchParam } from "../../lib/utils"
import type { AuthLocalization } from "../../localization/auth-localization"
import type { SettingsCardClassNames } from "../settings/shared/settings-card"
import { Button } from "../ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "../ui/card"
import { Skeleton } from "../ui/skeleton"
import { OrganizationCellView } from "./organization-cell-view"

export interface AcceptInvitationCardProps {
    className?: string
    classNames?: SettingsCardClassNames
    localization?: Partial<AuthLocalization>
}

export function AcceptInvitationCard({
    className,
    classNames,
    localization: localizationProp
}: AcceptInvitationCardProps) {
    const {
        localization: contextLocalization,
        redirectTo,
        replace,
        toast
    } = useContext(AuthUIContext)

    const localization = useMemo(
        () => ({ ...contextLocalization, ...localizationProp }),
        [contextLocalization, localizationProp]
    )

    const { data: sessionData } = useAuthenticate()
    const [invitationId, setInvitationId] = useState<string | null>(null)

    useEffect(() => {
        const invitationIdParam = getSearchParam("invitationId")

        if (!invitationIdParam) {
            toast({
                variant: "error",
                message: localization.INVITATION_NOT_FOUND
            })

            replace(redirectTo)
            return
        }

        setInvitationId(invitationIdParam)
    }, [localization.INVITATION_NOT_FOUND, toast, replace, redirectTo])

    if (!sessionData || !invitationId) {
        return (
            <AcceptInvitationSkeleton
                className={className}
                classNames={classNames}
            />
        )
    }

    return (
        <AcceptInvitationContent
            className={className}
            classNames={classNames}
            localization={localization}
            invitationId={invitationId}
        />
    )
}

function AcceptInvitationContent({
    className,
    classNames,
    localization: localizationProp,
    invitationId
}: AcceptInvitationCardProps & { invitationId: string }) {
    const {
        authClient,
        hooks: { useInvitation },
        localization: contextLocalization,
        organization,
        redirectTo,
        replace,
        toast,
        localizeErrors
    } = useContext(AuthUIContext)

    const localization = useMemo(
        () => ({ ...contextLocalization, ...localizationProp }),
        [contextLocalization, localizationProp]
    )

    const [isRejecting, setIsRejecting] = useState(false)
    const [isAccepting, setIsAccepting] = useState(false)
    const isProcessing = isRejecting || isAccepting

    const { data: invitation, isPending } = useInvitation({
        query: {
            id: invitationId
        }
    })

    const getRedirectTo = useCallback(
        () => getSearchParam("redirectTo") || redirectTo,
        [redirectTo]
    )

    useEffect(() => {
        if (isPending || !invitationId) return

        if (!invitation) {
            toast({
                variant: "error",
                message: localization.INVITATION_NOT_FOUND
            })

            replace(redirectTo)
            return
        }

        if (
            invitation.status !== "pending" ||
            new Date(invitation.expiresAt) < new Date()
        ) {
            toast({
                variant: "error",
                message:
                    new Date(invitation.expiresAt) < new Date()
                        ? localization.INVITATION_EXPIRED
                        : localization.INVITATION_NOT_FOUND
            })

            replace(redirectTo)
        }
    }, [
        invitation,
        isPending,
        invitationId,
        localization,
        toast,
        replace,
        redirectTo
    ])

    const acceptInvitation = async () => {
        setIsAccepting(true)

        try {
            await authClient.organization.acceptInvitation({
                invitationId: invitationId,
                fetchOptions: { throw: true }
            })

            toast({
                variant: "success",
                message:
                    localization.INVITATION_ACCEPTED || "Invitation accepted"
            })

            replace(getRedirectTo())
        } catch (error) {
            toast({
                variant: "error",
                message: getLocalizedError({
                    error,
                    localization,
                    localizeErrors
                })
            })

            setIsAccepting(false)
        }
    }

    const rejectInvitation = async () => {
        setIsRejecting(true)

        try {
            await authClient.organization.rejectInvitation({
                invitationId: invitationId,
                fetchOptions: { throw: true }
            })

            toast({
                variant: "success",
                message: localization.INVITATION_REJECTED
            })

            replace(redirectTo)
        } catch (error) {
            toast({
                variant: "error",
                message: getLocalizedError({
                    error,
                    localization,
                    localizeErrors
                })
            })

            setIsRejecting(false)
        }
    }

    const builtInRoles = [
        { role: "owner", label: localization.OWNER },
        { role: "admin", label: localization.ADMIN },
        { role: "member", label: localization.MEMBER }
    ]

    const roles = [...builtInRoles, ...(organization?.customRoles || [])]
    const roleLabel =
        roles.find((r) => r.role === invitation?.role)?.label ||
        invitation?.role

    if (!invitation)
        return (
            <AcceptInvitationSkeleton
                className={className}
                classNames={classNames}
            />
        )

    return (
        <Card className={cn("w-full max-w-sm", className, classNames?.base)}>
            <CardHeader
                className={cn(
                    "justify-items-center text-center",
                    classNames?.header
                )}
            >
                <CardTitle
                    className={cn("text-lg md:text-xl", classNames?.title)}
                >
                    {localization.ACCEPT_INVITATION}
                </CardTitle>

                <CardDescription
                    className={cn(
                        "text-xs md:text-sm",
                        classNames?.description
                    )}
                >
                    {localization.ACCEPT_INVITATION_DESCRIPTION}
                </CardDescription>
            </CardHeader>

            <CardContent
                className={cn(
                    "flex flex-col gap-6 truncate",
                    classNames?.content
                )}
            >
                <Card className={cn("flex-row items-center p-4")}>
                    <OrganizationCellView
                        organization={{
                            id: invitation.organizationId,
                            name: invitation.organizationName,
                            slug: invitation.organizationSlug,
                            logo: invitation.organizationLogo,
                            createdAt: new Date()
                        }}
                        localization={localization}
                    />

                    <p className="ml-auto text-muted-foreground text-sm">
                        {roleLabel}
                    </p>
                </Card>

                <div className="grid grid-cols-2 gap-3">
                    <Button
                        variant="outline"
                        className={cn(
                            classNames?.button,
                            classNames?.outlineButton
                        )}
                        onClick={rejectInvitation}
                        disabled={isProcessing}
                    >
                        {isRejecting ? (
                            <Loader2 className="animate-spin" />
                        ) : (
                            <XIcon />
                        )}

                        {localization.REJECT}
                    </Button>

                    <Button
                        className={cn(
                            classNames?.button,
                            classNames?.primaryButton
                        )}
                        onClick={acceptInvitation}
                        disabled={isProcessing}
                    >
                        {isAccepting ? (
                            <Loader2 className="animate-spin" />
                        ) : (
                            <CheckIcon />
                        )}

                        {localization.ACCEPT}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

const AcceptInvitationSkeleton = ({
    className,
    classNames,
    localization
}: AcceptInvitationCardProps) => {
    return (
        <Card className={cn("w-full max-w-sm", className, classNames?.base)}>
            <CardHeader
                className={cn("justify-items-center", classNames?.header)}
            >
                <Skeleton
                    className={cn(
                        "my-1 h-5 w-full max-w-32 md:h-5.5 md:w-40",
                        classNames?.skeleton
                    )}
                />

                <Skeleton
                    className={cn(
                        "my-0.5 h-3 w-full max-w-56 md:h-3.5 md:w-64",
                        classNames?.skeleton
                    )}
                />
            </CardHeader>

            <CardContent
                className={cn(
                    "flex flex-col gap-6 truncate",
                    classNames?.content
                )}
            >
                <Card className={cn("flex-row items-center p-4")}>
                    <OrganizationCellView
                        isPending
                        localization={localization}
                    />

                    <Skeleton className="mt-0.5 ml-auto h-4 w-full max-w-14 shrink-2" />
                </Card>

                <div className="grid grid-cols-2 gap-3">
                    <Skeleton className="h-9 w-full" />

                    <Skeleton className="h-9 w-full" />
                </div>
            </CardContent>
        </Card>
    )
}
