"use client"

import type { Passkey } from "@better-auth/passkey"
import { FingerprintIcon, Loader2 } from "lucide-react"
import { useContext, useState } from "react"

import { AuthUIContext } from "../../../lib/auth-ui-provider"
import { cn, getLocalizedError } from "../../../lib/utils"
import type { AuthLocalization } from "../../../localization/auth-localization"
import { Button } from "../../ui/button"
import { Card } from "../../ui/card"
import { SessionFreshnessDialog } from "../shared/session-freshness-dialog"
import type { SettingsCardClassNames } from "../shared/settings-card"

export interface PasskeyCellProps {
    className?: string
    classNames?: SettingsCardClassNames
    localization?: Partial<AuthLocalization>
    passkey: Passkey
}

export function PasskeyCell({
    className,
    classNames,
    localization,
    passkey
}: PasskeyCellProps) {
    const {
        freshAge,
        hooks: { useSession, useListPasskeys },
        localization: contextLocalization,
        mutators: { deletePasskey },
        toast,
        localizeErrors
    } = useContext(AuthUIContext)

    localization = { ...contextLocalization, ...localization }

    const { refetch } = useListPasskeys()

    const { data: sessionData } = useSession()
    const session = sessionData?.session
    const isFresh = session
        ? Date.now() - new Date(session?.createdAt).getTime() < freshAge * 1000
        : false

    const [showFreshnessDialog, setShowFreshnessDialog] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleDeletePasskey = async () => {
        // If session isn't fresh, show the freshness dialog
        if (!isFresh) {
            setShowFreshnessDialog(true)
            return
        }

        setIsLoading(true)

        try {
            await deletePasskey({ id: passkey.id })
            refetch?.()
        } catch (error) {
            setIsLoading(false)

            toast({
                variant: "error",
                message: getLocalizedError({
                    error,
                    localization,
                    localizeErrors
                })
            })
        }
    }

    return (
        <>
            <SessionFreshnessDialog
                open={showFreshnessDialog}
                onOpenChange={setShowFreshnessDialog}
                classNames={classNames}
                localization={localization}
            />

            <Card
                className={cn(
                    "flex-row items-center p-4",
                    className,
                    classNames?.cell
                )}
            >
                <div className="flex items-center gap-3">
                    <FingerprintIcon
                        className={cn("size-4", classNames?.icon)}
                    />
                    <span className="text-sm">
                        {new Date(passkey.createdAt).toLocaleString()}
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
                    onClick={handleDeletePasskey}
                >
                    {isLoading && <Loader2 className="animate-spin" />}

                    {localization.DELETE}
                </Button>
            </Card>
        </>
    )
}
