import type { ComponentPropsWithRef } from "react"

/**
 * Render the Next.js logo as an SVG element.
 *
 * The rendered SVG includes accessibility attributes (`aria-label="Next.js"`, `role="img"`),
 * a viewBox of `0 0 128 128`, and a single path that uses `currentColor` so the icon inherits text color.
 *
 * @param props - Standard SVG props (including `ref`) which are spread onto the root `<svg>` element
 * @returns The SVG element for the Next.js logo
 */
export function NextJS(props: ComponentPropsWithRef<"svg">) {
  return (
    <svg
      viewBox="0 0 128 128"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Next.js"
      role="img"
      {...props}
    >
      <path
        d="M64 0A64 64 0 0 0 0 64a64 64 0 0 0 64 64a64 64 0 0 0 35.508-10.838L47.014 49.34v40.238H38.4V38.4h10.768l57.125 73.584A64 64 0 0 0 128 64A64 64 0 0 0 64 0m17.777 38.4h8.534v48.776L81.777 75.97Zm24.18 73.92l-.111.096z"
        fill="currentColor"
      />
    </svg>
  )
}