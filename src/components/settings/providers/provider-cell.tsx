"use client"

import type { Account } from "better-auth"
import type { SocialProvider } from "better-auth/social-providers"
import { Loader2 } from "lucide-react"
import { useContext, useState } from "react"
import { AuthUIContext } from "../../../lib/auth-ui-provider"
import type { Provider } from "../../../lib/social-providers"
import { cn, getLocalizedError } from "../../../lib/utils"
import type { AuthLocalization } from "../../../localization/auth-localization"
import type { Refetch } from "../../../types/refetch"
import type { AuthHooks } from "../../../types/auth-hooks"
import { useIsMobile } from "../../../hooks/use-mobile"
import { Button } from "../../ui/button"
import { Card } from "../../ui/card"
import { Skeleton } from "../../ui/skeleton"
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip"
import type { SettingsCardClassNames } from "../shared/settings-card"

export interface ProviderCellProps {
    className?: string
    classNames?: SettingsCardClassNames
    account?: Account | null
    isPending?: boolean
    localization?: Partial<AuthLocalization>
    other?: boolean
    provider: Provider
    refetch?: Refetch
}

export function ProviderCell({
    className,
    classNames,
    account,
    localization,
    other,
    provider,
    refetch
}: ProviderCellProps) {
    const {
        authClient,
        basePath,
        baseURL,
        localization: contextLocalization,
        mutators: { unlinkAccount },
        viewPaths,
        toast,
        localizeErrors
    } = useContext(AuthUIContext)

    localization = { ...contextLocalization, ...localization }

    const [isLoading, setIsLoading] = useState(false)
    const isMobile = useIsMobile()

    const handleLink = async () => {
        setIsLoading(true)
        const callbackURL = `${baseURL}${basePath}/${viewPaths.CALLBACK}?redirectTo=${encodeURIComponent(window.location.pathname)}`

        try {
            if (other) {
                await authClient.oauth2.link({
                    providerId: provider.provider as SocialProvider,
                    callbackURL,
                    fetchOptions: { throw: true }
                })
            } else {
                await authClient.linkSocial({
                    provider: provider.provider as SocialProvider,
                    callbackURL,
                    fetchOptions: { throw: true }
                })
            }
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

    const handleUnlink = async () => {
        setIsLoading(true)

        try {
            await unlinkAccount({
                accountId: account?.accountId,
                providerId: provider.provider
            })

            await refetch?.()
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

        setIsLoading(false)
    }

    return (
        <Card
            className={cn(
                "min-w-0 flex-row items-center gap-3 px-4 py-3",
                className,
                classNames?.cell
            )}
        >
            <CardContentWithTooltip
                account={account}
                isMobile={isMobile}
                provider={provider}
                classNames={classNames}
            />

            <Button
                className={cn("relative ms-auto shrink-0", classNames?.button)}
                disabled={isLoading}
                size="sm"
                type="button"
                variant={account ? "outline" : "default"}
                onClick={account ? handleUnlink : handleLink}
            >
                {isLoading && <Loader2 className="animate-spin" />}
                {account ? localization.UNLINK : localization.LINK}
            </Button>
        </Card>
    )
}

function CardContentWithTooltip({
    account,
    isMobile,
    provider,
    classNames
}: {
    account?: Account | null
    isMobile: boolean
    provider: Provider
    classNames?: SettingsCardClassNames
}) {
    const {
        hooks: { useAccountInfo }
    } = useContext(AuthUIContext)

    const accountInfoData = account
        ? useAccountInfo({
              query: { accountId: account.accountId }
          })
        : null

    const email = account ? (
        <AccountInfo account={account} accountInfo={accountInfoData} />
    ) : null
    const emailText = accountInfoData?.data?.user.email || null

    const content = (
        <>
            {provider.icon && (
                <provider.icon className={cn("size-4 shrink-0", classNames?.icon)} />
            )}

            <div className="min-w-0 flex-col">
                <div className="text-sm">{provider.name}</div>
                {email}
            </div>
        </>
    )

    if (isMobile && emailText) {
        return (
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                        {content}
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    {emailText}
                </TooltipContent>
            </Tooltip>
        )
    }

    return (
        <div className="flex min-w-0 flex-1 items-center gap-3">
            {content}
        </div>
    )
}

function AccountInfo({
    account,
    accountInfo: accountInfoProp
}: {
    account: { accountId: string }
    accountInfo?: ReturnType<AuthHooks["useAccountInfo"]> | null
}) {
    const {
        hooks: { useAccountInfo }
    } = useContext(AuthUIContext)

    const accountInfoData = accountInfoProp ?? useAccountInfo({
        query: { accountId: account.accountId }
    })

    const { data: accountInfo, isPending } = accountInfoData

    if (isPending) {
        return <Skeleton className="my-0.5 h-3 w-28" />
    }

    if (!accountInfo) return null

    const email = accountInfo?.user.email
    if (!email) return null

    return (
        <div className="truncate text-muted-foreground text-xs">
            {email}
        </div>
    )
}

