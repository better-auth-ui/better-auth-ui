"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import type { BetterFetchOption } from "better-auth/react"
import { Loader2 } from "lucide-react"
import { useContext, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useCaptcha } from "../../../hooks/use-captcha"
import { useIsHydrated } from "../../../hooks/use-hydrated"
import { useOnSuccessTransition } from "../../../hooks/use-success-transition"
import { AuthUIContext } from "../../../lib/auth-ui-provider"
import { cn, getLocalizedError } from "../../../lib/utils"
import type { AuthLocalization } from "../../../localization/auth-localization"
import { Captcha } from "../../captcha/captcha"
import { Button } from "../../ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "../../ui/form"
import { Input } from "../../ui/input"
import { InputOTP } from "../../ui/input-otp"
import type { AuthFormClassNames } from "../auth-form"
import { OTPInputGroup } from "../otp-input-group"

export interface EmailOTPFormProps {
    className?: string
    classNames?: AuthFormClassNames
    callbackURL?: string
    isSubmitting?: boolean
    localization: Partial<AuthLocalization>
    otpSeparators?: 0 | 1 | 2
    redirectTo?: string
    setIsSubmitting?: (value: boolean) => void
}

export function EmailOTPForm(props: EmailOTPFormProps) {
    const [email, setEmail] = useState<string | undefined>()

    if (!email) {
        return <EmailForm {...props} setEmail={setEmail} />
    }

    return <OTPForm {...props} email={email} />
}

function EmailForm({
    className,
    classNames,
    isSubmitting,
    localization,
    setIsSubmitting,
    setEmail
}: EmailOTPFormProps & {
    setEmail: (email: string) => void
}) {
    const isHydrated = useIsHydrated()
    const { captchaRef, getCaptchaHeaders } = useCaptcha({ localization })

    const {
        authClient,
        localization: contextLocalization,
        toast,
        localizeErrors
    } = useContext(AuthUIContext)

    localization = { ...contextLocalization, ...localization }

    const formSchema = z.object({
        email: z.string().email({
            message: `${localization.EMAIL} ${localization.IS_INVALID}`
        })
    })

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: ""
        }
    })

    isSubmitting = isSubmitting || form.formState.isSubmitting

    useEffect(() => {
        setIsSubmitting?.(form.formState.isSubmitting)
    }, [form.formState.isSubmitting, setIsSubmitting])

    async function sendEmailOTP({ email }: z.infer<typeof formSchema>) {
        const fetchOptions: BetterFetchOption = {
            throw: true,
            headers: await getCaptchaHeaders("/email-otp/send-verification-otp")
        }

        try {
            await authClient.emailOtp.sendVerificationOtp({
                email,
                type: "sign-in",
                fetchOptions
            })

            toast({
                variant: "success",
                message: localization.EMAIL_OTP_VERIFICATION_SENT
            })

            setEmail(email)
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
            <form
                onSubmit={form.handleSubmit(sendEmailOTP)}
                noValidate={isHydrated}
                className={cn("grid w-full gap-6", className, classNames?.base)}
            >
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className={classNames?.label}>
                                {localization.EMAIL}
                            </FormLabel>

                            <FormControl>
                                <Input
                                    className={classNames?.input}
                                    type="email"
                                    placeholder={localization.EMAIL_PLACEHOLDER}
                                    disabled={isSubmitting}
                                    {...field}
                                />
                            </FormControl>

                            <FormMessage className={classNames?.error} />
                        </FormItem>
                    )}
                />

                <Captcha
                    ref={captchaRef}
                    localization={localization}
                    action="/email-otp/send-verification-otp"
                />

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
                        localization.EMAIL_OTP_SEND_ACTION
                    )}
                </Button>
            </form>
        </Form>
    )
}

export function OTPForm({
    className,
    classNames,
    isSubmitting,
    localization,
    otpSeparators = 0,
    redirectTo,
    setIsSubmitting,
    email
}: EmailOTPFormProps & {
    email: string
}) {
    const {
        authClient,
        localization: contextLocalization,
        toast,
        localizeErrors
    } = useContext(AuthUIContext)

    localization = { ...contextLocalization, ...localization }

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

    isSubmitting =
        isSubmitting || form.formState.isSubmitting || transitionPending

    useEffect(() => {
        setIsSubmitting?.(form.formState.isSubmitting || transitionPending)
    }, [form.formState.isSubmitting, transitionPending, setIsSubmitting])

    async function verifyCode({ code }: z.infer<typeof formSchema>) {
        try {
            await authClient.signIn.emailOtp({
                email,
                otp: code,
                fetchOptions: { throw: true }
            })

            await onSuccess()
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
                                    disabled={isSubmitting}
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
                        disabled={isSubmitting}
                        className={cn(
                            classNames?.button,
                            classNames?.primaryButton
                        )}
                    >
                        {isSubmitting && <Loader2 className="animate-spin" />}
                        {localization.EMAIL_OTP_VERIFY_ACTION}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
