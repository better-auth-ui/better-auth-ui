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
        icon: <ArrowUpRight />,
        text: "Demo",
        url: "https://demo.better-auth-ui.com",
        external: true,
        secondary: false
      },
      {
        icon: <ListTodo />,
        text: "Roadmap",
        url: "https://betterauthui.featurebase.app/roadmap",
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
