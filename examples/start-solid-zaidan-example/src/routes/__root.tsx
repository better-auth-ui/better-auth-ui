import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts
} from "@tanstack/solid-router"
import type { JSX } from "solid-js"
import { onCleanup, onMount } from "solid-js"
import { HydrationScript } from "solid-js/web"

import { AuthProvider } from "@/components/auth/auth-provider"
import { Header } from "@/components/header"
import { syncDocumentThemePreference, themeScript } from "@/lib/theme"

import "../styles/globals.css"

export const Route = createRootRoute({
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
  onMount(() => {
    const cleanup = syncDocumentThemePreference()

    onCleanup(cleanup)
  })

  return (
    <html lang="en">
      <head>
        <script>{themeScript}</script>
        <HydrationScript />
      </head>
      <body class="antialiased min-h-svh flex flex-col bg-background text-foreground">
        <HeadContent />
        <AuthProvider>
          {() => (
            <>
              <Header />
              <main class="grow flex flex-col">{props.children}</main>
            </>
          )}
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  )
}
