"use client"

import type { Session } from "better-auth"
import { LaptopIcon, Loader2, SmartphoneIcon } from "lucide-react"
import { useContext, useState } from "react"
import { AuthUIContext } from "../../../lib/auth-ui-provider"
import { cn, getLocalizedError } from "../../../lib/utils"
import type { AuthLocalization } from "../../../localization/auth-localization"
import type { Refetch } from "../../../types/refetch"
import { Button } from "../../ui/button"
import { Card } from "../../ui/card"
import type { SettingsCardClassNames } from "../shared/settings-card"

export interface SessionCellProps {
    className?: string
    classNames?: SettingsCardClassNames
    localization?: Partial<AuthLocalization>
    session: Session
    refetch?: Refetch
}

export function SessionCell({
    className,
    classNames,
    localization,
    session,
    refetch
}: SessionCellProps) {
    const {
        basePath,
        hooks: { useSession },
        localization: contextLocalization,
        mutators: { revokeSession },
        viewPaths,
        navigate,
        toast,
        localizeErrors
    } = useContext(AuthUIContext)

    localization = { ...contextLocalization, ...localization }

    const { data: sessionData } = useSession()
    const isCurrentSession = session.id === sessionData?.session?.id

    const [isLoading, setIsLoading] = useState(false)

    const handleRevoke = async () => {
        setIsLoading(true)

        if (isCurrentSession) {
            navigate(`${basePath}/${viewPaths.SIGN_OUT}`)
            return
        }

        try {
            await revokeSession({ token: session.token })
            refetch?.()
        } catch (error) {
            toast({
                variant: "error",
                message: getLocalizedError({
                    error,
                    localization,
                    localizeErrors
                })
            })

            setIsLoading(false)
        }
    }

    const isMobile = /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|webOS|Windows Phone/i.test(session.userAgent || '')

    console.error({isMobile})
    return (
        <Card
            className={cn(
                "flex-row items-center gap-3 px-4 py-3",
                className,
                classNames?.cell
            )}
        >
            {isMobile ? (
                <SmartphoneIcon className={cn("size-4", classNames?.icon)} />
            ) : (
                <LaptopIcon className={cn("size-4", classNames?.icon)} />
            )}

            <div className="flex flex-col">
                <span className="font-semibold text-sm">
                    {isCurrentSession
                        ? localization.CURRENT_SESSION
                        : session?.ipAddress}
                </span>
            </div>

            <Button
                className={cn(
                    "relative ms-auto",
                    classNames?.button,
                    classNames?.outlineButton
                )}
                disabled={isLoading}
                size="sm"
                variant="outline"
                onClick={handleRevoke}
            >
                {isLoading && <Loader2 className="animate-spin" />}
                {isCurrentSession ? localization.SIGN_OUT : localization.REVOKE}
            </Button>
        </Card>
    )
}
