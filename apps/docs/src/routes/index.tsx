import { GitHub, useCopyToClipboard } from "@better-auth-ui/react"
import { createFileRoute, Link } from "@tanstack/react-router"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "fumadocs-ui/components/tabs"
import { buttonVariants } from "fumadocs-ui/components/ui/button"
import { HomeLayout } from "fumadocs-ui/layouts/home"
import { ArrowRight, ArrowUpRight, Check, Copy } from "lucide-react"
import { toast } from "sonner"
import { HeroUI } from "@/components/icons/heroui"
import { HomeHeader } from "@/components/DocsShell"
import { React as ReactIcon } from "@/components/icons/react"
import { Shadcn } from "@/components/icons/shadcn"
import { Solid } from "@/components/icons/solid"
import { Zaidan } from "@/components/icons/zaidan"
import { baseOptions } from "@/lib/layout.shared"

const libraries = [
  {
    id: "shadcn",
    name: "shadcn/ui",
    framework: "React",
    icon: Shadcn,
    frameworkIcon: ReactIcon,
    imageWidth: 768,
    imageHeight: 1020,
    command: "bun x shadcn@latest add @better-auth-ui/auth",
    description: "Add components to your codebase with the shadcn CLI."
  },
  {
    id: "heroui",
    name: "HeroUI",
    framework: "React",
    icon: HeroUI,
    frameworkIcon: ReactIcon,
    imageWidth: 768,
    imageHeight: 1000,
    command:
      "bun add @better-auth-ui/heroui@latest @better-auth-ui/react@latest @better-auth-ui/core@latest",
    description: "Install the HeroUI components and shared React hooks."
  },
  {
    id: "zaidan",
    name: "Zaidan",
    framework: "SolidJS",
    icon: Zaidan,
    frameworkIcon: Solid,
    imageWidth: 384,
    imageHeight: 458,
    command:
      "bun add @better-auth-ui/solid@latest @better-auth-ui/core@latest @tanstack/solid-query",
    description: "Install the Solid hooks, then add the Zaidan components."
  }
] as const

const signInPaths = {
  React: "components/auth/sign-in",
  SolidJS: "components/sign-in"
}

const componentGroups = [
  {
    title: "Authentication",
    description: "Sign in, sign up, social login, and password recovery.",
    paths: signInPaths
  },
  {
    title: "Account settings",
    description: "Profiles, linked accounts, and session management.",
    paths: {
      React: "components/settings/settings",
      SolidJS: "components/settings"
    }
  },
  {
    title: "Security",
    description: "Passkeys, two-factor authentication, and email verification.",
    paths: { React: "plugins/two-factor", SolidJS: "plugins/two-factor" }
  },
  {
    title: "Organizations",
    description: "Members, invitations, teams, and roles.",
    paths: { React: "plugins/organization", SolidJS: "plugins/organization" }
  }
]

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      {
        name: "description",
        content:
          "Authentication, account settings, and organization components for Better Auth. Built for React and SolidJS with shadcn/ui, HeroUI, and Zaidan."
      }
    ]
  })
})

function Home() {
  return (
    <HomeLayout
      {...baseOptions()}
      nav={{ ...baseOptions().nav, component: <HomeHeader /> }}
      className="home-layout"
    >
      <div className="home-page">
        <section className="home-intro" aria-labelledby="home-title">
          <div>
            <h1 id="home-title">
              Authentication UI.
              <br />
              <span>Your app’s style.</span>
            </h1>
            <p className="home-description">
              Sign-in, account settings, and organizations for{" "}
              <a href="https://better-auth.com">Better Auth</a>. Built for React
              and SolidJS.
            </p>
            <div className="home-actions">
              <Link
                to="/docs/$"
                params={{ _splat: "" }}
                className={buttonVariants({
                  variant: "primary",
                  className: "home-primary-action"
                })}
              >
                Get started <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
              <a
                href="https://demo.better-auth-ui.com"
                className="home-text-link"
              >
                Try the demo{" "}
                <ArrowUpRight aria-hidden="true" className="size-4" />
              </a>
            </div>
            <p className="home-license">
              Open source. MIT licensed. Yours to customize.
            </p>
          </div>
          <section className="home-install" aria-labelledby="install-title">
            <h2 id="install-title">Start with your stack</h2>
            <Tabs defaultValue="shadcn" className="home-install-tabs">
              <TabsList aria-label="Installation library">
                {libraries.map((library) => (
                  <TabsTrigger key={library.id} value={library.id}>
                    <library.icon aria-hidden="true" /> {library.name}
                  </TabsTrigger>
                ))}
              </TabsList>
              {libraries.map((library) => (
                <TabsContent key={library.id} value={library.id}>
                  <InstallCommand
                    command={library.command}
                    name={library.name}
                  />
                  <p className="home-install-description">
                    {library.description}
                  </p>
                  <Link
                    to="/docs/$"
                    params={{ _splat: library.id }}
                    className="home-text-link"
                  >
                    {library.name} setup{" "}
                    <ArrowRight aria-hidden="true" className="size-4" />
                  </Link>
                </TabsContent>
              ))}
            </Tabs>
          </section>
        </section>

        <section className="home-libraries" aria-labelledby="libraries-title">
          <div className="home-section-heading">
            <h2 id="libraries-title">Choose your UI library</h2>
            <p>Same auth flows. A look that fits your stack.</p>
          </div>
          <div className="home-preview-grid">
            {libraries.map((library) => (
              <article key={library.id} className="home-library">
                <div className="home-library-heading">
                  <h3>
                    <library.icon aria-hidden="true" className="size-5" />{" "}
                    {library.name}
                  </h3>
                  <span>
                    <library.frameworkIcon
                      aria-hidden="true"
                      className="size-4"
                    />{" "}
                    {library.framework}
                  </span>
                </div>
                <Link
                  to="/docs/$"
                  params={{
                    _splat: `${library.id}/${signInPaths[library.framework]}`
                  }}
                  className="home-preview"
                  aria-label={`Explore the ${library.name} sign-in component`}
                >
                  <img
                    src={`/screenshots/${library.id}-sign-in-light.png`}
                    alt={`${library.name} sign-in form with email and social login`}
                    className="home-preview-light"
                    width={library.imageWidth}
                    height={library.imageHeight}
                    draggable={false}
                  />
                  <img
                    src={`/screenshots/${library.id}-sign-in-dark.png`}
                    alt={`${library.name} sign-in form with email and social login`}
                    className="home-preview-dark"
                    width={library.imageWidth}
                    height={library.imageHeight}
                    draggable={false}
                  />
                </Link>
                <Link
                  to="/docs/$"
                  params={{ _splat: library.id }}
                  className="home-library-link"
                >
                  Explore {library.name}{" "}
                  <ArrowUpRight aria-hidden="true" className="size-4" />
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="home-components" aria-labelledby="components-title">
          <div className="home-section-heading">
            <h2 id="components-title">Beyond the sign-in screen</h2>
            <Link
              to="/docs/$"
              params={{ _splat: "" }}
              className="home-text-link"
            >
              Browse the docs{" "}
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
          <div className="home-component-grid">
            {componentGroups.map((group) => (
              <div key={group.title}>
                <h3>{group.title}</h3>
                <p>{group.description}</p>
                <div className="home-component-links">
                  {libraries.map((library) => (
                    <Link
                      key={library.id}
                      to="/docs/$"
                      params={{
                        _splat: `${library.id}/${group.paths[library.framework]}`
                      }}
                    >
                      {library.name}
                      <span className="sr-only"> {group.title}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
        <footer className="home-footer">
          <p>
            Better Auth UI{" "}
            <span>Built on Better Auth. Built for your app.</span>
          </p>
          <div>
            <a href="https://github.com/better-auth-ui/better-auth-ui">
              <GitHub aria-hidden="true" className="size-4" /> GitHub
            </a>
            <a href="https://better-auth-ui.com/discord">
              Discord <ArrowUpRight aria-hidden="true" className="size-4" />
            </a>
          </div>
        </footer>
      </div>
    </HomeLayout>
  )
}

function InstallCommand({ command, name }: { command: string; name: string }) {
  const { copied, copy } = useCopyToClipboard({
    onError: () =>
      toast.error("Could not copy the command. Select and copy it manually.")
  })

  return (
    <div className="home-command">
      <code>{command}</code>
      <button
        type="button"
        onClick={() => copy(command)}
        aria-label={`Copy ${name} install command`}
        className={buttonVariants({ variant: "ghost", size: "icon" })}
      >
        {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
      </button>
      <span role="status" className="sr-only">
        {copied ? "Install command copied" : ""}
      </span>
    </div>
  )
}
