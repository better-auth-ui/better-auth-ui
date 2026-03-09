"use client"

import { useContext, useMemo } from "react"
import { AuthUIContext } from "../lib/auth-ui-provider"
import { cn } from "../lib/utils"
import type { AuthLocalization } from "../localization/auth-localization"
import type { Profile } from "../types/profile"
import { Skeleton } from "./ui/skeleton"
import { UserAvatar, type UserAvatarClassNames } from "./user-avatar"

export interface UserViewClassNames {
    base?: string
    avatar?: UserAvatarClassNames
    content?: string
    title?: string
    subtitle?: string
    skeleton?: string
}

export interface UserViewProps {
    className?: string
    classNames?: UserViewClassNames
    isPending?: boolean
    size?: "sm" | "default" | "lg" | null
    user?: Profile | null
    /**
     * @default authLocalization
     * @remarks `AuthLocalization`
     */
    localization?: AuthLocalization
}

/**
 * Displays user information with avatar and details in a compact view
 *
 * Renders a user's profile information with appropriate fallbacks:
 * - Shows avatar alongside user name and email when available
 * - Shows loading skeletons when isPending is true
 * - Falls back to generic "User" text when neither name nor email is available
 * - Supports customization through classNames prop
 */
export function UserView({
    className,
    classNames,
    isPending,
    size,
    user,
    localization: propLocalization
}: UserViewProps) {
    const { localization: contextLocalization } = useContext(AuthUIContext)

    const localization = useMemo(
        () => ({ ...contextLocalization, ...propLocalization }),
        [contextLocalization, propLocalization]
    )

    return (
        <div
            className={cn(
                "flex items-center gap-2",
                className,
                classNames?.base
            )}
        >
            <UserAvatar
                className={cn(size !== "sm" && "my-0.5")}
                classNames={classNames?.avatar}
                isPending={isPending}
                size={size}
                user={user}
                localization={localization}
            />

            <div
                className={cn(
                    "grid flex-1 text-start leading-tight",
                    classNames?.content
                )}
            >
                {isPending ? (
                    <>
                        <Skeleton
                            className={cn(
                                "max-w-full",
                                size === "lg" ? "h-4.5 w-32" : "h-3.5 w-24",
                                classNames?.title,
                                classNames?.skeleton
                            )}
                        />
                        {size !== "sm" && (
                            <Skeleton
                                className={cn(
                                    "mt-1.5 max-w-full",
                                    size === "lg" ? "h-3.5 w-40" : "h-3 w-32",
                                    classNames?.subtitle,
                                    classNames?.skeleton
                                )}
                            />
                        )}
                    </>
                ) : (
                    <>
                        <span
                            className={cn(
                                "truncate font-semibold",
                                size === "lg" ? "text-base" : "text-sm",
                                classNames?.title
                            )}
                        >
                            {user?.displayName ||
                                user?.name ||
                                user?.fullName ||
                                user?.firstName ||
                                user?.displayUsername ||
                                user?.username ||
                                user?.email ||
                                localization?.USER}
                        </span>

                        {!user?.isAnonymous &&
                            size !== "sm" &&
                            (user?.name || user?.username) && (
                                <span
                                    className={cn(
                                        "truncate opacity-70",
                                        size === "lg" ? "text-sm" : "text-xs",
                                        classNames?.subtitle
                                    )}
                                >
                                    {user?.email}
                                </span>
                            )}
                    </>
                )}
            </div>
        </div>
    )
}
