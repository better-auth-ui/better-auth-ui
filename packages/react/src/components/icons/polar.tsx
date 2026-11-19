import type { ComponentPropsWithRef, JSX } from "react"

/**
 * Renders the "Polar" SVG icon.
 *
 * @param props - Props spread onto the root `<svg>` element (for example `className`, `style`, `ref`, and event handlers)
 * @returns The SVG element representing the Polar icon
 */
export function Polar(props: ComponentPropsWithRef<"svg">): JSX.Element {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      role="img"
      aria-label="Polar"
      {...props}
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      >
        <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10s-4.477 10-10 10"></path>
        <path d="M12 22c-2.21 0-4-4.477-4-10S9.79 2 12 2s4 4.477 4 10s-1.79 10-4 10"></path>
        <path d="M9 21c-3-1-4-5.389-4-8.5s1.5-7 5-9.5m5 0c3 1 4 5.389 4 8.5s-1.5 7-5 9.5"></path>
      </g>
    </svg>
  )
}
