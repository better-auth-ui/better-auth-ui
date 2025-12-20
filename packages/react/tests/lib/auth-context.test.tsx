import { render, screen } from "@testing-library/react"
import { useContext } from "react"
import { describe, expect, it } from "vitest"
import { AuthContext } from "../../src/lib/auth-context"

describe("AuthContext", () => {
  it("should provide undefined by default", () => {
    function TestComponent() {
      const context = useContext(AuthContext)
      return <div>{context === undefined ? "undefined" : "defined"}</div>
    }

    render(<TestComponent />)
    expect(screen.getByText("undefined")).toBeInTheDocument()
  })

  it("should provide context value when wrapped in provider", () => {
    const mockConfig = { redirectTo: "/dashboard" }

    function TestComponent() {
      const context = useContext(AuthContext)
      return <div>{context?.redirectTo || "no-redirect"}</div>
    }

    render(
      <AuthContext.Provider value={mockConfig}>
        <TestComponent />
      </AuthContext.Provider>
    )

    expect(screen.getByText("/dashboard")).toBeInTheDocument()
  })

  it("should allow nested providers", () => {
    const outerConfig = { redirectTo: "/outer" }
    const innerConfig = { redirectTo: "/inner" }

    function TestComponent() {
      const context = useContext(AuthContext)
      return <div>{context?.redirectTo}</div>
    }

    render(
      <AuthContext.Provider value={outerConfig}>
        <div>
          <AuthContext.Provider value={innerConfig}>
            <TestComponent />
          </AuthContext.Provider>
        </div>
      </AuthContext.Provider>
    )

    expect(screen.getByText("/inner")).toBeInTheDocument()
  })
})
