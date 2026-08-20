import { afterEach, describe, expect, it, vi } from "vitest"

import {
  billingCheckoutOptions,
  billingMutationKeys,
  billingPlugin,
  billingQueryKeys,
  billingScopeKey,
  createAutumnBillingAdapter,
  createCommetBillingAdapter,
  createCreemBillingAdapter,
  createDodoPaymentsBillingAdapter,
  createPolarBillingAdapter,
  createStripeBillingAdapter,
  followBillingAction
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

afterEach(() => vi.unstubAllGlobals())

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

  it("rejects provider scope configurations that cannot be fulfilled", () => {
    const adapter = {
      id: "user-only",
      scopes: { user: true, organization: false }
    } as never

    expect(() => billingPlugin({ adapter, organization: true })).toThrow(
      "user-only does not support explicit organization billing"
    )
    expect(() =>
      billingPlugin({ adapter, user: true, organization: false })
    ).not.toThrow()
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
    expect(mutation.mutationKey).toEqual(
      billingMutationKeys.checkout(userScope)
    )
    expect(billingMutationKeys.checkout(userScope)).not.toEqual(
      billingMutationKeys.checkout(organizationScope)
    )
  })

  it("follows only valid HTTP billing action URLs", () => {
    const assign = vi.fn()
    vi.stubGlobal("window", {
      location: { href: "https://app.example/settings/billing", assign }
    })

    followBillingAction({ url: "/checkout" })
    followBillingAction({ url: "javascript:alert(document.domain)" })
    followBillingAction({ url: "http://[" })

    expect(assign).toHaveBeenCalledOnce()
    expect(assign).toHaveBeenCalledWith("https://app.example/checkout")
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
          annual: true,
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
      interval: "year",
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
    expect(adapter.supports).toEqual({
      cancel: true,
      restore: true,
      seats: true
    })
  })

  it("preserves Stripe billing periods for cancellation, restoration, and seat changes", async () => {
    const list = vi.fn(async () => ({
      data: [
        {
          id: "sub-yearly",
          plan: "pro",
          status: "active",
          annual: true,
          seats: 4
        }
      ]
    }))
    const upgrade = vi.fn(async () => ({ data: { url: "/seat-change" } }))
    const cancel = vi.fn(async () => ({ data: { url: "/cancel" } }))
    const restore = vi.fn(async () => ({ data: {} }))
    const adapter = createStripeBillingAdapter(
      {
        subscription: {
          list,
          upgrade,
          billingPortal: vi.fn(),
          cancel,
          restore
        }
      } as never,
      {
        plans: [
          {
            ...plans[0],
            prices: [
              ...plans[0].prices,
              {
                id: "pro-year",
                amount: 20_000,
                currency: "USD",
                interval: "year"
              }
            ]
          }
        ],
        successUrl: "/success",
        cancelUrl: "/cancel",
        returnUrl: "/settings/billing"
      }
    )

    await adapter.cancel(userScope, "sub-yearly")
    await adapter.restore(userScope, "sub-yearly")
    const { updateSeats } = adapter
    await updateSeats(userScope, "sub-yearly", 8)

    expect(cancel).toHaveBeenCalledWith(
      expect.objectContaining({
        subscriptionId: "sub-yearly",
        disableRedirect: true
      })
    )
    expect(restore).toHaveBeenCalledWith(
      expect.objectContaining({ subscriptionId: "sub-yearly" })
    )
    expect(upgrade).toHaveBeenCalledWith(
      expect.objectContaining({
        subscriptionId: "sub-yearly",
        annual: true,
        seats: 8
      })
    )
  })

  it("throws provider response errors", async () => {
    const adapter = createStripeBillingAdapter(
      {
        subscription: {
          list: vi.fn(),
          upgrade: vi.fn(async () => ({
            error: { message: "Checkout is unavailable" }
          })),
          billingPortal: vi.fn(),
          cancel: vi.fn(),
          restore: vi.fn()
        }
      } as never,
      {
        plans: [...plans],
        successUrl: "/success",
        cancelUrl: "/cancel",
        returnUrl: "/settings/billing"
      }
    )

    await expect(
      adapter.checkout(userScope, {
        planId: "pro",
        priceId: "pro-month"
      })
    ).rejects.toThrow("Checkout is unavailable")
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
        query: expect.objectContaining({
          active: true,
          referenceId: "org-1"
        })
      })
    )
    expect(meters).toHaveBeenCalledWith(
      expect.objectContaining({ query: { page: 1, limit: 100 } })
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
    expect(adapter.supports).toEqual({
      cancel: false,
      restore: false,
      seats: false
    })
  })

  it("delegates unsupported Polar subscription changes to the portal", async () => {
    const portal = vi.fn(async () => ({
      data: { customerPortalUrl: "/portal" }
    }))
    const adapter = createPolarBillingAdapter(
      {
        checkout: vi.fn(),
        customer: {
          portal,
          subscriptions: { list: vi.fn() }
        },
        usage: { meters: { list: vi.fn() } }
      } as never,
      {
        plans: [...plans],
        successUrl: "/success",
        cancelUrl: "/cancel",
        returnUrl: "/settings/billing"
      }
    )

    await expect(adapter.cancel(userScope, "sub-1")).resolves.toEqual({
      url: "/portal"
    })
    await expect(adapter.restore(userScope, "sub-1")).resolves.toEqual({
      url: "/portal"
    })
    await expect(adapter.updateSeats(userScope, "sub-1", 5)).resolves.toEqual({
      url: "/portal"
    })
    expect(portal).toHaveBeenCalledTimes(3)
  })

  it("maps Autumn subscriptions and balances and preserves seat licenses", async () => {
    const getOrCreateCustomer = vi.fn(async () => ({
      subscriptions: [
        {
          id: "autumn-sub",
          planId: "pro",
          status: "active",
          currentPeriodEnd: 1_800_000_000_000,
          quantity: 4
        }
      ],
      balances: {
        messages: {
          usage: 25,
          granted: 100,
          unlimited: false,
          feature: { name: "Messages" }
        }
      }
    }))
    const attach = vi.fn(async () => ({ paymentUrl: "/autumn-checkout" }))
    const updateSubscription = vi.fn(async () => ({ paymentUrl: null }))
    const adapter = createAutumnBillingAdapter(
      {
        getOrCreateCustomer,
        attach,
        updateSubscription,
        openCustomerPortal: vi.fn(async () => ({
          customerId: "user-1",
          url: "/autumn-portal"
        }))
      } as never,
      {
        plans: [...plans],
        seatLicensePlans: { pro: "team-seat" },
        successUrl: "/success",
        cancelUrl: "/cancel",
        returnUrl: "/settings/billing"
      }
    )

    const state = await adapter.getState(userScope)
    const checkout = await adapter.checkout(userScope, {
      planId: "pro",
      priceId: "pro-month",
      seats: 5
    })
    await adapter.cancel(userScope, "autumn-sub")
    await adapter.restore(userScope, "autumn-sub")
    await adapter.updateSeats(userScope, "autumn-sub", 8)

    expect(state).toMatchObject({
      subscription: { id: "autumn-sub", planId: "pro", seats: 4 },
      usage: [{ id: "messages", label: "Messages", used: 25, limit: 100 }]
    })
    expect(checkout).toEqual({ url: "/autumn-checkout" })
    expect(attach).toHaveBeenCalledWith(
      expect.objectContaining({
        planId: "pro",
        licenseQuantities: [{ licensePlanId: "team-seat", quantity: 5 }]
      })
    )
    expect(updateSubscription).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ cancelAction: "cancel_end_of_cycle" })
    )
    expect(updateSubscription).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ cancelAction: "uncancel" })
    )
    expect(updateSubscription).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        licenseQuantities: [{ licensePlanId: "team-seat", quantity: 8 }]
      })
    )
    expect(adapter.scopes).toEqual({ user: true, organization: false })
  })

  it("connects Creem checkout, subscription state, cancellation, and portal", async () => {
    const createCheckout = vi.fn(async () => ({
      data: { url: "/creem-checkout" }
    }))
    const cancelSubscription = vi.fn(async () => ({
      data: { success: true }
    }))
    const adapter = createCreemBillingAdapter(
      {
        creem: {
          createCheckout,
          createPortal: vi.fn(async () => ({ data: { url: "/creem-portal" } })),
          cancelSubscription,
          hasAccessGranted: vi.fn(async () => ({
            data: {
              subscription: {
                id: "creem-sub",
                productId: "creem-pro",
                status: "active",
                periodEnd: "2027-01-01T00:00:00.000Z"
              }
            }
          }))
        }
      } as never,
      {
        plans: [...plans],
        products: { pro: "creem-pro" },
        successUrl: "/success",
        cancelUrl: "/cancel",
        returnUrl: "/settings/billing"
      }
    )

    const state = await adapter.getState(userScope)
    const checkout = await adapter.checkout(userScope, {
      planId: "pro",
      priceId: "pro-month",
      seats: 3
    })
    await adapter.cancel(userScope, "creem-sub")

    expect(state.subscription).toMatchObject({
      id: "creem-sub",
      planId: "pro",
      status: "active"
    })
    expect(checkout).toEqual({ url: "/creem-checkout" })
    expect(createCheckout).toHaveBeenCalledWith(
      expect.objectContaining({ productId: "creem-pro", units: 3 })
    )
    expect(cancelSubscription).toHaveBeenCalledWith({ id: "creem-sub" })
  })

  it("uses Dodo checkout sessions and maps customer subscriptions", async () => {
    const checkoutSession = vi.fn(async () => ({
      data: { url: "/dodo-checkout" }
    }))
    const subscriptions = vi.fn(async () => ({
      data: {
        items: [
          {
            subscription_id: "dodo-sub",
            product_id: "dodo-pro",
            status: "active",
            quantity: 6,
            next_billing_date: "2027-01-01T00:00:00.000Z"
          }
        ]
      }
    }))
    const adapter = createDodoPaymentsBillingAdapter(
      {
        dodopayments: {
          checkoutSession,
          customer: {
            portal: vi.fn(async () => ({ data: { url: "/dodo-portal" } })),
            subscriptions: { list: subscriptions }
          }
        }
      } as never,
      {
        plans: [...plans],
        products: { pro: { type: "product", value: "dodo-pro" } },
        successUrl: "/success",
        cancelUrl: "/cancel",
        returnUrl: "/settings/billing"
      }
    )

    const state = await adapter.getState(userScope)
    const checkout = await adapter.checkout(userScope, {
      planId: "pro",
      priceId: "pro-month",
      seats: 6
    })

    expect(state.subscription).toMatchObject({
      id: "dodo-sub",
      planId: "pro",
      seats: 6
    })
    expect(checkout).toEqual({ url: "/dodo-checkout" })
    expect(checkoutSession).toHaveBeenCalledWith(
      expect.objectContaining({
        product_cart: [{ product_id: "dodo-pro", quantity: 6 }],
        referenceId: "user-1"
      })
    )
  })

  it("maps Commet subscription, usage, and seat state", async () => {
    const cancel = vi.fn(async () => ({ data: { status: "active" } }))
    const setSeats = vi.fn(async () => ({ data: { current: 9 } }))
    const adapter = createCommetBillingAdapter(
      {
        customer: {
          portal: vi.fn(async () => ({ url: "/commet-portal", redirect: true }))
        },
        subscription: {
          get: vi.fn(async () => ({
            data: {
              id: "commet-sub",
              plan: { id: "commet-pro", name: "Pro" },
              status: "active",
              billingInterval: "monthly",
              currentPeriod: { end: "2027-01-01T00:00:00.000Z" }
            }
          })),
          cancel
        },
        features: {
          list: vi.fn(async () => ({
            data: [
              {
                code: "api-calls",
                name: "API calls",
                unitName: "request",
                consumption: {
                  model: "metered",
                  unitsUsed: 40,
                  includedUnits: 100,
                  unlimited: false
                }
              }
            ]
          }))
        },
        seats: {
          list: vi.fn(async () => ({ data: { members: { current: 5 } } })),
          set: setSeats
        }
      } as never,
      {
        plans: [...plans],
        planIds: { pro: "commet-pro" },
        seatFeatureCode: "members",
        usage: true,
        successUrl: "/success",
        cancelUrl: "/cancel",
        returnUrl: "/settings/billing"
      }
    )

    const state = await adapter.getState(userScope)
    const checkout = await adapter.checkout(userScope, {
      planId: "pro",
      priceId: "pro-month"
    })
    await adapter.cancel(userScope, "commet-sub")
    await adapter.updateSeats(userScope, "commet-sub", 9)

    expect(state).toMatchObject({
      subscription: {
        id: "commet-sub",
        planId: "pro",
        interval: "month",
        seats: 5
      },
      usage: [{ id: "api-calls", used: 40, limit: 100 }]
    })
    expect(checkout).toEqual({ url: "/commet-portal" })
    expect(cancel).toHaveBeenCalledWith({ immediate: false }, { throw: true })
    expect(setSeats).toHaveBeenCalledWith(
      { featureCode: "members", count: 9 },
      { throw: true }
    )
  })

  it("fails before calling user-only provider APIs for organization scope", async () => {
    const adapter = createCreemBillingAdapter({} as never, {
      plans: [...plans],
      successUrl: "/success",
      cancelUrl: "/cancel",
      returnUrl: "/settings/billing"
    })

    await expect(adapter.listPlans(organizationScope)).rejects.toThrow(
      "Creem does not accept an explicit organization ID"
    )
  })
})
