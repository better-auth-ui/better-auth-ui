import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared"
import { Logo } from "@/components/icons/logo"

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <>
          <Logo className="size-5" />
          BETTER-AUTH. UI
        </>
      )
    },
    themeSwitch: {
      mode: "light-dark-system"
    },
    githubUrl: "https://github.com/better-auth-ui/better-auth-ui"
  }
}
