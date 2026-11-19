import type { ComponentPropsWithRef, JSX } from "react"

/**
 * Renders the Kick icon as an inline SVG.
 *
 * The root SVG uses viewBox "0 0 512 512" and aria-label "Kick"; received props are spread onto the SVG and can override attributes or receive a ref.
 *
 * @param props - Props forwarded to the root SVG element
 * @returns The SVG element for the Kick icon
 */
export function Kick(props: ComponentPropsWithRef<"svg">): JSX.Element {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      role="img"
      aria-label="Kick"
      fillRule="evenodd"
      clipRule="evenodd"
      strokeLinejoin="round"
      strokeMiterlimit={2}
      {...props}
    >
      <path
        d="M37 .036h164.448v113.621h54.71v-56.82h54.731V.036h164.448v170.777h-54.73v56.82h-54.711v56.8h54.71v56.82h54.73V512.03H310.89v-56.82h-54.73v-56.8h-54.711v113.62H37V.036z"
        fill="#00E701"
      />
    </svg>
  )
}
