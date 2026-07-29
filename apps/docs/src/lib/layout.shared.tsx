import { Discord } from "@better-auth-ui/react"
import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared"
import {
  ArrowUpRight,
  Book,
  BookOpen,
  ClockArrowDown,
  ListTodo
} from "lucide-react"
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
        icon: <ListTodo />,
        text: "Roadmap",
        url: "https://github.com/orgs/better-auth-ui/projects/1",
        external: true,
        secondary: false
      },
      {
        icon: <ClockArrowDown />,
        text: "Changelog",
        url: "https://github.com/better-auth-ui/better-auth-ui/releases",
        external: true,
        secondary: false
      },
      {
        icon: <Book />,
        text: "LLMs.txt",
        url: "/llms.txt",
        external: true,
        secondary: false
      }
    ]
  }
}
