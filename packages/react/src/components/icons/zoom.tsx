import { type ComponentPropsWithRef, type JSX, useId } from "react"

/**
 * Renders a stylized "Zoom" SVG icon featuring a blue multi-stop gradient and a white interior highlight.
 *
 * @param props - Props are forwarded to the root `<svg>` element (e.g., className, style, width, height, aria-*).
 * @returns The SVG element for the Zoom icon.
 */
export function Zoom(props: ComponentPropsWithRef<"svg">): JSX.Element {
  const gradientId = useId()
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      role="img"
      aria-label="Zoom"
      {...props}
    >
      <defs>
        <linearGradient
          id={gradientId}
          x1="23.666%"
          x2="76.334%"
          y1="95.612%"
          y2="4.388%"
        >
          <stop offset="0%" stopColor="#0845bf" />
          <stop offset="19.11%" stopColor="#0950de" />
          <stop offset="38.23%" stopColor="#0b59f6" />
          <stop offset="50%" stopColor="#0b5cff" />
          <stop offset="67.32%" stopColor="#0e5efe" />
          <stop offset="77.74%" stopColor="#1665fc" />
          <stop offset="86.33%" stopColor="#246ff9" />
          <stop offset="93.88%" stopColor="#387ff4" />
          <stop offset="100%" stopColor="#4f90ee" />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${gradientId})`}
        d="M256 128c0 13.568-1.024 27.136-3.328 40.192c-6.912 43.264-41.216 77.568-84.48 84.48C155.136 254.976 141.568 256 128 256s-27.136-1.024-40.192-3.328c-43.264-6.912-77.568-41.216-84.48-84.48C1.024 155.136 0 141.568 0 128s1.024-27.136 3.328-40.192c6.912-43.264 41.216-77.568 84.48-84.48C100.864 1.024 114.432 0 128 0s27.136 1.024 40.192 3.328c43.264 6.912 77.568 41.216 84.48 84.48C254.976 100.864 256 114.432 256 128"
      />
      <path
        fill="#fff"
        d="M204.032 207.872H75.008c-8.448 0-16.64-4.608-20.48-12.032c-4.608-8.704-2.816-19.2 4.096-26.112l89.856-89.856H83.968c-17.664 0-32-14.336-32-32h118.784c8.448 0 16.64 4.608 20.48 12.032c4.608 8.704 2.816 19.2-4.096 26.112l-89.6 90.112h74.496c17.664 0 32 14.08 32 31.744"
      />
    </svg>
  )
}
