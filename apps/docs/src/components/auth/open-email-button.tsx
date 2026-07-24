"use client"

import { getEmailProviderLink } from "@better-auth-ui/core"
import { useAuth } from "@better-auth-ui/react"
import { SquareArrowOutUpRight } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type OpenEmailButtonProps = {
  /** Email address used to detect the provider, e.g. from the verify-email flow. */
  email: string
  className?: string
}

/**
 * Render a link styled as a button that opens the user's email provider login
 * page in a new tab.
 *
 * The provider is resolved from the email domain via the curated
 * `@mikkelscheike/email-provider-links` dataset (Gmail, Outlook, GMX, etc.).
 * Renders nothing when the domain is empty or not a known provider.
 *
 * @param email - Email address to resolve the provider from.
 * @param className - Additional CSS classes applied to the link.
 * @returns The open-email link element, or `null` when no provider matches.
 */
export function OpenEmailButton({ email, className }: OpenEmailButtonProps) {
  const { localization } = useAuth()

  const provider = getEmailProviderLink(email)
  if (!provider) return null

  return (
    <a
      href={provider.loginUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(buttonVariants(), "w-full", className)}
    >
      {localization.auth.openEmailProvider.replace(
        "{{provider}}",
        provider.companyProvider
      )}

      <SquareArrowOutUpRight />
    </a>
  )
}
