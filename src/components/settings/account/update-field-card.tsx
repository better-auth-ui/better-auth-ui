"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { type ReactNode, useContext, useMemo } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { AuthUIContext } from "../../../lib/auth-ui-provider"
import { cn, getLocalizedError } from "../../../lib/utils"
import type { AuthLocalization } from "../../../localization/auth-localization"
import type { FieldType } from "../../../types/additional-fields"
import { CardContent } from "../../ui/card"
import { Checkbox } from "../../ui/checkbox"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "../../ui/form"
import { Input } from "../../ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "../../ui/select"
import { Skeleton } from "../../ui/skeleton"
import { Textarea } from "../../ui/textarea"
import {
    SettingsCard,
    type SettingsCardClassNames
} from "../shared/settings-card"

export interface SelectOption {
    label: string
    value: string
}

export interface UpdateFieldCardProps {
    className?: string
    classNames?: SettingsCardClassNames
    description?: ReactNode
    instructions?: ReactNode
    localization?: Partial<AuthLocalization>
    name: string
    placeholder?: string
    required?: boolean
    label?: ReactNode
    type?: FieldType
    multiline?: boolean
    value?: unknown
    validate?: (value: string) => boolean | Promise<boolean>
    options?: SelectOption[]
}

export function UpdateFieldCard({
    className,
    classNames,
    description,
    instructions,
    localization: localizationProp,
    name,
    placeholder,
    required,
    label,
    type,
    multiline,
    value,
    validate,
    options
}: UpdateFieldCardProps) {
    const {
        hooks: { useSession },
        mutators: { updateUser },
        localization: contextLocalization,
        optimistic,
        toast,
        localizeErrors
    } = useContext(AuthUIContext)

    const localization = useMemo(
        () => ({ ...contextLocalization, ...localizationProp }),
        [contextLocalization, localizationProp]
    )

    const { isPending } = useSession()

    let fieldSchema = z.unknown() as z.ZodType<unknown>

    // Create the appropriate schema based on type
    if (type === "number") {
        fieldSchema = required
            ? z.preprocess(
                  (val) => (!val ? undefined : Number(val)),
                  z.number({
                      message: `${label} ${localization.IS_INVALID}`
                  })
              )
            : z.coerce
                  .number({
                      message: `${label} ${localization.IS_INVALID}`
                  })
                  .optional()
    } else if (type === "boolean") {
        fieldSchema = required
            ? z.coerce
                  .boolean({
                      message: `${label} ${localization.IS_INVALID}`
                  })
                  .refine((val) => val === true, {
                      message: `${label} ${localization.IS_REQUIRED}`
                  })
            : z.coerce.boolean({
                  message: `${label} ${localization.IS_INVALID}`
              })
    } else if (type === "select") {
        fieldSchema = required
            ? z.string().min(1, `${label} ${localization.IS_REQUIRED}`)
            : z.string().optional()
    } else {
        fieldSchema = required
            ? z.string().min(1, `${label} ${localization.IS_REQUIRED}`)
            : z.string().optional()
    }

    const form = useForm({
        resolver: zodResolver(z.object({ [name]: fieldSchema })),
        values: { [name]: value || "" }
    })

    const { isSubmitting } = form.formState

    const updateField = async (values: Record<string, unknown>) => {
        await new Promise((resolve) => setTimeout(resolve))
        const newValue = values[name]

        if (value === newValue) {
            toast({
                variant: "error",
                message: `${label} ${localization.IS_THE_SAME}`
            })
            return
        }

        if (
            validate &&
            typeof newValue === "string" &&
            !(await validate(newValue))
        ) {
            form.setError(name, {
                message: `${label} ${localization.IS_INVALID}`
            })

            return
        }

        try {
            await updateUser({ [name]: newValue })

            toast({
                variant: "success",
                message: `${label} ${localization.UPDATED_SUCCESSFULLY}`
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
            <form onSubmit={form.handleSubmit(updateField)}>
                <SettingsCard
                    className={className}
                    classNames={classNames}
                    description={description}
                    instructions={instructions}
                    isPending={isPending}
                    title={label}
                    actionLabel={localization.SAVE}
                    optimistic={optimistic}
                >
                    <CardContent className={classNames?.content}>
                        {type === "boolean" ? (
                            <FormField
                                control={form.control}
                                name={name}
                                render={({ field }) => (
                                    <FormItem className="flex">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value as boolean}
                                                onCheckedChange={field.onChange}
                                                disabled={isSubmitting}
                                                className={classNames?.checkbox}
                                            />
                                        </FormControl>

                                        <FormLabel
                                            className={classNames?.label}
                                        >
                                            {label}
                                        </FormLabel>

                                        <FormMessage
                                            className={classNames?.error}
                                        />
                                    </FormItem>
                                )}
                            />
                        ) : isPending ? (
                            <Skeleton
                                className={cn(
                                    "h-9 w-full",
                                    classNames?.skeleton
                                )}
                            />
                        ) : (
                            <FormField
                                control={form.control}
                                name={name}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            {type === "select" ? (
                                                <Select
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                    defaultValue={
                                                        field.value as string
                                                    }
                                                    disabled={isSubmitting}
                                                >
                                                    <SelectTrigger
                                                        className={cn(
                                                            "w-full",
                                                            classNames?.input
                                                        )}
                                                    >
                                                        <SelectValue
                                                            placeholder={
                                                                placeholder ||
                                                                (typeof label ===
                                                                "string"
                                                                    ? label
                                                                    : "Select an option")
                                                            }
                                                        />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {options?.map(
                                                            (option) => (
                                                                <SelectItem
                                                                    key={
                                                                        option.value
                                                                    }
                                                                    value={
                                                                        option.value
                                                                    }
                                                                >
                                                                    {
                                                                        option.label
                                                                    }
                                                                </SelectItem>
                                                            )
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            ) : type === "number" ? (
                                                <Input
                                                    className={
                                                        classNames?.input
                                                    }
                                                    type="number"
                                                    placeholder={
                                                        placeholder ||
                                                        (typeof label ===
                                                        "string"
                                                            ? label
                                                            : "")
                                                    }
                                                    disabled={isSubmitting}
                                                    {...field}
                                                    value={
                                                        field.value as string
                                                    }
                                                />
                                            ) : multiline ? (
                                                <Textarea
                                                    className={
                                                        classNames?.input
                                                    }
                                                    placeholder={
                                                        placeholder ||
                                                        (typeof label ===
                                                        "string"
                                                            ? label
                                                            : "")
                                                    }
                                                    disabled={isSubmitting}
                                                    {...field}
                                                    value={
                                                        field.value as string
                                                    }
                                                />
                                            ) : (
                                                <Input
                                                    className={
                                                        classNames?.input
                                                    }
                                                    type="text"
                                                    placeholder={
                                                        placeholder ||
                                                        (typeof label ===
                                                        "string"
                                                            ? label
                                                            : "")
                                                    }
                                                    disabled={isSubmitting}
                                                    {...field}
                                                    value={
                                                        field.value as string
                                                    }
                                                />
                                            )}
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
