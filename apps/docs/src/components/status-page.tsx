import { HomeLayout } from "fumadocs-ui/layouts/home"
import type { ReactNode } from "react"
import { baseOptions } from "@/lib/layout.shared"

interface StatusPageProps {
  children: ReactNode
  code: string
  description: string
  title: string
}

export function StatusPage({
  children,
  code,
  description,
  title
}: StatusPageProps) {
  return (
    <HomeLayout {...baseOptions()}>
      <div className="flex grow border-t border-fd-border">
        <div className="mx-auto grid w-full max-w-5xl content-center gap-10 px-6 py-16 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)] md:items-center md:gap-0 md:px-8">
          <div
            aria-hidden="true"
            className="flex flex-col gap-4 md:min-h-80 md:justify-center md:border-r md:border-fd-border"
          >
            <div className="h-1 w-12 bg-fd-primary" />
            <p className="font-mono text-[clamp(6rem,24vw,12rem)] leading-none font-semibold tracking-tighter text-fd-muted-foreground/35">
              {code}
            </p>
          </div>

          <div className="flex max-w-xl flex-col gap-6 md:pl-12">
            <div className="flex flex-col gap-3">
              <h1 className="text-3xl font-semibold tracking-tight text-fd-foreground sm:text-4xl">
                {title}
              </h1>
              <p className="max-w-md text-base leading-7 text-fd-muted-foreground">
                {description}
              </p>
            </div>

            {children}
          </div>
        </div>
      </div>
    </HomeLayout>
  )
}
