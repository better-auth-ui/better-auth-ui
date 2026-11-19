import type { ComponentPropsWithRef, JSX } from "react"

/**
 * Renders an "X" icon as an SVG React component.
 *
 * @param props - Props to spread onto the underlying `svg` element (e.g., className, style, ref).
 * @returns The SVG element representing the "X" icon with its path filled by `currentColor`.
 */
export function X(props: ComponentPropsWithRef<"svg">): JSX.Element {
  return (
    <svg
      viewBox="0 0 512 512"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="X"
      {...props}
    >
      <path
        d="M389.2 48h70.6L305.6 224.2L487 464H345L233.7 318.6L106.5 464H35.8l164.9-188.5L26.8 48h145.6l100.5 132.9zm-24.8 373.8h39.1L151.1 88h-42z"
        fill="currentColor"
      />
    </svg>
  )
}
