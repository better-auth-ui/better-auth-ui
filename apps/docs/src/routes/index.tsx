import { createFileRoute, Link } from "@tanstack/react-router"
import { HomeLayout } from "fumadocs-ui/layouts/home"
import {
  ArrowRight,
  Check,
  Copy,
  Github,
  LayoutTemplate,
  ShieldCheck,
  Zap
} from "lucide-react"
import { useState } from "react"
import { baseOptions } from "@/lib/layout.shared"
import appCss from "@/styles/app.css?url"

export const Route = createFileRoute("/")({
  head: () => ({
    links: [{ rel: "stylesheet", href: appCss }]
  }),
  component: Home
})

function Home() {
  const [copiedShadcn, setCopiedShadcn] = useState(false)
  const [copiedHeroui, setCopiedHeroui] = useState(false)

  const copyShadcnCommand = () => {
    navigator.clipboard.writeText(
      "bunx shadcn@latest add https://better-auth-ui.com/r/auth.json"
    )
    setCopiedShadcn(true)
    setTimeout(() => setCopiedShadcn(false), 2000)
  }

  const copyHeroUiCommand = () => {
    navigator.clipboard.writeText("bun add @better-auth-ui/heroui")
    setCopiedHeroui(true)
    setTimeout(() => setCopiedHeroui(false), 2000)
  }

  return (
    <HomeLayout {...baseOptions()}>
      <div className="relative grow overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-neutral-50 dark:bg-neutral-950" />

        {/* Gradient orbs */}
        <div className="absolute top-0 left-1/4 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500/20 blur-[120px] dark:bg-orange-500/10" />
        <div className="absolute right-0 top-1/3 h-[400px] w-[400px] translate-x-1/2 rounded-full bg-amber-500/15 blur-[100px] dark:bg-amber-500/5" />

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-size-[24px_24px] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center px-6 py-12 text-center sm:pt-24 lg:pt-32">
          {/* Badge */}
          <div className="group mb-8 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-1.5 text-sm text-neutral-600 transition-all hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:border-neutral-700">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-500" />
            </span>
            Open Source • MIT Licensed
          </div>

          {/* Main heading */}
          <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl lg:text-7xl dark:text-white">
            <span className="bg-linear-to-r from-neutral-900 to-orange-700 bg-clip-text text-transparent dark:from-white dark:to-orange-300/80">
              Better
            </span>{" "}
            Auth UI
          </h1>

          {/* Tagline */}
          <p className="mt-6 max-w-2xl text-lg text-neutral-600 sm:text-xl dark:text-neutral-400">
            Beautiful, ready-to-use authentication components for{" "}
            <a
              href="https://better-auth.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-neutral-900 underline decoration-orange-500/50 underline-offset-4 transition-colors hover:text-orange-600 dark:text-white dark:hover:text-orange-400"
            >
              Better Auth
            </a>
            . Built with shadcn/ui and HeroUI. Drop in and go.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/docs"
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-neutral-900/25 transition-all hover:bg-neutral-800 hover:shadow-xl hover:shadow-neutral-900/30 dark:bg-white dark:text-neutral-900 dark:shadow-white/5 dark:hover:bg-neutral-100 dark:hover:shadow-white/10"
            >
              Get Started
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="https://github.com/better-auth-ui/better-auth-ui"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white/80 px-6 py-3 text-sm font-semibold text-neutral-700 backdrop-blur-sm transition-all hover:border-neutral-300 hover:bg-white dark:border-neutral-800 dark:bg-neutral-900/80 dark:text-neutral-300 dark:hover:border-neutral-700 dark:hover:bg-neutral-900"
            >
              <Github className="h-4 w-4" />
              Star on GitHub
            </a>
          </div>

          {/* Install commands */}
          <div className="mt-12 grid w-full max-w-3xl gap-4 sm:grid-cols-2 sm:gap-6">
            <button
              type="button"
              onClick={copyShadcnCommand}
              className="group flex min-w-0 items-center justify-between gap-3 overflow-hidden rounded-xl border border-neutral-200 bg-white/80 px-4 py-3 text-left font-mono text-xs backdrop-blur-sm transition-all hover:border-neutral-300 hover:bg-white dark:border-neutral-800 dark:bg-neutral-900/80 dark:hover:border-neutral-700 dark:hover:bg-neutral-900"
            >
              <div className="flex min-w-0 items-center gap-2">
                <span className="shrink-0 text-orange-500">$</span>
                <span className="truncate text-neutral-600 dark:text-neutral-400">
                  bunx shadcn@latest add https://better-auth-ui.com/r/auth.json
                </span>
              </div>
              <span className="shrink-0 text-neutral-400 transition-colors group-hover:text-neutral-600 dark:text-neutral-600 dark:group-hover:text-neutral-400">
                {copiedShadcn ? (
                  <Check className="h-3.5 w-3.5 text-green-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </span>
            </button>
            <button
              type="button"
              onClick={copyHeroUiCommand}
              className="group flex min-w-0 items-center justify-between gap-3 overflow-hidden rounded-xl border border-neutral-200 bg-white/80 px-4 py-3 text-left font-mono text-xs backdrop-blur-sm transition-all hover:border-neutral-300 hover:bg-white dark:border-neutral-800 dark:bg-neutral-900/80 dark:hover:border-neutral-700 dark:hover:bg-neutral-900"
            >
              <div className="flex min-w-0 items-center gap-2">
                <span className="shrink-0 text-orange-500">$</span>
                <span className="truncate text-neutral-600 dark:text-neutral-400">
                  bun add @better-auth-ui/heroui
                </span>
              </div>
              <span className="shrink-0 text-neutral-400 transition-colors group-hover:text-neutral-600 dark:text-neutral-600 dark:group-hover:text-neutral-400">
                {copiedHeroui ? (
                  <Check className="h-3.5 w-3.5 text-green-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </span>
            </button>
          </div>

          {/* Component Screenshots */}
          <div className="relative mt-12 w-full max-w-5xl sm:mt-16">
            {/* Glow effect behind cards */}
            <div className="absolute inset-x-0 top-1/2 h-64 -translate-y-1/2 bg-linear-to-r from-orange-500/20 via-amber-500/20 to-orange-500/20 blur-3xl dark:from-orange-500/10 dark:via-amber-500/10 dark:to-orange-500/10" />

            <div className="relative flex flex-col items-center justify-center gap-6 sm:flex-row sm:items-start lg:gap-8">
              {/* shadcn Screenshot */}
              <Link
                to="/docs/$"
                params={{ _splat: "shadcn" }}
                className="group relative w-full max-w-sm sm:w-auto sm:max-w-none"
              >
                <div className="absolute -inset-1 rounded-2xl bg-linear-to-br from-orange-300 to-orange-500 opacity-0 blur transition-opacity duration-300 will-change-[opacity] group-hover:opacity-30 dark:from-orange-400 dark:to-orange-600" />
                <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl shadow-neutral-900/20 transition-transform duration-300 ease-out will-change-transform group-hover:scale-[1.02] dark:border-neutral-700 dark:bg-neutral-900 dark:shadow-black/50">
                  <div className="flex items-center gap-1.5 border-b border-neutral-200 bg-neutral-100 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="h-3 w-3 rounded-full bg-red-500/80" />
                    <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                    <div className="h-3 w-3 rounded-full bg-green-500/80" />
                    <span className="ml-3 text-xs text-neutral-500">
                      shadcn/ui
                    </span>
                  </div>
                  <img
                    src="/screenshots/shadcn-sign-in-light.png"
                    alt="shadcn/ui Sign In Component"
                    className="w-full dark:hidden sm:w-80 lg:w-96"
                    draggable={false}
                  />
                  <img
                    src="/screenshots/shadcn-sign-in-dark.png"
                    alt="shadcn/ui Sign In Component"
                    className="hidden w-full dark:block sm:w-80 lg:w-96"
                    draggable={false}
                  />
                </div>
              </Link>

              {/* HeroUI Screenshot */}
              <Link
                to="/docs/$"
                params={{ _splat: "heroui" }}
                className="group relative w-full max-w-sm sm:w-auto sm:max-w-none sm:translate-y-8 lg:translate-y-12"
              >
                <div className="absolute -inset-1 rounded-3xl bg-linear-to-br from-blue-400 to-blue-600 opacity-0 blur transition-opacity duration-300 will-change-[opacity] group-hover:opacity-60 dark:from-blue-500 dark:to-blue-700" />
                <div className="relative overflow-hidden rounded-2xl rounded-b-3xl border border-neutral-200 bg-white shadow-2xl shadow-neutral-900/20 transition-transform duration-300 ease-out will-change-transform group-hover:scale-[1.02] dark:border-neutral-700 dark:bg-neutral-900 dark:shadow-black/50">
                  <div className="flex items-center gap-1.5 border-b border-neutral-200 bg-neutral-100 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="h-3 w-3 rounded-full bg-red-500/80" />
                    <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                    <div className="h-3 w-3 rounded-full bg-green-500/80" />
                    <span className="ml-3 text-xs text-neutral-500">
                      HeroUI
                    </span>
                  </div>
                  <img
                    src="/screenshots/heroui-sign-in-light.png"
                    alt="HeroUI Sign In Component"
                    className="w-full dark:hidden sm:w-80 lg:w-96"
                    draggable={false}
                  />
                  <img
                    src="/screenshots/heroui-sign-in-dark.png"
                    alt="HeroUI Sign In Component"
                    className="hidden w-full dark:block sm:w-80 lg:w-96"
                    draggable={false}
                  />
                </div>
              </Link>
            </div>
          </div>

          {/* Features */}
          <div className="mt-20 grid w-full max-w-4xl gap-4 sm:mt-28 sm:grid-cols-3 lg:gap-6">
            {[
              {
                icon: <LayoutTemplate className="h-5 w-5" />,
                title: "Fully Customizable",
                description:
                  "Built on shadcn/ui and HeroUI. Own your code, style it your way."
              },
              {
                icon: <Zap className="h-5 w-5" />,
                title: "Drop-in Ready",
                description:
                  "Pre-built Sign In, Sign Up, Forgot Password, and more. Just add and configure."
              },
              {
                icon: <ShieldCheck className="h-5 w-5" />,
                title: "Better Auth Native",
                description:
                  "Built specifically for Better Auth. Social logins, magic links, and more."
              }
            ].map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-neutral-200 bg-white/50 p-6 backdrop-blur-sm transition-all hover:border-neutral-300 hover:bg-white dark:border-neutral-800 dark:bg-neutral-900/50 dark:hover:border-neutral-700 dark:hover:bg-neutral-900"
              >
                <div className="mb-3 inline-flex rounded-lg bg-orange-100 p-2.5 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-neutral-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </HomeLayout>
  )
}
