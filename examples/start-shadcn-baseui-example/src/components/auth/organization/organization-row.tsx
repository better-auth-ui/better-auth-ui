"use client"

import {
  type OrganizationAuthClient,
  useAuth,
  useAuthPlugin,
  useSetActiveOrganization
} from "@better-auth-ui/react"
import type { Organization } from "better-auth/client"
import { Settings as SettingsIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { organizationPlugin } from "@/lib/auth/organization-plugin"
import { OrganizationView } from "./organization-view"

export type OrganizationRowProps = {
  organization: Organization
}

/**
 * Single organization row: logo and labels via `OrganizationView`, plus a Manage action.
 */
export function OrganizationRow({ organization }: OrganizationRowProps) {
  const { authClient, basePaths, navigate } = useAuth()
  const {
    localization: organizationLocalization,
    viewPaths: organizationViewPaths,
    slug,
    slugPrefix
  } = useAuthPlugin(organizationPlugin)

  const { mutate: setActiveOrganization, isPending: setActivePending } =
    useSetActiveOrganization(authClient as OrganizationAuthClient, {
      onSuccess: () => {
        navigate({
          to: `${basePaths.organization}/${organizationViewPaths.organization.settings}`
        })
      }
    })

  function manageOrganization() {
    if (slug !== undefined) {
      navigate({
        to: `${basePaths.organization}/${slugPrefix}${organization.slug}/${organizationViewPaths.organization.settings}`
      })
    } else {
      setActiveOrganization({ organizationId: organization.id })
    }
  }

  return (
    <div className="flex items-center gap-3">
      <OrganizationView organization={organization} />

      <Button
        className="ml-auto shrink-0"
        variant="outline"
        size="sm"
        disabled={setActivePending}
        onClick={manageOrganization}
        aria-label={organizationLocalization.manage}
      >
        {setActivePending ? <Spinner /> : <SettingsIcon />}

        {organizationLocalization.manage}
      </Button>
    </div>
  )
}
