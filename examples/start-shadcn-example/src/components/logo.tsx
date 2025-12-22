import type { ComponentPropsWithRef } from "react"

export function Logo(props: ComponentPropsWithRef<"svg">) {
  return (
    <svg
      className="size-5"
      fill="none"
      viewBox="0 0 60 45"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Better Auth UI"
      role="img"
      {...props}
    >
      <path
        fill="currentColor"
        clipRule="evenodd"
        d="M0 0H15V45H0V0ZM45 0H60V45H45V0ZM20 0H40V15H20V0ZM20 30H40V45H20V30Z"
        fillRule="evenodd"
      />
    </svg>
  )
}
