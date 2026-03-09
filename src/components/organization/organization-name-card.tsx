"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import type { Organization } from "better-auth/plugins/organization"
import { useContext, useMemo } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { useCurrentOrganization } from "../../hooks/use-current-organization"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import { cn, getLocalizedError } from "../../lib/utils"
import {
    SettingsCard,
    type SettingsCardProps
} from "../settings/shared/settings-card"
import { CardContent } from "../ui/card"
import { Form, FormControl, FormField, FormItem, FormMessage } from "../ui/form"
import { Input } from "../ui/input"
import { Skeleton } from "../ui/skeleton"

export interface OrganizationNameCardProps extends SettingsCardProps {
    slug?: string
}

export function OrganizationNameCard({
    className,
    classNames,
    localization: localizationProp,
    slug,
    ...props
}: OrganizationNameCardProps) {
    const { localization: contextLocalization } = useContext(AuthUIContext)

    const localization = useMemo(
        () => ({ ...contextLocalization, ...localizationProp }),
        [contextLocalization, localizationProp]
    )

    const { data: organization } = useCurrentOrganization({ slug })

    if (!organization) {
        return (
            <SettingsCard
                className={className}
                classNames={classNames}
                actionLabel={localization.SAVE}
                description={localization.ORGANIZATION_NAME_DESCRIPTION}
                instructions={localization.ORGANIZATION_NAME_INSTRUCTIONS}
                isPending
                title={localization.ORGANIZATION_NAME}
                {...props}
            >
                <CardContent className={classNames?.content}>
                    <Skeleton
                        className={cn("h-9 w-full", classNames?.skeleton)}
                    />
                </CardContent>
            </SettingsCard>
        )
    }

    return (
        <OrganizationNameForm
            className={className}
            classNames={classNames}
            localization={localization}
            organization={organization}
            {...props}
        />
    )
}

function OrganizationNameForm({
    className,
    classNames,
    localization: localizationProp,
    organization,
    ...props
}: OrganizationNameCardProps & { organization: Organization }) {
    const {
        localization: contextLocalization,
        hooks: { useHasPermission },
        mutators: { updateOrganization },
        optimistic,
        toast,
        localizeErrors
    } = useContext(AuthUIContext)

    const localization = { ...contextLocalization, ...localizationProp }

    const { data: hasPermission, isPending: permissionPending } =
        useHasPermission({
            organizationId: organization.id,
            permissions: {
                organization: ["update"]
            }
        })

    const { refetch: refetchOrganization } = useCurrentOrganization({
        slug: organization.slug
    })

    const isPending = permissionPending

    const formSchema = z.object({
        name: z.string().min(1, {
            message: `${localization.ORGANIZATION_NAME} ${localization.IS_REQUIRED}`
        })
    })

    const form = useForm({
        resolver: zodResolver(formSchema),
        values: { name: organization.name || "" }
    })

    const { isSubmitting } = form.formState

    const updateOrganizationName = async ({
        name
    }: z.infer<typeof formSchema>) => {
        if (organization.name === name) {
            toast({
                variant: "error",
                message: `${localization.ORGANIZATION_NAME} ${localization.IS_THE_SAME}`
            })

            return
        }

        try {
            await updateOrganization({
                organizationId: organization.id,
                data: { name }
            })

            await refetchOrganization?.()

            toast({
                variant: "success",
                message: `${localization.ORGANIZATION_NAME} ${localization.UPDATED_SUCCESSFULLY}`
            })
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
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(updateOrganizationName)}>
                <SettingsCard
                    className={className}
                    classNames={classNames}
                    description={localization.ORGANIZATION_NAME_DESCRIPTION}
                    instructions={localization.ORGANIZATION_NAME_INSTRUCTIONS}
                    isPending={isPending}
                    title={localization.ORGANIZATION_NAME}
                    actionLabel={localization.SAVE}
                    optimistic={optimistic}
                    disabled={!hasPermission?.success}
                    {...props}
                >
                    <CardContent className={classNames?.content}>
                        {isPending ? (
                            <Skeleton
                                className={cn(
                                    "h-9 w-full",
                                    classNames?.skeleton
                                )}
                            />
                        ) : (
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input
                                                className={classNames?.input}
                                                placeholder={
                                                    localization.ORGANIZATION_NAME_PLACEHOLDER
                                                }
                                                disabled={
                                                    isSubmitting ||
                                                    !hasPermission?.success
                                                }
                                                {...field}
                                            />
                                        </FormControl>

                                        <FormMessage
                                            className={classNames?.error}
                                        />
                                    </FormItem>
                                )}
                            />
                        )}
                    </CardContent>
                </SettingsCard>
            </form>
        </Form>
    )
}
