"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useContext, useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { AuthUIContext } from "../../../lib/auth-ui-provider"
import { cn, getLocalizedError, getPasswordSchema } from "../../../lib/utils"
import type { AuthLocalization } from "../../../localization/auth-localization"
import type { PasswordValidation } from "../../../types/password-validation"
import { PasswordInput } from "../../password-input"
import { Button } from "../../ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "../../ui/form"
import type { AuthFormClassNames } from "../auth-form"

export interface ResetPasswordFormProps {
    className?: string
    classNames?: AuthFormClassNames
    localization: Partial<AuthLocalization>
    passwordValidation?: PasswordValidation
}

export function ResetPasswordForm({
    className,
    classNames,
    localization,
    passwordValidation
}: ResetPasswordFormProps) {
    const tokenChecked = useRef(false)

    const {
        authClient,
        basePath,
        credentials,
        localization: contextLocalization,
        viewPaths,
        navigate,
        toast,
        localizeErrors
    } = useContext(AuthUIContext)

    const confirmPasswordEnabled = credentials?.confirmPassword
    const contextPasswordValidation = credentials?.passwordValidation

    localization = { ...contextLocalization, ...localization }
    passwordValidation = { ...contextPasswordValidation, ...passwordValidation }

    const formSchema = z
        .object({
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
            newPassword: "",
            confirmPassword: ""
        }
    })

    const isSubmitting = form.formState.isSubmitting

    useEffect(() => {
        if (tokenChecked.current) return
        tokenChecked.current = true

        const searchParams = new URLSearchParams(window.location.search)
        const token = searchParams.get("token")

        if (!token || token === "INVALID_TOKEN") {
            navigate(
                `${basePath}/${viewPaths.SIGN_IN}${window.location.search}`
            )
            toast({ variant: "error", message: localization.INVALID_TOKEN })
        }
    }, [basePath, navigate, toast, viewPaths, localization])

    async function resetPassword({ newPassword }: z.infer<typeof formSchema>) {
        try {
            const searchParams = new URLSearchParams(window.location.search)
            const token = searchParams.get("token") as string

            await authClient.resetPassword({
                newPassword,
                token,
                fetchOptions: { throw: true }
            })

            toast({
                variant: "success",
                message: localization.RESET_PASSWORD_SUCCESS
            })

            navigate(
                `${basePath}/${viewPaths.SIGN_IN}${window.location.search}`
            )
        } catch (error) {
            toast({
                variant: "error",
                message: getLocalizedError({
                    error,
                    localization,
                    localizeErrors
                })
            })

            form.reset()
        }
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(resetPassword)}
                className={cn("grid w-full gap-6", className, classNames?.base)}
            >
                <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className={classNames?.label}>
                                {localization.NEW_PASSWORD}
                            </FormLabel>

                            <FormControl>
                                <PasswordInput
                                    autoComplete="new-password"
                                    className={classNames?.input}
                                    placeholder={
                                        localization.NEW_PASSWORD_PLACEHOLDER
                                    }
                                    disabled={isSubmitting}
                                    {...field}
                                />
                            </FormControl>

                            <FormMessage className={classNames?.error} />
                        </FormItem>
                    )}
                />

                {confirmPasswordEnabled && (
                    <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className={classNames?.label}>
                                    {localization.CONFIRM_PASSWORD}
                                </FormLabel>

                                <FormControl>
                                    <PasswordInput
                                        autoComplete="new-password"
                                        className={classNames?.input}
                                        placeholder={
                                            localization.CONFIRM_PASSWORD_PLACEHOLDER
                                        }
                                        disabled={isSubmitting}
                                        {...field}
                                    />
                                </FormControl>

                                <FormMessage className={classNames?.error} />
                            </FormItem>
                        )}
                    />
                )}

                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className={cn(
                        "w-full",
                        classNames?.button,
                        classNames?.primaryButton
                    )}
                >
                    {isSubmitting ? (
                        <Loader2 className="animate-spin" />
                    ) : (
                        localization.RESET_PASSWORD_ACTION
                    )}
                </Button>
            </form>
        </Form>
    )
}
