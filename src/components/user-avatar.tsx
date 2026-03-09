"use client"

import { UserRoundIcon } from "lucide-react"
import { type ComponentProps, useContext } from "react"

import { AuthUIContext } from "../lib/auth-ui-provider"
import { getGravatarUrl } from "../lib/gravatar-utils"
import { cn } from "../lib/utils"
import type { AuthLocalization } from "../localization/auth-localization"
import type { Profile } from "../types/profile"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Skeleton } from "./ui/skeleton"

export interface UserAvatarClassNames {
    base?: string
    image?: string
    fallback?: string
    fallbackIcon?: string
    skeleton?: string
}

export interface UserAvatarProps {
    classNames?: UserAvatarClassNames
    isPending?: boolean
    size?: "sm" | "default" | "lg" | "xl" | null
    user?: Profile | null
    /**
     * @default authLocalization
     * @remarks `AuthLocalization`
     */
    localization?: Partial<AuthLocalization>
}

/**
 * Displays a user avatar with image and fallback support
 *
 * Renders a user's avatar image when available, with appropriate fallbacks:
 * - Shows a skeleton when isPending is true
 * - Displays first two characters of user's name when no image is available
 * - Falls back to a generic user icon when neither image nor name is available
 */
export function UserAvatar({
    className,
    classNames,
    isPending,
    size,
    user,
    localization: propLocalization,
    ...props
}: UserAvatarProps & ComponentProps<typeof Avatar>) {
    const {
        localization: contextLocalization,
        gravatar,
        avatar
    } = useContext(AuthUIContext)

    const localization = { ...contextLocalization, ...propLocalization }

    const name =
        user?.displayName ||
        user?.name ||
        user?.fullName ||
        user?.firstName ||
        user?.displayUsername ||
        user?.username ||
        user?.email
    const userImage = user?.image || user?.avatar || user?.avatarUrl

    // Calculate gravatar URL synchronously
    const gravatarUrl =
        gravatar && user?.email
            ? getGravatarUrl(
                  user.email,
                  gravatar === true ? undefined : gravatar
              )
            : null

    const src = gravatar ? gravatarUrl : userImage

    if (isPending) {
        return (
            <Skeleton
                className={cn(
                    "shrink-0 rounded-full",
                    size === "sm"
                        ? "size-6"
                        : size === "lg"
                          ? "size-10"
                          : size === "xl"
                            ? "size-12"
                            : "size-8",
                    className,
                    classNames?.base,
                    classNames?.skeleton
                )}
            />
        )
    }

    return (
        <Avatar
            className={cn(
                "bg-muted",
                size === "sm"
                    ? "size-6"
                    : size === "lg"
                      ? "size-10"
                      : size === "xl"
                        ? "size-12"
                        : "size-8",
                className,
                classNames?.base
            )}
            {...props}
        >
            {avatar?.Image ? (
                <avatar.Image
                    alt={name || localization?.USER}
                    className={classNames?.image}
                    src={src || ""}
                />
            ) : (
                <AvatarImage
                    alt={name || localization?.USER}
                    className={classNames?.image}
                    src={src || undefined}
                />
            )}

            <AvatarFallback
                className={cn(
                    "text-foreground uppercase",
                    classNames?.fallback
                )}
                delayMs={src ? 600 : undefined}
            >
                {firstTwoCharacters(name) || (
                    <UserRoundIcon
                        className={cn("size-[50%]", classNames?.fallbackIcon)}
                    />
                )}
            </AvatarFallback>
        </Avatar>
    )
}

const firstTwoCharacters = (name?: string | null) => name?.slice(0, 2)
