"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useContext, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useOnSuccessTransition } from "../../../hooks/use-success-transition"
import { AuthUIContext } from "../../../lib/auth-ui-provider"
import { cn, getLocalizedError } from "../../../lib/utils"
import type { AuthLocalization } from "../../../localization/auth-localization"
import { Button } from "../../ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "../../ui/form"
import { InputOTP } from "../../ui/input-otp"
import type { AuthFormClassNames } from "../auth-form"
import { OTPInputGroup } from "../otp-input-group"

export interface EmailVerificationFormProps {
    className?: string
    classNames?: AuthFormClassNames
    callbackURL?: string
    isSubmitting?: boolean
    localization: Partial<AuthLocalization>
    otpSeparators?: 0 | 1 | 2
    redirectTo?: string
    setIsSubmitting?: (value: boolean) => void
    onCancel?: () => void
}

export function EmailVerificationForm({
    onCancel,
    localization,
    className,
    classNames,
    otpSeparators,
    callbackURL,
    isSubmitting,
    redirectTo,
    setIsSubmitting
}: EmailVerificationFormProps) {
    const [resendDisabled, setResendDisabled] = useState(true)
    const [countdown, setCountdown] = useState(30)

    const {
        authClient,
        localization: contextLocalization,
        toast,
        localizeErrors,
        navigate,
        basePath,
        viewPaths
    } = useContext(AuthUIContext)

    localization = { ...contextLocalization, ...localization }

    const email =
        typeof window !== "undefined"
            ? new URLSearchParams(window.location.search).get("email") || ""
            : ""

    const { onSuccess, isPending: transitionPending } = useOnSuccessTransition({
        redirectTo
    })

    const formSchema = z.object({
        code: z
            .string()
            .min(1, {
                message: `${localization.EMAIL_OTP} ${localization.IS_REQUIRED}`
            })
            .min(6, {
                message: `${localization.EMAIL_OTP} ${localization.IS_INVALID}`
            })
    })

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            code: ""
        }
    })

    const currentIsSubmitting =
        isSubmitting || form.formState.isSubmitting || transitionPending

    useEffect(() => {
        setIsSubmitting?.(form.formState.isSubmitting || transitionPending)
    }, [form.formState.isSubmitting, transitionPending, setIsSubmitting])

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
            return () => clearTimeout(timer)
        } else {
            setResendDisabled(false)
        }
    }, [countdown])

    async function verifyCode({ code }: z.infer<typeof formSchema>) {
        try {
            const data = await authClient.emailOtp.verifyEmail({
                email,
                otp: code,
                fetchOptions: { throw: true }
            })

            if ("token" in data && data.token) {
                await onSuccess()
            } else {
                navigate(
                    `${basePath}/${viewPaths.SIGN_IN}${window.location.search}`
                )
                toast({
                    variant: "success",
                    message: localization.EMAIL_VERIFICATION_SUCCESS!
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

            form.reset()
        }
    }

    async function resendCode() {
        if (resendDisabled) return

        setResendDisabled(true)
        setCountdown(30)

        try {
            await authClient.emailOtp.sendVerificationOtp({
                email,
                type: "email-verification",
                fetchOptions: { throw: true }
            })

            toast({
                variant: "success",
                message: localization.EMAIL_OTP_VERIFICATION_SENT!
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
            setResendDisabled(false)
            setCountdown(0)
        }
    }

    if (!email) {
        return (
            <div className={cn("grid w-full gap-6", className)}>
                <div className="text-center">
                    <h2 className="font-semibold text-destructive text-lg">
                        Invalid Request
                    </h2>
                    <p className="text-muted-foreground text-sm">
                        {localization.EMAIL_REQUIRED ||
                            "Email address is required"}
                    </p>
                </div>
            </div>
        )
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(verifyCode)}
                className={cn("grid w-full gap-6", className, classNames?.base)}
            >
                <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className={classNames?.label}>
                                {localization.EMAIL_OTP}
                            </FormLabel>

                            <FormControl>
                                <InputOTP
                                    {...field}
                                    maxLength={6}
                                    onChange={(value) => {
                                        field.onChange(value)

                                        if (value.length === 6) {
                                            form.handleSubmit(verifyCode)()
                                        }
                                    }}
                                    containerClassName={
                                        classNames?.otpInputContainer
                                    }
                                    className={classNames?.otpInput}
                                    disabled={currentIsSubmitting}
                                >
                                    <OTPInputGroup
                                        otpSeparators={otpSeparators}
                                    />
                                </InputOTP>
                            </FormControl>

                            <FormMessage className={classNames?.error} />
                        </FormItem>
                    )}
                />

                <div className="grid gap-4">
                    <Button
                        type="submit"
                        disabled={currentIsSubmitting}
                        className={cn(
                            classNames?.button,
                            classNames?.primaryButton
                        )}
                    >
                        {currentIsSubmitting && (
                            <Loader2 className="animate-spin" />
                        )}
                        {localization.EMAIL_OTP_VERIFY_ACTION}
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        onClick={resendCode}
                        disabled={resendDisabled || currentIsSubmitting}
                        className={cn("w-full", classNames?.button)}
                    >
                        {resendDisabled
                            ? `${localization.RESEND_VERIFICATION_EMAIL} (${countdown}s)`
                            : localization.RESEND_VERIFICATION_EMAIL}
                    </Button>

                    {onCancel && (
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onCancel}
                            disabled={currentIsSubmitting}
                            className="w-full"
                        >
                            {localization.CANCEL}
                        </Button>
                    )}
                </div>
            </form>
        </Form>
    )
}
