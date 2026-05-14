import type { ComponentPropsWithRef } from "react"

export function Solid(props: ComponentPropsWithRef<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 166 155"
      aria-label="Solid"
      role="img"
      {...props}
    >
      <path
        fill="currentColor"
        d="M83.1 0 0 47.8l41.2 23.7 82.8-47.8L83.1 0Zm0 47.2L0 95l41.2 23.8L124 71 83.1 47.2Zm41.2 23.8-41.2 23.8 41.2 23.8 41.2-23.8L124.3 71ZM41.2 118.8 83.1 143l41.2-23.8-41.2-23.8-41.9 23.4Z"
      />
    </svg>
  )
}
