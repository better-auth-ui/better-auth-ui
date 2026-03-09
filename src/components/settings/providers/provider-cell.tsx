"use client"

import type { Account } from "better-auth"
import type { SocialProvider } from "better-auth/social-providers"
import { Loader2 } from "lucide-react"
import { useContext, useState } from "react"
import { useIsOverflow } from "../../../hooks/use-is-overflow"
import { AuthUIContext } from "../../../lib/auth-ui-provider"
import type { Provider } from "../../../lib/social-providers"
import { cn, getLocalizedError } from "../../../lib/utils"
import type { AuthLocalization } from "../../../localization/auth-localization"
import type { Refetch } from "../../../types/refetch"

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
            <ProviderCellContent
                account={account}
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

function ProviderCellContent({
    account,
    classNames,
    provider
}: {
    account?: Account | null
    classNames?: SettingsCardClassNames
    provider: Provider
}) {
    if (account) {
        return (
            <ConnectedProviderContent
                account={account}
                classNames={classNames}
                provider={provider}
            />
        )
    }

    return (
        <div className="flex min-w-0 flex-1 items-center gap-3">
            <ProviderContent
                classNames={classNames}
                provider={provider}
            />
        </div>
    )
}

function ConnectedProviderContent({
    account,
    classNames,
    provider
}: {
    account: Account
    classNames?: SettingsCardClassNames
    provider: Provider
}) {
    const {
        hooks: { useAccountInfo }
    } = useContext(AuthUIContext)

    const { data: accountInfo, isPending } = useAccountInfo({
        query: { accountId: account.accountId }
    })

    const email = accountInfo?.user.email
    const { ref: emailRef, isOverflow } = useIsOverflow<HTMLSpanElement>()

    const emailElement = isPending ? (
        <Skeleton className="my-0.5 h-3 w-28" />
    ) : email ? (
        <span
            ref={emailRef}
            className="truncate text-muted-foreground text-xs"
        >
            {email}
        </span>
    ) : null

    const content = (
        <ProviderContent
            accountInfo={emailElement}
            classNames={classNames}
            provider={provider}
        />
    )

    const wrapperClassName = "flex min-w-0 flex-1 items-center gap-3"

    if (email && isOverflow) {
        return (
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className={cn(wrapperClassName, "cursor-default")}>
                        {content}
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{email}</p>
                </TooltipContent>
            </Tooltip>
        )
    }

    return (
        <div className={wrapperClassName}>
            {content}
        </div>
    )
}

function ProviderContent({
    accountInfo,
    classNames,
    provider
}: {
    accountInfo?: React.ReactNode
    classNames?: SettingsCardClassNames
    provider: Provider
}) {
    return (
        <>
            {provider.icon && (
                <provider.icon className={cn("size-4 shrink-0", classNames?.icon)} />
            )}

            <div className="flex min-w-0 flex-col">
                <div className="text-sm">{provider.name}</div>
                {accountInfo}
            </div>
        </>
    )
}

