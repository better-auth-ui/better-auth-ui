import type { ComponentPropsWithRef } from "react"

export function Shadcn(props: ComponentPropsWithRef<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={32}
      height={32}
      viewBox="0 0 32 32"
      aria-label="shadcn/ui"
      role="img"
      {...props}
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth={4.48}
        d="m27.76 16.56l-11.2 11.2m8.96-23.52L4.24 25.52"
      ></path>
    </svg>
  )
}
