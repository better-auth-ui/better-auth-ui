import { createQrCodeSvgData, getEmailProviderLink } from "@better-auth-ui/core"
import { useAuth } from "@better-auth-ui/solid"
import { QrCode } from "lucide-solid"
import { Show } from "solid-js"
import { type ButtonProps, buttonVariants } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export type OpenEmailButtonProps = {
  email: string
  class?: string
  /**
   * Button variant. Defaults to the primary style for dead-end views where
   * opening the inbox is the only action; pass `"secondary"` where it sits
   * beside a submit button that should stay the primary call to action.
   */
  variant?: ButtonProps["variant"]
}

/**
 * Button that opens the user's email provider login page in a new tab.
 * Hovering or focusing the button reveals a QR code for opening the same
 * provider on another device. The provider is resolved from the email domain
 * via the curated `@mikkelscheike/email-provider-links` dataset (Gmail,
 * Outlook, GMX, etc.) and nothing is rendered when the domain is empty or not
 * a known provider.
 */
export function OpenEmailButton(props: OpenEmailButtonProps) {
  const auth = useAuth()
  const provider = () => getEmailProviderLink(props.email)

  return (
    <Show when={provider()} keyed>
      {(emailProvider) => {
        const scanLabel =
          auth.localization.auth.scanToOpenEmailProvider.replace(
            "{{provider}}",
            emailProvider.companyProvider
          )
        const qrCode = createQrCodeSvgData(emailProvider.loginUrl)

        return (
          <Tooltip>
            <TooltipTrigger
              type="button"
              class={cn(
                buttonVariants({ variant: props.variant }),
                "w-full",
                props.class
              )}
              onClick={() =>
                window.open(
                  emailProvider.loginUrl,
                  "_blank",
                  "noopener,noreferrer"
                )
              }
            >
              {auth.localization.auth.openEmailProvider.replace(
                "{{provider}}",
                emailProvider.companyProvider
              )}
              <QrCode />
            </TooltipTrigger>
            <TooltipContent class="flex flex-col items-center gap-2 p-3">
              <svg
                viewBox={`0 0 ${qrCode.size} ${qrCode.size}`}
                aria-hidden="true"
                class="size-40"
              >
                <path
                  fill="white"
                  d={`M0 0h${qrCode.size}v${qrCode.size}H0z`}
                />
                <path
                  fill="black"
                  d={qrCode.path}
                  shape-rendering="crispEdges"
                />
              </svg>
              <p class="max-w-40 text-center leading-snug">{scanLabel}</p>
            </TooltipContent>
          </Tooltip>
        )
      }}
    </Show>
  )
}
