import type { ComponentProps } from "solid-js"

export function Logo(props: ComponentProps<"svg">) {
  return (
    <svg
      aria-label="Better Auth UI"
      class="size-5"
      fill="none"
      role="img"
      viewBox="0 0 60 45"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        clip-rule="evenodd"
        d="M0 0H15V45H0V0ZM45 0H60V45H45V0ZM20 0H40V15H20V0ZM20 30H40V45H20V30Z"
        fill="currentColor"
        fill-rule="evenodd"
      />
    </svg>
  )
}
