import { Discord } from "@better-auth-ui/react"
import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared"
import { ArrowUpRight, Book, BookOpen, PanelsTopLeft } from "lucide-react"
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
    githubUrl: "https://github.com/better-auth-ui/better-auth-ui",
    links: [
      {
        icon: <BookOpen />,
        text: "Docs",
        url: "/docs",
        secondary: false
      },
      {
        type: "menu",
        icon: <PanelsTopLeft />,
        text: "Storybook",
        items: [
          {
            text: "HeroUI",
            description: "Browse the HeroUI component stories.",
            url: "/storybook/heroui/",
            external: true
          },
          {
            text: "shadcn/ui",
            description: "Browse the shadcn/ui component stories.",
            url: "/storybook/shadcn/",
            external: true
          },
          {
            text: "Zaidan",
            description: "Browse the Solid and Zaidan component stories.",
            url: "/storybook/zaidan/",
            external: true
          }
        ],
        secondary: false
      },
      {
        type: "icon",
        icon: <Discord />,
        label: "Discord",
        text: "Discord",
        url: "https://better-auth-ui.com/discord",
        external: true
      },
      {
        icon: <ArrowUpRight />,
        text: "Demo",
        url: "https://demo.better-auth-ui.com",
        external: true,
        secondary: false
      },
      {
        type: "menu",
        icon: <Book />,
        text: "Resources",
        items: [
          {
            text: "Roadmap",
            description: "See what we're planning and track progress.",
            url: "https://github.com/orgs/better-auth-ui/projects/1",
            external: true
          },
          {
            text: "Changelog",
            description: "Review releases and recent changes.",
            url: "https://github.com/better-auth-ui/better-auth-ui/releases",
            external: true
          },
          {
            text: "LLMs.txt",
            description: "Open the complete documentation in plain text.",
            url: "/llms.txt",
            external: true
          }
        ],
        secondary: false
      }
    ]
  }
}
