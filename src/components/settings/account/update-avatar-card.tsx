"use client"

import { Trash2Icon, UploadCloudIcon } from "lucide-react"
import { type ComponentProps, useContext, useRef, useState } from "react"

import { AuthUIContext } from "../../../lib/auth-ui-provider"
import { fileToBase64, resizeAndCropImage } from "../../../lib/image-utils"
import { cn, getLocalizedError } from "../../../lib/utils"
import type { AuthLocalization } from "../../../localization/auth-localization"
import { Button } from "../../ui/button"
import { Card } from "../../ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "../../ui/dropdown-menu"
import { UserAvatar } from "../../user-avatar"
import type { SettingsCardClassNames } from "../shared/settings-card"
import { SettingsCardFooter } from "../shared/settings-card-footer"
import { SettingsCardHeader } from "../shared/settings-card-header"

export interface UpdateAvatarCardProps extends ComponentProps<typeof Card> {
    className?: string
    classNames?: SettingsCardClassNames
    localization?: AuthLocalization
}

export function UpdateAvatarCard({
    className,
    classNames,
    localization,
    ...props
}: UpdateAvatarCardProps) {
    const {
        hooks: { useSession },
        mutators: { updateUser },
        localization: authLocalization,
        optimistic,
        avatar,
        toast,
        localizeErrors
    } = useContext(AuthUIContext)

    localization = { ...authLocalization, ...localization }

    const { data: sessionData, isPending, refetch } = useSession()
    const fileInputRef = useRef<HTMLInputElement | null>(null)
    const [loading, setLoading] = useState(false)

    const handleAvatarChange = async (file: File) => {
        if (!sessionData || !avatar) return

        setLoading(true)
        const resizedFile = await resizeAndCropImage(
            file,
            crypto.randomUUID(),
            avatar.size,
            avatar.extension
        )

        let image: string | undefined | null

        if (avatar.upload) {
            image = await avatar.upload(resizedFile)
        } else {
            image = await fileToBase64(resizedFile)
        }

        if (!image) {
            setLoading(false)
            return
        }

        if (optimistic && !avatar.upload) setLoading(false)

        try {
            await updateUser({ image })
            await refetch?.()
            // If a custom storage remover is provided, clean up the old asset
            if (avatar.upload && avatar.delete && sessionData.user.image) {
                try {
                    await avatar.delete(sessionData.user.image)
                } catch (error) {
                    console.error("Failed to delete old avatar:", error)
                }
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

        setLoading(false)
    }

    const handleDeleteAvatar = async () => {
        if (!sessionData) return

        setLoading(true)

        try {
            // If a custom storage remover is provided, attempt to clean up the old asset first
            if (sessionData.user.image && avatar?.delete) {
                await avatar.delete(sessionData.user.image)
            }

            await updateUser({ image: null })
            await refetch?.()
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

        setLoading(false)
    }

    const openFileDialog = () => fileInputRef.current?.click()

    return (
        <Card
            className={cn(
                "w-full pb-0 text-start",
                className,
                classNames?.base
            )}
            {...props}
        >
            <input
                ref={fileInputRef}
                accept="image/*"
                disabled={loading}
                hidden
                type="file"
                onChange={(e) => {
                    const file = e.target.files?.item(0)
                    if (file) handleAvatarChange(file)

                    e.target.value = ""
                }}
            />

            <div className="flex justify-between">
                <SettingsCardHeader
                    className="grow self-start"
                    title={localization.AVATAR}
                    description={localization.AVATAR_DESCRIPTION}
                    isPending={isPending}
                    classNames={classNames}
                />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            className="me-6 size-fit rounded-full"
                            size="icon"
                            variant="ghost"
                        >
                            <UserAvatar
                                isPending={isPending || loading}
                                key={sessionData?.user.image}
                                className="size-20 text-2xl"
                                classNames={classNames?.avatar}
                                user={sessionData?.user}
                                localization={localization}
                            />
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                        align="end"
                        onCloseAutoFocus={(e) => e.preventDefault()}
                    >
                        <DropdownMenuItem
                            onClick={openFileDialog}
                            disabled={loading}
                        >
                            <UploadCloudIcon />
                            {localization.UPLOAD_AVATAR}
                        </DropdownMenuItem>
                        {sessionData?.user.image && (
                            <DropdownMenuItem
                                onClick={handleDeleteAvatar}
                                disabled={loading}
                                variant="destructive"
                            >
                                <Trash2Icon />
                                {localization.DELETE_AVATAR}
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <SettingsCardFooter
                className="!py-5"
                instructions={localization.AVATAR_INSTRUCTIONS}
                classNames={classNames}
                isPending={isPending}
                isSubmitting={loading}
            />
        </Card>
    )
}
