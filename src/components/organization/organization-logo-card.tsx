"use client"

import type { Organization } from "better-auth/plugins/organization"
import { Trash2Icon, UploadCloudIcon } from "lucide-react"
import {
    type ComponentProps,
    useContext,
    useMemo,
    useRef,
    useState
} from "react"

import { useCurrentOrganization } from "../../hooks/use-current-organization"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import { fileToBase64, resizeAndCropImage } from "../../lib/image-utils"
import { cn, getLocalizedError } from "../../lib/utils"
import type { AuthLocalization } from "../../localization/auth-localization"
import type { SettingsCardClassNames } from "../settings/shared/settings-card"
import { SettingsCardFooter } from "../settings/shared/settings-card-footer"
import { SettingsCardHeader } from "../settings/shared/settings-card-header"
import { Button } from "../ui/button"
import { Card } from "../ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "../ui/dropdown-menu"
import { OrganizationLogo } from "./organization-logo"

export interface OrganizationLogoCardProps extends ComponentProps<typeof Card> {
    className?: string
    classNames?: SettingsCardClassNames
    localization?: AuthLocalization
    slug?: string
}

export function OrganizationLogoCard({
    className,
    classNames,
    localization: localizationProp,
    slug,
    ...props
}: OrganizationLogoCardProps) {
    const { localization: contextLocalization } = useContext(AuthUIContext)

    const localization = useMemo(
        () => ({ ...contextLocalization, ...localizationProp }),
        [contextLocalization, localizationProp]
    )

    const { data: organization } = useCurrentOrganization({ slug })

    if (!organization) {
        return (
            <Card
                className={cn(
                    "w-full pb-0 text-start",
                    className,
                    classNames?.base
                )}
                {...props}
            >
                <div className="flex justify-between">
                    <SettingsCardHeader
                        className="grow self-start"
                        title={localization.LOGO}
                        description={localization.LOGO_DESCRIPTION}
                        isPending
                        classNames={classNames}
                    />

                    <Button
                        type="button"
                        className="me-6 size-fit rounded-full"
                        size="icon"
                        variant="ghost"
                        disabled
                    >
                        <OrganizationLogo
                            isPending
                            className="size-20 text-2xl"
                            classNames={classNames?.avatar}
                            localization={localization}
                        />
                    </Button>
                </div>

                <SettingsCardFooter
                    className="!py-5"
                    instructions={localization.LOGO_INSTRUCTIONS}
                    classNames={classNames}
                    isPending
                />
            </Card>
        )
    }

    return (
        <OrganizationLogoForm
            className={className}
            classNames={classNames}
            localization={localization}
            organization={organization}
            {...props}
        />
    )
}

function OrganizationLogoForm({
    className,
    classNames,
    localization: localizationProp,
    organization,
    ...props
}: OrganizationLogoCardProps & { organization: Organization }) {
    const {
        hooks: { useHasPermission },
        localization: authLocalization,
        organization: organizationOptions,
        mutators: { updateOrganization },
        toast,
        localizeErrors
    } = useContext(AuthUIContext)

    const localization = useMemo(
        () => ({ ...authLocalization, ...localizationProp }),
        [authLocalization, localizationProp]
    )

    const { refetch: refetchOrganization } = useCurrentOrganization({
        slug: organization.slug
    })

    const { data: hasPermission, isPending: permissionPending } =
        useHasPermission({
            organizationId: organization.id,
            permissions: {
                organization: ["update"]
            }
        })

    const isPending = permissionPending

    const fileInputRef = useRef<HTMLInputElement | null>(null)
    const [loading, setLoading] = useState(false)

    const handleLogoChange = async (file: File) => {
        if (!organizationOptions?.logo || !hasPermission?.success) return

        setLoading(true)

        const resizedFile = await resizeAndCropImage(
            file,
            crypto.randomUUID(),
            organizationOptions.logo.size,
            organizationOptions.logo.extension
        )

        let image: string | undefined | null

        if (organizationOptions.logo.upload) {
            image = await organizationOptions.logo.upload(resizedFile)
        } else {
            image = await fileToBase64(resizedFile)
        }

        if (!image) {
            setLoading(false)
            return
        }

        try {
            await updateOrganization({
                organizationId: organization.id,
                data: { logo: image }
            })

            await refetchOrganization?.()
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

    const handleDeleteLogo = async () => {
        if (!hasPermission?.success) return

        setLoading(true)

        try {
            if (organization.logo) {
                await organizationOptions?.logo?.delete?.(organization.logo)
            }

            await updateOrganization({
                organizationId: organization.id,
                data: { logo: "" }
            })

            await refetchOrganization?.()
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

    const openFileDialog = () => {
        fileInputRef.current?.click()
    }

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
                disabled={loading || !hasPermission?.success}
                hidden
                type="file"
                onChange={(e) => {
                    const file = e.target.files?.item(0)
                    if (file) handleLogoChange(file)

                    e.target.value = ""
                }}
            />

            <div className="flex justify-between">
                <SettingsCardHeader
                    className="grow self-start"
                    title={localization.LOGO}
                    description={localization.LOGO_DESCRIPTION}
                    isPending={isPending}
                    classNames={classNames}
                />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            type="button"
                            className="me-6 size-fit rounded-full"
                            size="icon"
                            variant="ghost"
                            disabled={!hasPermission?.success}
                        >
                            <OrganizationLogo
                                isPending={isPending || loading}
                                key={organization.logo}
                                className="size-20 text-2xl"
                                classNames={classNames?.avatar}
                                organization={organization}
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
                            disabled={loading || !hasPermission?.success}
                        >
                            <UploadCloudIcon />

                            {localization.UPLOAD_LOGO}
                        </DropdownMenuItem>

                        {organization.logo && (
                            <DropdownMenuItem
                                onClick={handleDeleteLogo}
                                disabled={loading || !hasPermission?.success}
                                variant="destructive"
                            >
                                <Trash2Icon />

                                {localization.DELETE_LOGO}
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <SettingsCardFooter
                className="!py-5"
                instructions={localization.LOGO_INSTRUCTIONS}
                classNames={classNames}
                isPending={isPending}
                isSubmitting={loading}
            />
        </Card>
    )
}
