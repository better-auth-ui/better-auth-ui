import { createQrCodeSvgData, getEmailProviderLink } from "@better-auth-ui/core"
import { useAuth } from "@better-auth-ui/react"
import { QrCode } from "@gravity-ui/icons"
import { type ButtonProps, cn, Tooltip } from "@heroui/react"
import { buttonVariants } from "@heroui/styles"
import { useMemo } from "react"

export type OpenEmailButtonProps = {
  /** Email address used to detect the provider, e.g. from the verify-email flow. */
  email: string
  className?: string
  /**
   * Button variant. Defaults to `"primary"` for dead-end views where opening
   * the inbox is the only action; pass `"secondary"` where it sits beside a
   * submit button that should stay the primary call to action.
   * @remarks `ButtonProps["variant"]`
   */
  variant?: ButtonProps["variant"]
}

/**
 * Render a link styled as a button that opens the user's email provider login
 * page in a new tab. Hovering or focusing the link reveals a QR code for
 * opening the same provider on another device.
 *
 * The provider is resolved from the email domain via the curated
 * `@mikkelscheike/email-provider-links` dataset (Gmail, Outlook, GMX, etc.).
 * Renders nothing when the domain is empty or not a known provider.
 *
 * @param email - Email address to resolve the provider from.
 * @param className - Additional CSS classes applied to the link.
 * @param variant - Button variant. Defaults to `"primary"`.
 * @returns The open-email link element, or `null` when no provider matches.
 */
export function OpenEmailButton({
  email,
  className,
  variant = "primary"
}: OpenEmailButtonProps) {
  const { localization } = useAuth()

  const provider = getEmailProviderLink(email)
  const loginUrl = provider?.loginUrl
  const qrCode = useMemo(
    () => (loginUrl ? createQrCodeSvgData(loginUrl) : null),
    [loginUrl]
  )

  if (!provider || !qrCode) return null

  const scanLabel = localization.auth.scanToOpenEmailProvider.replace(
    "{{provider}}",
    provider.companyProvider
  )

  return (
    <Tooltip delay={0}>
      <Tooltip.Trigger<"a">
        render={({ role: _triggerRole, ...triggerProps }) => (
          <a
            {...triggerProps}
            href={provider.loginUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              triggerProps.className,
              buttonVariants({ variant }),
              "w-full gap-2",
              className
            )}
          />
        )}
      >
        {localization.auth.openEmailProvider.replace(
          "{{provider}}",
          provider.companyProvider
        )}
        <QrCode className="size-3" />
      </Tooltip.Trigger>
      <Tooltip.Content showArrow className="p-3">
        <Tooltip.Arrow />
        <div className="flex flex-col items-center gap-2">
          <svg
            viewBox={`0 0 ${qrCode.size} ${qrCode.size}`}
            aria-hidden="true"
            className="size-40"
          >
            <path fill="white" d={`M0 0h${qrCode.size}v${qrCode.size}H0z`} />
            <path fill="black" d={qrCode.path} shapeRendering="crispEdges" />
          </svg>
          <p className="max-w-40 text-center text-xs leading-snug">
            {scanLabel}
          </p>
        </div>
      </Tooltip.Content>
    </Tooltip>
  )
}
