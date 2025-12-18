import type { ComponentPropsWithRef } from "react"

/**
 * Render the HeroUI SVG icon.
 *
 * @param props - Standard SVG props forwarded to the root `<svg>` element (e.g., `className`, `style`, ARIA attributes)
 * @returns The SVG element for the HeroUI icon
 */
export function HeroUI(props: ComponentPropsWithRef<"svg">) {
  return (
    <svg
      fill="none"
      viewBox="0 0 44 44"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="HeroUI"
      role="img"
      {...props}
    >
      <path
        d="M0.677734 11.3847V24.0405C0.677734 24.6387 0.985209 25.1946 1.49107 25.5109L10.1195 30.9067C11.2693 31.6257 12.7586 30.796 12.7586 29.4363V18.7981C12.7586 18.186 13.0803 17.6194 13.605 17.3074L18.8683 14.1785V41.4437C18.8683 42.7988 20.3486 43.6293 21.4988 42.9195L30.4044 37.4229C30.9152 37.1076 31.2264 36.549 31.2264 35.9471V9.76484C31.2264 8.41634 29.759 7.58483 28.6085 8.28139L18.8683 14.1785V2.55643C18.8683 1.21158 17.408 0.379537 16.2574 1.06878L1.51927 9.89703C0.997365 10.2097 0.677734 10.7747 0.677734 11.3847Z"
        fill="currentColor"
      ></path>
    </svg>
  )
}