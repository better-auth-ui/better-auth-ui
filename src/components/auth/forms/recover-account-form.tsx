"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useContext, useEffect } from "react"
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
import { Input } from "../../ui/input"
import type { AuthFormClassNames } from "../auth-form"

export interface RecoverAccountFormProps {
    className?: string
    classNames?: AuthFormClassNames
    isSubmitting?: boolean
    localization: Partial<AuthLocalization>
    redirectTo?: string
    setIsSubmitting?: (value: boolean) => void
}

export function RecoverAccountForm({
    className,
    classNames,
    isSubmitting,
    localization,
    redirectTo,
    setIsSubmitting
}: RecoverAccountFormProps) {
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
        code: z.string().min(1, { message: localization.BACKUP_CODE_REQUIRED })
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

    async function verifyBackupCode({ code }: z.infer<typeof formSchema>) {
        try {
            await authClient.twoFactor.verifyBackupCode({
                code,
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
                onSubmit={form.handleSubmit(verifyBackupCode)}
                className={cn("grid gap-6", className, classNames?.base)}
            >
                <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className={classNames?.label}>
                                {localization.BACKUP_CODE}
                            </FormLabel>

                            <FormControl>
                                <Input
                                    placeholder={
                                        localization.BACKUP_CODE_PLACEHOLDER
                                    }
                                    autoComplete="off"
                                    className={classNames?.input}
                                    disabled={isSubmitting}
                                    {...field}
                                />
                            </FormControl>

                            <FormMessage className={classNames?.error} />
                        </FormItem>
                    )}
                />

                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className={cn(
                        classNames?.button,
                        classNames?.primaryButton
                    )}
                >
                    {isSubmitting ? (
                        <Loader2 className="animate-spin" />
                    ) : (
                        localization.RECOVER_ACCOUNT_ACTION
                    )}
                </Button>
            </form>
        </Form>
    )
}
