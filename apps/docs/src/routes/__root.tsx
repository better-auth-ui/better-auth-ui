import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts
} from "@tanstack/react-router"
import { RootProvider } from "fumadocs-ui/provider/tanstack"
import type * as React from "react"
import { Toaster } from "sonner"

import SearchDialog from "@/components/search"

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8"
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1"
      },
      {
        title: "Better Auth UI"
      },
      {
        name: "apple-mobile-web-app-title",
        content: "Better Auth UI"
      }
    ],
    links: [
      {
        rel: "icon",
        type: "image/png",
        href: "/favicon-96x96.png",
        sizes: "96x96"
      },
      {
        rel: "icon",
        type: "image/svg+xml",
        href: "/favicon.svg"
      },
      {
        rel: "shortcut icon",
        href: "/favicon.ico"
      },
      {
        rel: "apple-touch-icon",
        href: "/apple-touch-icon.png",
        sizes: "180x180"
      },
      {
        rel: "manifest",
        href: "/site.webmanifest"
      }
    ]
  }),
  component: RootComponent
})

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="flex flex-col min-h-svh antialiased">
        <RootProvider search={{ SearchDialog }}>{children}</RootProvider>
        <Toaster />
        <Scripts />
      </body>
    </html>
  )
}
