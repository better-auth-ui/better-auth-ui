"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { type ComponentProps, useContext, useMemo } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { AuthUIContext } from "../../lib/auth-ui-provider"
import { cn, getLocalizedError } from "../../lib/utils"
import type { AuthLocalization } from "../../localization/auth-localization"
import type { Refetch } from "../../types/refetch"
import type { SettingsCardClassNames } from "../settings/shared/settings-card"
import { Button } from "../ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "../ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "../ui/form"
import { Input } from "../ui/input"

export interface CreateTeamDialogProps extends ComponentProps<typeof Dialog> {
    classNames?: SettingsCardClassNames
    localization?: AuthLocalization
    refetch?: Refetch
    organizationId?: string
}

/**
 * Renders a dialog containing a form to create a team for a given organization.
 *
 * The component validates the team name, submits it to create the team, shows success or error toasts, and manages dialog visibility via `onOpenChange`.
 *
 * @param organizationId - The ID of the organization to which the new team will belong; when falsy the create action is disabled.
 * @param onOpenChange - Callback invoked when the dialog open state changes; called with `false` to close the dialog after a successful create or when cancel is clicked.
 * @param localization - Optional localization overrides for labels, placeholders, descriptions, and messages used by the dialog.
 * @returns A React element rendering the create-team dialog and its form.
 */
export function CreateTeamDialog({
    classNames,
    localization: localizationProp,
    refetch,
    organizationId,
    onOpenChange,
    ...props
}: CreateTeamDialogProps) {
    const {
        authClient,
        localization: contextLocalization,
        localizeErrors,
        toast
    } = useContext(AuthUIContext)

    const localization = useMemo(
        () => ({ ...contextLocalization, ...localizationProp }),
        [contextLocalization, localizationProp]
    )

    const formSchema = z.object({
        name: z
            .string()
            .min(1, {
                message: `${localization.TEAM_NAME} ${localization.IS_REQUIRED}`
            })
            .max(64, {
                message: localization.TEAM_NAME_INSTRUCTIONS
            })
    })

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: ""
        }
    })

    const isSubmitting = form.formState.isSubmitting

    async function onSubmit({ name }: z.infer<typeof formSchema>) {
        if (!organizationId) return

        try {
            await authClient.organization.createTeam({
                name,
                organizationId,
                fetchOptions: { throw: true }
            })

            await refetch?.()
            onOpenChange?.(false)
            form.reset()

            toast({
                variant: "success",
                message: localization.CREATE_TEAM_SUCCESS
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
        <Dialog onOpenChange={onOpenChange} {...props}>
            <DialogContent className={classNames?.dialog?.content}>
                <DialogHeader className={classNames?.dialog?.header}>
                    <DialogTitle
                        className={cn("text-lg md:text-xl", classNames?.title)}
                    >
                        {localization.CREATE_TEAM}
                    </DialogTitle>

                    <DialogDescription
                        className={cn(
                            "text-xs md:text-sm",
                            classNames?.description
                        )}
                    >
                        {localization.TEAM_NAME_DESCRIPTION}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-6"
                    >
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        {localization.TEAM_NAME}
                                    </FormLabel>

                                    <FormControl>
                                        <Input
                                            placeholder={
                                                localization.TEAM_NAME_PLACEHOLDER
                                            }
                                            {...field}
                                        />
                                    </FormControl>

                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter className={classNames?.dialog?.footer}>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange?.(false)}
                                className={cn(
                                    classNames?.button,
                                    classNames?.outlineButton
                                )}
                            >
                                {localization.CANCEL}
                            </Button>

                            <Button
                                type="submit"
                                className={cn(
                                    classNames?.button,
                                    classNames?.primaryButton
                                )}
                                disabled={isSubmitting || !organizationId}
                            >
                                {isSubmitting && (
                                    <Loader2 className="animate-spin" />
                                )}

                                {localization.CREATE_TEAM}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
