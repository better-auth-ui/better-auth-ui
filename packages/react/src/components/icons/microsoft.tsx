import type { ComponentPropsWithRef, JSX } from "react"

/**
 * Renders the Microsoft four-quadrant logo as an inline SVG.
 *
 * @param props - Props forwarded to the root `<svg>` element (ComponentPropsWithRef<"svg">), e.g., `className`, `style`, and other SVG attributes.
 * @returns An `svg` element containing the four colored paths that form the Microsoft logo.
 */
export function Microsoft(props: ComponentPropsWithRef<"svg">): JSX.Element {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      role="img"
      aria-label="Microsoft"
      {...props}
    >
      <path fill="#f1511b" d="M121.666 121.666H0V0h121.666z" />
      <path fill="#80cc28" d="M256 121.666H134.335V0H256z" />
      <path fill="#00adef" d="M121.663 256.002H0V134.336h121.663z" />
      <path fill="#fbbc09" d="M256 256.002H134.335V134.336H256z" />
    </svg>
  )
}
