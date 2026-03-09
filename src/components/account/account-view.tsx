"use client"

import { MenuIcon } from "lucide-react"
import { useContext, useMemo } from "react"
import { useAuthenticate } from "../../hooks/use-authenticate"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import { cn, getViewByPath } from "../../lib/utils"
import type { AuthLocalization } from "../../localization/auth-localization"
import type { AccountViewPath } from "../../server"
import { OrganizationsCard } from "../organization/organizations-card"
import { UserInvitationsCard } from "../organization/user-invitations-card"
import { AccountSettingsCards } from "../settings/account-settings-cards"
import { ApiKeysCard } from "../settings/api-key/api-keys-card"
import { SecuritySettingsCards } from "../settings/security-settings-cards"
import type { SettingsCardClassNames } from "../settings/shared/settings-card"
import { UserTeamsCard } from "../settings/teams/user-teams-card"
import { Button } from "../ui/button"
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger
} from "../ui/drawer"
import { Label } from "../ui/label"

export interface AccountViewProps {
    className?: string
    classNames?: {
        base?: string
        cards?: string
        drawer?: { menuItem?: string }
        sidebar?: { base?: string; button?: string; buttonActive?: string }
        card?: SettingsCardClassNames
    }
    localization?: AuthLocalization
    path?: string
    pathname?: string
    view?: AccountViewPath
    hideNav?: boolean
    showTeams?: boolean
}

export function AccountView({
    className,
    classNames,
    localization: localizationProp,
    path: pathProp,
    pathname,
    view: viewProp,
    hideNav,
    showTeams
}: AccountViewProps) {
    const {
        apiKey,
        teams: teamOptions,
        localization: contextLocalization,
        organization,
        account: accountOptions,
        Link
    } = useContext(AuthUIContext)

    if (!accountOptions) {
        return null
    }
    const { enabled: teamsEnabled } = teamOptions || {}

    useAuthenticate()

    const localization = useMemo(
        () => ({ ...contextLocalization, ...localizationProp }),
        [contextLocalization, localizationProp]
    )

    const path = pathProp ?? pathname?.split("/").pop()

    const view =
        viewProp || getViewByPath(accountOptions.viewPaths, path!) || "SETTINGS"

    const navItems: {
        view: AccountViewPath
        label: string
    }[] = [
        { view: "SETTINGS", label: localization.ACCOUNT },
        { view: "SECURITY", label: localization.SECURITY }
    ]

    if (teamsEnabled && showTeams) {
        navItems.push({
            view: "TEAMS",
            label: localization.TEAMS
        })
    }

    if (apiKey) {
        navItems.push({
            view: "API_KEYS",
            label: localization.API_KEYS
        })
    }

    if (organization) {
        navItems.push({
            view: "ORGANIZATIONS",
            label: localization.ORGANIZATIONS
        })
    }

    return (
        <div
            className={cn(
                "flex w-full grow flex-col gap-4 md:flex-row md:gap-12",
                className,
                classNames?.base
            )}
        >
            {!hideNav && (
                <div className="flex justify-between gap-2 md:hidden">
                    <Label className="font-semibold text-base">
                        {navItems.find((i) => i.view === view)?.label}
                    </Label>

                    <Drawer>
                        <DrawerTrigger asChild>
                            <Button variant="outline">
                                <MenuIcon />
                            </Button>
                        </DrawerTrigger>
                        <DrawerContent>
                            <DrawerHeader>
                                <DrawerTitle className="hidden">
                                    {localization.SETTINGS}
                                </DrawerTitle>
                            </DrawerHeader>
                            <div className="flex flex-col px-4 pb-4">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.view}
                                        href={`${accountOptions?.basePath}/${accountOptions?.viewPaths[item.view]}`}
                                    >
                                        <Button
                                            size="lg"
                                            className={cn(
                                                "w-full justify-start px-4 transition-none",
                                                classNames?.drawer?.menuItem,
                                                view === item.view
                                                    ? "font-semibold"
                                                    : "text-foreground/70"
                                            )}
                                            variant="ghost"
                                        >
                                            {item.label}
                                        </Button>
                                    </Link>
                                ))}
                            </div>
                        </DrawerContent>
                    </Drawer>
                </div>
            )}

            {!hideNav && (
                <div className="hidden md:block">
                    <div
                        className={cn(
                            "flex w-48 flex-col gap-1 lg:w-60",
                            classNames?.sidebar?.base
                        )}
                    >
                        {navItems.map((item) => (
                            <Link
                                key={item.view}
                                href={`${accountOptions?.basePath}/${accountOptions?.viewPaths[item.view]}`}
                            >
                                <Button
                                    size="lg"
                                    className={cn(
                                        "w-full justify-start px-4 transition-none",
                                        classNames?.sidebar?.button,
                                        view === item.view
                                            ? "font-semibold"
                                            : "text-foreground/70",
                                        view === item.view &&
                                            classNames?.sidebar?.buttonActive
                                    )}
                                    variant="ghost"
                                >
                                    {item.label}
                                </Button>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {view === "SETTINGS" && (
                <AccountSettingsCards
                    classNames={classNames}
                    localization={localization}
                />
            )}

            {view === "SECURITY" && (
                <SecuritySettingsCards
                    classNames={classNames}
                    localization={localization}
                />
            )}

            {view === "TEAMS" && teamsEnabled && showTeams && (
                <UserTeamsCard
                    classNames={classNames}
                    localization={localization}
                />
            )}

            {view === "API_KEYS" && (
                <ApiKeysCard
                    classNames={classNames?.card}
                    localization={localization}
                />
            )}

            {view === "ORGANIZATIONS" && organization && (
                <div className="grid w-full gap-4 md:gap-6">
                    <OrganizationsCard
                        classNames={classNames?.card}
                        localization={localization}
                    />

                    <UserInvitationsCard
                        classNames={classNames?.card}
                        localization={localization}
                    />
                </div>
            )}
        </div>
    )
}
