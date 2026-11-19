import type { ComponentPropsWithRef, JSX } from "react"

/**
 * Renders the Vercel logo as an SVG icon.
 *
 * @param props - Props forwarded to the root `<svg>` element (e.g., className, style, width, height, aria-*).
 * @returns An SVG element representing the Vercel logo.
 */
export function Vercel(props: ComponentPropsWithRef<"svg">): JSX.Element {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      role="img"
      aria-label="Vercel"
      {...props}
    >
      <path fill="currentColor" d="M23 21.648H1L12 2.352z" />
    </svg>
  )
}
