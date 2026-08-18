import { describe, expect, it, vi } from "vitest"

import {
  billingCheckoutOptions,
  billingPlugin,
  billingQueryKeys,
  billingScopeKey,
  createPolarBillingAdapter,
  createStripeBillingAdapter
} from "../src/plugins/billing"

const plans = [
  {
    id: "pro",
    name: "Pro",
    prices: [
      { id: "pro-month", amount: 2_000, currency: "USD", interval: "month" }
    ],
    seatBased: true
  }
] as const

const userScope = { type: "user", userId: "user-1" } as const
const organizationScope = {
  type: "organization",
  organizationId: "org-1",
  organizationSlug: "acme"
} as const

describe("billingPlugin", () => {
  it("registers personal billing by default and supports organization billing", () => {
    const adapter = { id: "test" } as never

    expect(billingPlugin({ adapter })).toMatchObject({
      id: "billing",
      adapter,
      user: true,
      organization: false,
      viewPaths: { settings: { billing: "billing" } }
    })
    expect(
      billingPlugin({ adapter, user: false, organization: true, path: "plan" })
    ).toMatchObject({
      user: false,
      organization: true,
      viewPaths: { settings: { billing: "plan" } }
    })
  })

  it("keeps user and explicit organization cache scopes separate", () => {
    expect(billingScopeKey(userScope)).toBe("user:user-1")
    expect(billingScopeKey(organizationScope)).toBe("organization:org-1:acme")
    expect(billingQueryKeys.state(organizationScope)).toEqual([
      "auth",
      "billing",
      "organization:org-1:acme",
      "state"
    ])
  })

  it("routes generic mutations through the adapter", async () => {
    const checkout = vi.fn(async () => ({ url: "/checkout" }))
    const mutation = billingCheckoutOptions({ checkout } as never, userScope)

    await mutation.mutationFn?.({ planId: "pro", priceId: "pro-month" })

    expect(checkout).toHaveBeenCalledWith(userScope, {
      planId: "pro",
      priceId: "pro-month"
    })
    expect(mutation.meta?.awaits).toEqual([billingQueryKeys.state(userScope)])
  })
})

describe("vendor billing adapters", () => {
  it("maps Better Auth Stripe subscriptions and uses explicit organization scope", async () => {
    const list = vi.fn(async () => ({
      data: [
        {
          id: "sub-1",
          plan: "pro",
          status: "active",
          currentPeriodEnd: "2027-01-01T00:00:00.000Z",
          seats: 3
        }
      ]
    }))
    const upgrade = vi.fn(async () => ({ data: { url: "/stripe-checkout" } }))
    const adapter = createStripeBillingAdapter(
      {
        subscription: {
          list,
          upgrade,
          billingPortal: vi.fn(),
          cancel: vi.fn(),
          restore: vi.fn()
        }
      },
      {
        plans: [...plans],
        successUrl: "/success",
        cancelUrl: "/cancel",
        returnUrl: "/settings/billing"
      }
    )

    const state = await adapter.getState(organizationScope)
    const checkout = await adapter.checkout(organizationScope, {
      planId: "pro",
      priceId: "pro-month",
      seats: 3
    })

    expect(list).toHaveBeenCalledWith(
      expect.objectContaining({
        query: { referenceId: "org-1", customerType: "organization" }
      })
    )
    expect(state.subscription).toMatchObject({
      id: "sub-1",
      planId: "pro",
      status: "active",
      seats: 3
    })
    expect(upgrade).toHaveBeenCalledWith(
      expect.objectContaining({
        plan: "pro",
        referenceId: "org-1",
        customerType: "organization",
        seats: 3,
        disableRedirect: true
      })
    )
    expect(checkout).toEqual({ url: "/stripe-checkout" })
  })

  it("maps Polar subscriptions, usage, and product IDs into generic plans", async () => {
    const checkout = vi.fn(async () => ({ data: { url: "/polar-checkout" } }))
    const subscriptions = vi.fn(async () => ({
      data: {
        items: [
          {
            id: "sub-2",
            productId: "product-pro",
            status: "active",
            quantity: 5
          }
        ]
      }
    }))
    const meters = vi.fn(async () => ({
      data: {
        items: [
          {
            id: "requests",
            label: "API requests",
            consumedUnits: 40,
            creditedUnits: 100
          }
        ]
      }
    }))
    const adapter = createPolarBillingAdapter(
      {
        checkout,
        customer: {
          portal: vi.fn(async () => ({
            data: { customerPortalUrl: "/portal" }
          })),
          subscriptions: { list: subscriptions }
        },
        usage: { meters: { list: meters } }
      },
      {
        plans: [...plans],
        products: { pro: { type: "product", value: "product-pro" } },
        successUrl: "/success",
        cancelUrl: "/cancel",
        returnUrl: "/settings/billing"
      }
    )

    const state = await adapter.getState(organizationScope)
    const result = await adapter.checkout(organizationScope, {
      planId: "pro",
      priceId: "pro-month"
    })

    expect(subscriptions).toHaveBeenCalledWith(
      expect.objectContaining({
        query: expect.objectContaining({ referenceId: "org-1" })
      })
    )
    expect(state).toMatchObject({
      subscription: { planId: "pro", seats: 5 },
      usage: [{ id: "requests", used: 40, limit: 100 }]
    })
    expect(checkout).toHaveBeenCalledWith(
      expect.objectContaining({
        products: ["product-pro"],
        referenceId: "org-1",
        disableRedirect: true
      })
    )
    expect(result).toEqual({ url: "/polar-checkout" })
  })
})
