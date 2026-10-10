import Link from "fumadocs-core/link"
import { HeroUI } from "@/components/icons/heroui"
import { Shadcn } from "@/components/icons/shadcn"
import { Zaidan } from "@/components/icons/zaidan"

const libraries = [
  {
    id: "shadcn",
    name: "shadcn/ui",
    framework: "React",
    icon: Shadcn,
    width: 768,
    height: 1020
  },
  {
    id: "heroui",
    name: "HeroUI",
    framework: "React",
    icon: HeroUI,
    width: 768,
    height: 1000
  },
  {
    id: "zaidan",
    name: "Zaidan",
    framework: "SolidJS",
    icon: Zaidan,
    width: 384,
    height: 458
  }
] as const

export function DocsLibraryCards() {
  return (
    <div className="docs-library-cards not-prose">
      {libraries.map((library) => (
        <Link
          key={library.id}
          href={`/docs/${library.id}`}
          className="docs-library-card"
        >
          <div className="docs-library-preview">
            <img
              src={`/screenshots/${library.id}-sign-in-light.png`}
              alt={`${library.name} sign-in preview`}
              width={library.width}
              height={library.height}
              className="dark:hidden"
            />
            <img
              src={`/screenshots/${library.id}-sign-in-dark.png`}
              alt={`${library.name} sign-in preview`}
              width={library.width}
              height={library.height}
              className="hidden dark:block"
            />
          </div>
          <div className="docs-library-caption">
            <library.icon aria-hidden="true" />
            <h3>{library.name}</h3>
            <span>{library.framework}</span>
          </div>
        </Link>
      ))}
    </div>
  )
}
