"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useContext } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { AuthUIContext } from "../../../lib/auth-ui-provider"
import { cn, getLocalizedError, getPasswordSchema } from "../../../lib/utils"
import type { AuthLocalization } from "../../../localization/auth-localization"
import type { PasswordValidation } from "../../../types/password-validation"
import { PasswordInput } from "../../password-input"
import { CardContent } from "../../ui/card"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "../../ui/form"
import {
    SettingsCard,
    type SettingsCardClassNames
} from "../shared/settings-card"
import { InputFieldSkeleton } from "../skeletons/input-field-skeleton"

export interface ChangePasswordCardProps {
    className?: string
    classNames?: SettingsCardClassNames
    accounts?: { providerId: string }[] | null
    isPending?: boolean
    localization?: AuthLocalization
    skipHook?: boolean
    passwordValidation?: PasswordValidation
}

export function ChangePasswordCard({
    className,
    classNames,
    accounts,
    isPending,
    localization,
    skipHook,
    passwordValidation
}: ChangePasswordCardProps) {
    const {
        authClient,
        basePath,
        baseURL,
        credentials,
        hooks: { useSession, useListAccounts },
        localization: contextLocalization,
        viewPaths,
        toast,
        localizeErrors
    } = useContext(AuthUIContext)

    const confirmPasswordEnabled = credentials?.confirmPassword
    const contextPasswordValidation = credentials?.passwordValidation

    localization = { ...contextLocalization, ...localization }
    passwordValidation = { ...contextPasswordValidation, ...passwordValidation }

    const { data: sessionData } = useSession()

    if (!skipHook) {
        const result = useListAccounts()
        accounts = result.data
        isPending = result.isPending
    }

    const formSchema = z
        .object({
            currentPassword: getPasswordSchema(
                passwordValidation,
                localization
            ),
            newPassword: getPasswordSchema(passwordValidation, {
                PASSWORD_REQUIRED: localization.NEW_PASSWORD_REQUIRED,
                PASSWORD_TOO_SHORT: localization.PASSWORD_TOO_SHORT,
                PASSWORD_TOO_LONG: localization.PASSWORD_TOO_LONG,
                INVALID_PASSWORD: localization.INVALID_PASSWORD
            }),
            confirmPassword: confirmPasswordEnabled
                ? getPasswordSchema(passwordValidation, {
                      PASSWORD_REQUIRED: localization.CONFIRM_PASSWORD_REQUIRED,
                      PASSWORD_TOO_SHORT: localization.PASSWORD_TOO_SHORT,
                      PASSWORD_TOO_LONG: localization.PASSWORD_TOO_LONG,
                      INVALID_PASSWORD: localization.INVALID_PASSWORD
                  })
                : z.string().optional()
        })
        .refine(
            (data) =>
                !confirmPasswordEnabled ||
                data.newPassword === data.confirmPassword,
            {
                message: localization.PASSWORDS_DO_NOT_MATCH,
                path: ["confirmPassword"]
            }
        )

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: ""
        }
    })

    const setPasswordForm = useForm()

    const { isSubmitting } = form.formState

    const setPassword = async () => {
        if (!sessionData) return
        const email = sessionData?.user.email

        try {
            await authClient.requestPasswordReset({
                email,
                redirectTo: `${baseURL}${basePath}/${viewPaths.RESET_PASSWORD}`,
                fetchOptions: { throw: true }
            })

            toast({
                variant: "success",
                message: localization.FORGOT_PASSWORD_EMAIL!
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

    const changePassword = async ({
        currentPassword,
        newPassword
    }: z.infer<typeof formSchema>) => {
        try {
            await authClient.changePassword({
                currentPassword,
                newPassword,
                revokeOtherSessions: true,
                fetchOptions: { throw: true }
            })

            toast({
                variant: "success",
                message: localization.CHANGE_PASSWORD_SUCCESS!
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

        form.reset()
    }

    const credentialsLinked = accounts?.some(
        (acc) => acc.providerId === "credential"
    )

    if (!isPending && !credentialsLinked) {
        return (
            <Form {...setPasswordForm}>
                <form onSubmit={setPasswordForm.handleSubmit(setPassword)}>
                    <SettingsCard
                        title={localization.SET_PASSWORD}
                        description={localization.SET_PASSWORD_DESCRIPTION}
                        actionLabel={localization.SET_PASSWORD}
                        isPending={isPending}
                        className={className}
                        classNames={classNames}
                    />
                </form>
            </Form>
        )
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(changePassword)}>
                <SettingsCard
                    className={className}
                    classNames={classNames}
                    actionLabel={localization.SAVE}
                    description={localization.CHANGE_PASSWORD_DESCRIPTION}
                    instructions={localization.CHANGE_PASSWORD_INSTRUCTIONS}
                    isPending={isPending}
                    title={localization.CHANGE_PASSWORD}
                >
                    <CardContent
                        className={cn("grid gap-6", classNames?.content)}
                    >
                        {isPending || !accounts ? (
                            <>
                                <InputFieldSkeleton classNames={classNames} />
                                <InputFieldSkeleton classNames={classNames} />

                                {confirmPasswordEnabled && (
                                    <InputFieldSkeleton
                                        classNames={classNames}
                                    />
                                )}
                            </>
                        ) : (
                            <>
                                <FormField
                                    control={form.control}
                                    name="currentPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel
                                                className={classNames?.label}
                                            >
                                                {localization.CURRENT_PASSWORD}
                                            </FormLabel>

                                            <FormControl>
                                                <PasswordInput
                                                    className={
                                                        classNames?.input
                                                    }
                                                    autoComplete="current-password"
                                                    placeholder={
                                                        localization.CURRENT_PASSWORD_PLACEHOLDER
                                                    }
                                                    disabled={isSubmitting}
                                                    {...field}
                                                />
                                            </FormControl>

                                            <FormMessage
                                                className={classNames?.error}
                                            />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="newPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel
                                                className={classNames?.label}
                                            >
                                                {localization.NEW_PASSWORD}
                                            </FormLabel>

                                            <FormControl>
                                                <PasswordInput
                                                    className={
                                                        classNames?.input
                                                    }
                                                    autoComplete="new-password"
                                                    disabled={isSubmitting}
                                                    placeholder={
                                                        localization.NEW_PASSWORD_PLACEHOLDER
                                                    }
                                                    enableToggle
                                                    {...field}
                                                />
                                            </FormControl>

                                            <FormMessage
                                                className={classNames?.error}
                                            />
                                        </FormItem>
                                    )}
                                />

                                {confirmPasswordEnabled && (
                                    <FormField
                                        control={form.control}
                                        name="confirmPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel
                                                    className={
                                                        classNames?.label
                                                    }
                                                >
                                                    {
                                                        localization.CONFIRM_PASSWORD
                                                    }
                                                </FormLabel>

                                                <FormControl>
                                                    <PasswordInput
                                                        className={
                                                            classNames?.input
                                                        }
                                                        autoComplete="new-password"
                                                        placeholder={
                                                            localization.CONFIRM_PASSWORD_PLACEHOLDER
                                                        }
                                                        disabled={isSubmitting}
                                                        enableToggle
                                                        {...field}
                                                    />
                                                </FormControl>

                                                <FormMessage
                                                    className={
                                                        classNames?.error
                                                    }
                                                />
                                            </FormItem>
                                        )}
                                    />
                                )}
                            </>
                        )}
                    </CardContent>
                </SettingsCard>
            </form>
        </Form>
    )
}
