import { zodResolver } from "@hookform/resolvers/zod"
import type { Account } from "better-auth"
import { Loader2 } from "lucide-react"
import { type ComponentProps, useContext } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { AuthUIContext } from "../../../lib/auth-ui-provider"
import { cn, getLocalizedError } from "../../../lib/utils"
import type { AuthLocalization } from "../../../localization/auth-localization"
import { Button } from "../../ui/button"
import { Card } from "../../ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "../../ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "../../ui/form"
import { Input } from "../../ui/input"
import { UserView } from "../../user-view"
import type { SettingsCardClassNames } from "../shared/settings-card"

export interface DeleteAccountDialogProps
    extends ComponentProps<typeof Dialog> {
    classNames?: SettingsCardClassNames
    accounts?: Account[] | null
    localization?: AuthLocalization
}

export function DeleteAccountDialog({
    classNames,
    accounts,
    localization,
    onOpenChange,
    ...props
}: DeleteAccountDialogProps) {
    const {
        authClient,
        basePath,
        baseURL,
        deleteUser,
        freshAge,
        hooks: { useSession },
        localization: contextLocalization,
        viewPaths,
        navigate,
        toast,
        localizeErrors
    } = useContext(AuthUIContext)

    localization = { ...contextLocalization, ...localization }

    const { data: sessionData } = useSession()
    const session = sessionData?.session
    const user = sessionData?.user

    const isFresh = session
        ? Date.now() - new Date(session?.createdAt).getTime() < freshAge * 1000
        : false
    const credentialsLinked = accounts?.some(
        (acc) => acc.providerId === "credential"
    )

    const formSchema = z.object({
        password: credentialsLinked
            ? z.string().min(1, { message: localization.PASSWORD_REQUIRED! })
            : z.string().optional()
    })

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            password: ""
        }
    })

    const { isSubmitting } = form.formState

    const deleteAccount = async ({ password }: z.infer<typeof formSchema>) => {
        const params = {} as Record<string, string>

        if (credentialsLinked) {
            params.password = password!
        } else if (!isFresh) {
            navigate(`${basePath}/${viewPaths.SIGN_OUT}`)
            return
        }

        if (deleteUser?.verification) {
            params.callbackURL = `${baseURL}${basePath}/${viewPaths.SIGN_OUT}`
        }

        try {
            await authClient.deleteUser({
                ...params,
                fetchOptions: {
                    throw: true
                }
            })

            if (deleteUser?.verification) {
                toast({
                    variant: "success",
                    message: localization.DELETE_ACCOUNT_VERIFY!
                })
            } else {
                toast({
                    variant: "success",
                    message: localization.DELETE_ACCOUNT_SUCCESS!
                })
                navigate(`${basePath}/${viewPaths.SIGN_OUT}`)
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
        }

        onOpenChange?.(false)
    }

    return (
        <Dialog onOpenChange={onOpenChange} {...props}>
            <DialogContent
                className={cn("sm:max-w-md", classNames?.dialog?.content)}
            >
                <DialogHeader className={classNames?.dialog?.header}>
                    <DialogTitle
                        className={cn("text-lg md:text-xl", classNames?.title)}
                    >
                        {localization?.DELETE_ACCOUNT}
                    </DialogTitle>

                    <DialogDescription
                        className={cn(
                            "text-xs md:text-sm",
                            classNames?.description
                        )}
                    >
                        {isFresh
                            ? localization?.DELETE_ACCOUNT_INSTRUCTIONS
                            : localization?.SESSION_NOT_FRESH}
                    </DialogDescription>
                </DialogHeader>

                <Card className={cn("my-2 flex-row p-4", classNames?.cell)}>
                    <UserView user={user} localization={localization} />
                </Card>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(deleteAccount)}
                        className="grid gap-6"
                    >
                        {credentialsLinked && (
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel
                                            className={classNames?.label}
                                        >
                                            {localization?.PASSWORD}
                                        </FormLabel>

                                        <FormControl>
                                            <Input
                                                autoComplete="current-password"
                                                placeholder={
                                                    localization?.PASSWORD_PLACEHOLDER
                                                }
                                                type="password"
                                                className={classNames?.input}
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

                        <DialogFooter className={classNames?.dialog?.footer}>
                            <Button
                                type="button"
                                variant="secondary"
                                className={cn(
                                    classNames?.button,
                                    classNames?.secondaryButton
                                )}
                                onClick={() => onOpenChange?.(false)}
                            >
                                {localization.CANCEL}
                            </Button>

                            <Button
                                className={cn(
                                    classNames?.button,
                                    classNames?.destructiveButton
                                )}
                                disabled={isSubmitting}
                                variant="destructive"
                                type="submit"
                            >
                                {isSubmitting && (
                                    <Loader2 className="animate-spin" />
                                )}
                                {isFresh
                                    ? localization?.DELETE_ACCOUNT
                                    : localization?.SIGN_OUT}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
