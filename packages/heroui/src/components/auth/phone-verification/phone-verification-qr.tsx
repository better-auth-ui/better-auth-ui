import { cn } from "@heroui/react"
import { useMemo } from "react"
import { encode } from "uqr"

export type PhoneVerificationQrProps = {
  /** Value encoded into the QR code (the WhatsApp deep link). */
  value: string
  /** Accessible label describing the QR code. */
  label: string
  /**
   * Rendered size in pixels.
   * @default 192
   */
  size?: number
  className?: string
}

/**
 * Render a QR code as an inline SVG.
 *
 * Drawn on a white tile with black modules regardless of theme — QR codes
 * must keep dark-on-light contrast to stay scannable in dark mode.
 *
 * @param value - Value encoded into the QR code.
 * @param label - Accessible label announced to screen readers.
 * @param size - Rendered size in pixels. Defaults to `192`.
 */
export function PhoneVerificationQr({
  value,
  label,
  size = 192,
  className
}: PhoneVerificationQrProps) {
  const qr = useMemo(() => encode(value, { ecc: "M", border: 0 }), [value])

  const path = useMemo(() => {
    const segments: string[] = []

    for (let y = 0; y < qr.size; y++) {
      for (let x = 0; x < qr.size; x++) {
        if (qr.data[y][x]) segments.push(`M${x} ${y}h1v1h-1z`)
      }
    }

    return segments.join("")
  }, [qr])

  return (
    <div
      className={cn(
        "inline-flex rounded-xl border border-black/10 bg-white p-3",
        className
      )}
    >
      <svg
        viewBox={`0 0 ${qr.size} ${qr.size}`}
        width={size}
        height={size}
        role="img"
        aria-label={label}
        shapeRendering="crispEdges"
      >
        <path d={path} fill="#000" />
      </svg>
    </div>
  )
}
