import type { ComponentPropsWithRef, JSX } from "react"

/**
 * Render a Roblox SVG icon and forward incoming SVG props to the root element.
 *
 * The rendered SVG is labeled "Roblox" for accessibility and uses a single filled path
 * with the Roblox visual mark.
 *
 * @param props - Props are spread onto the root `<svg>` element to allow customization (className, style, width, height, etc.).
 * @returns An SVG element containing the Roblox icon
 */
export function Roblox(props: ComponentPropsWithRef<"svg">): JSX.Element {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 500 500"
      role="img"
      aria-label="Roblox"
      {...props}
    >
      <path
        fill="#42a5f5"
        d="m127.87 38.084l334.05 89.432l-36.055 135.03l-199.37-53.377l-10.251 38.177l-134.68-36.056zm244.26 423.83L38.08 372.482l36.056-135.03l199.01 53.377l10.251-38.176l135.03 36.055z"
        clipRule="evenodd"
      />
    </svg>
  )
}
