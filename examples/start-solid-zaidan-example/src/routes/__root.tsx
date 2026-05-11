import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts
} from "@tanstack/solid-router"
import type { JSX } from "solid-js"

import { Header } from "@/components/header"

import "../styles/globals.css"

export const Route = createRootRoute({
  component: RootComponent,
  head: () => ({
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Start Solid Zaidan Example" }
    ]
  })
})

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}

function RootDocument(props: { children: JSX.Element }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body class="antialiased min-h-svh flex flex-col">
        <Header />
        <main class="grow flex flex-col">{props.children}</main>
        <Scripts />
      </body>
    </html>
  )
}
