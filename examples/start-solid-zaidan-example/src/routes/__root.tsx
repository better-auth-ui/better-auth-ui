import type { QueryClient } from "@tanstack/solid-query"
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts
} from "@tanstack/solid-router"
import type { JSX } from "solid-js"
import { HydrationScript } from "solid-js/web"

import { Header } from "@/components/header"
import { Providers } from "@/components/providers"
import { themeScript } from "@/lib/theme"

import "../styles/globals.css"

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  component: RootComponent,
  head: () => ({
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Start Solid Zaidan Example" }
    ]
  }),
  shellComponent: RootDocument
})

function RootComponent() {
  return <Outlet />
}

function RootDocument(props: { children: JSX.Element }) {
  const routeContext = Route.useRouteContext()

  return (
    <html lang="en">
      <head>
        <script>{themeScript}</script>
        <HydrationScript />
      </head>
      <body class="antialiased min-h-svh flex flex-col bg-background text-foreground">
        <HeadContent />
        <Providers queryClient={routeContext().queryClient}>
          {() => (
            <>
              <Header />
              <main class="grow flex flex-col">{props.children}</main>
            </>
          )}
        </Providers>
        <Scripts />
      </body>
    </html>
  )
}
