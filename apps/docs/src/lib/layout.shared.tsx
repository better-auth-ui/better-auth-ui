import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared"
import { Logo } from "@/components/icons/logo"

/**
 * Create the default layout configuration used by the documentation site.
 *
 * @returns A BaseLayoutProps object with a navigation title (Logo and "BETTER-AUTH. UI"), `themeSwitch.mode` set to "light-dark-system", and `githubUrl` pointing to the repository.
 */
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