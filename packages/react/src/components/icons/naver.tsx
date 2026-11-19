import type { ComponentPropsWithRef, JSX } from "react"

/**
 * Renders the Naver brand SVG icon.
 *
 * @param props - Props applied to the root `<svg>` element (standard SVG attributes and event handlers are supported)
 * @returns An SVG element representing the Naver logo
 */
export function Naver(props: ComponentPropsWithRef<"svg">): JSX.Element {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      role="img"
      aria-label="Naver"
      {...props}
    >
      <path
        fill="currentColor"
        d="M16.273 12.845L7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727z"
      />
    </svg>
  )
}
