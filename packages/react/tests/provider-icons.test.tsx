import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { renderProviderIcon } from "../src/lib/provider-icons"

describe("renderProviderIcon", () => {
  it("applies caller SVG props to custom provider icons", () => {
    const icon = renderProviderIcon(
      {
        id: "acme",
        label: "Acme",
        icon: <svg className="custom" data-provider="acme" />
      },
      {
        className: "size-4 opacity-50",
        "aria-hidden": true
      }
    )

    const { container } = render(icon)
    const svg = container.querySelector("svg")

    expect(svg).toHaveClass("custom", "size-4", "opacity-50")
    expect(svg).toHaveAttribute("data-provider", "acme")
    expect(svg).toHaveAttribute("aria-hidden", "true")
  })

  it("applies caller SVG props to built-in provider icons", () => {
    const { container } = render(
      renderProviderIcon("github", {
        className: "opacity-50",
        "aria-label": "GitHub"
      })
    )

    const svg = container.querySelector("svg")
    expect(svg).toHaveClass("opacity-50")
    expect(svg).toHaveAttribute("aria-label", "GitHub")
  })
})
