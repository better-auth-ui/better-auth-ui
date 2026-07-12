import { getEmailProviderLink } from "@better-auth-ui/core"
import { useAuth } from "@better-auth-ui/react"
import { Linking } from "react-native"
import { cn } from "../../lib/cn"
import { Button } from "../../primitives/button"
import { ArrowUpRightFromSquare } from "../../primitives/ui-icons"

export type OpenEmailButtonProps = {
  /** Email address used to detect the provider, e.g. from the verify-email flow. */
  email: string
  className?: string
}

/**
 * Render a button that opens the user's email provider login page.
 *
 * The provider is resolved from the email domain via the curated
 * `@mikkelscheike/email-provider-links` dataset (Gmail, Outlook, GMX, etc.).
 * Renders nothing when the domain is empty or not a known provider.
 *
 * @param email - Email address to resolve the provider from.
 * @param className - Additional CSS classes applied to the button.
 * @returns The open-email button element, or `null` when no provider matches.
 */
export function OpenEmailButton({ email, className }: OpenEmailButtonProps) {
  const { localization } = useAuth()

  const provider = getEmailProviderLink(email)
  if (!provider) return null

  return (
    <Button
      variant="primary"
      className={cn("w-full", className)}
      onPress={() => Linking.openURL(provider.loginUrl)}
    >
      <ArrowUpRightFromSquare width={18} height={18} color="#ffffff" />
      {localization.auth.openEmailProvider.replace(
        "{{provider}}",
        provider.companyProvider
      )}
    </Button>
  )
}
