"use client"

import type { Account } from "better-auth"
import { useContext } from "react"
import { AuthUIContext } from "../../../lib/auth-ui-provider"
import { socialProviders } from "../../../lib/social-providers"
import { cn } from "../../../lib/utils"
import type { AuthLocalization } from "../../../localization/auth-localization"
import type { Refetch } from "../../../types/refetch"
import { CardContent } from "../../ui/card"
import type { SettingsCardClassNames } from "../shared/settings-card"
import { SettingsCard } from "../shared/settings-card"
import { SettingsCellSkeleton } from "../skeletons/settings-cell-skeleton"
import { ProviderCell } from "./provider-cell"

export interface ProvidersCardProps {
    className?: string
    classNames?: SettingsCardClassNames
    accounts?: Account[] | null
    isPending?: boolean
    localization?: Partial<AuthLocalization>
    skipHook?: boolean
    refetch?: Refetch
}

export function ProvidersCard({
    className,
    classNames,
    accounts,
    isPending,
    localization,
    skipHook,
    refetch
}: ProvidersCardProps) {
    const {
        hooks: { useListAccounts },
        localization: contextLocalization,
        social,
        genericOAuth
    } = useContext(AuthUIContext)

    localization = { ...contextLocalization, ...localization }

    if (!skipHook) {
        const result = useListAccounts()
        accounts = result.data
        isPending = result.isPending
        refetch = result.refetch
    }

    return (
        <SettingsCard
            className={className}
            classNames={classNames}
            title={localization.PROVIDERS}
            description={localization.PROVIDERS_DESCRIPTION}
            isPending={isPending}
        >
            <CardContent className={cn("grid gap-4", classNames?.content)}>
                {isPending ? (
                    social?.providers?.map((provider) => (
                        <SettingsCellSkeleton
                            key={provider}
                            classNames={classNames}
                        />
                    ))
                ) : (
                    <>
                        {accounts?.map((account) => {
                            const socialProvider = socialProviders.find(
                                (sp) => sp.provider === account.providerId
                            )
                            const genericOAuthProvider =
                                genericOAuth?.providers?.find(
                                    (gp) => gp.provider === account.providerId
                                )

                            const provider =
                                socialProvider || genericOAuthProvider
                            if (!provider) return null

                            return (
                                <ProviderCell
                                    key={account.providerId}
                                    classNames={classNames}
                                    account={account}
                                    provider={provider}
                                    refetch={refetch}
                                    other={!socialProvider}
                                />
                            )
                        })}

                        {social?.providers?.map((provider) => {
                            const socialProvider = socialProviders.find(
                                (socialProvider) =>
                                    socialProvider.provider === provider
                            )

                            if (!socialProvider) return null

                            return (
                                <ProviderCell
                                    key={provider}
                                    classNames={classNames}
                                    provider={socialProvider}
                                    refetch={refetch}
                                />
                            )
                        })}

                        {genericOAuth?.providers?.map((provider) => (
                            <ProviderCell
                                key={provider.provider}
                                classNames={classNames}
                                account={accounts?.find(
                                    (acc) =>
                                        acc.providerId === provider.provider
                                )}
                                provider={provider}
                                refetch={refetch}
                                other
                            />
                        ))}
                    </>
                )}
            </CardContent>
        </SettingsCard>
    )
}
