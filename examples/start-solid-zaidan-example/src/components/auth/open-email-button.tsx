import { getEmailProviderLink } from "@better-auth-ui/core"
import { useAuth } from "@better-auth-ui/solid"
import { SquareArrowOutUpRight } from "lucide-solid"
import { Show } from "solid-js"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type OpenEmailButtonProps = {
  email: string
  class?: string
}

/**
 * Link styled as a button that opens the user's email provider login page in a
 * new tab. The provider is resolved from the email domain via the curated
 * `@mikkelscheike/email-provider-links` dataset (Gmail, Outlook, GMX, etc.) and
 * nothing is rendered when the domain is empty or not a known provider.
 */
export function OpenEmailButton(props: OpenEmailButtonProps) {
  const auth = useAuth()
  const provider = () => getEmailProviderLink(props.email)

  return (
    <Show when={provider()} keyed>
      {(emailProvider) => (
        <a
          class={cn(buttonVariants(), "w-full", props.class)}
          href={emailProvider.loginUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          {auth.localization.auth.openEmailProvider.replace(
            "{{provider}}",
            emailProvider.companyProvider
          )}
          <SquareArrowOutUpRight />
        </a>
      )}
    </Show>
  )
}
