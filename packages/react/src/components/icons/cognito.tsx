import type { ComponentPropsWithRef, JSX } from "react"

/**
 * Renders the Cognito SVG icon as a React component.
 *
 * @param props - Props passed through to the underlying `svg` element (accepts standard SVG attributes and ref).
 * @returns A React `svg` element displaying the Cognito icon
 */
export function Cognito(props: ComponentPropsWithRef<"svg">): JSX.Element {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      role="img"
      aria-label="Cognito"
      {...props}
    >
      <path
        fill="currentColor"
        d="M24 4L6 14v20l18 10 18-10V14L24 4zm0 4.62l13.6 7.86v15.04L24 39.38 10.4 31.52V16.48L24 8.62z"
      ></path>
      <path fill="currentColor" d="M22 14h4v20h-4zM14 22h20v4H14z"></path>
    </svg>
  )
}
