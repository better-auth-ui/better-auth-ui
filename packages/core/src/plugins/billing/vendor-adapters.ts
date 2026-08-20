import type { stripeClient } from "@better-auth/stripe/client"
import type { commetClient } from "@commet/better-auth/client"
import type { creemClient } from "@creem_io/better-auth/client"
import type { dodopaymentsClient } from "@dodopayments/better-auth/client"
import type { polarClient } from "@polar-sh/better-auth/client"
import type { IAutumnClient } from "autumn-js/react"
import type { AuthClient } from "../../lib/auth-client"
import type {
  BillingActionResult,
  BillingAdapter,
  BillingPlan,
  BillingScope,
  BillingState,
  BillingSubscription,
  BillingSubscriptionStatus,
  BillingUsage
} from "./billing-adapter"

export type StripeBillingClient = AuthClient<{
  plugins: [ReturnType<typeof stripeClient<{ subscription: true }>>]
}>

export type PolarBillingClient = AuthClient<{
  plugins: [ReturnType<typeof polarClient>]
}>

export type AutumnBillingClient = Pick<
  IAutumnClient,
  "getOrCreateCustomer" | "attach" | "updateSubscription" | "openCustomerPortal"
>

export type CreemBillingClient = AuthClient<{
  plugins: [ReturnType<typeof creemClient>]
}>

export type DodoPaymentsBillingClient = AuthClient<{
  plugins: [ReturnType<typeof dodopaymentsClient>]
}>

export type CommetBillingClient = AuthClient<{
  plugins: [ReturnType<typeof commetClient>]
}>

export type VendorBillingAdapterOptions = {
  plans: BillingPlan[]
  successUrl: string
  cancelUrl: string
  returnUrl: string
}

export type PolarBillingAdapterOptions = VendorBillingAdapterOptions & {
  /** Polar checkout product or configured slug for each BAUI plan ID. */
  products?: Record<
    string,
    { type: "slug"; value: string } | { type: "product"; value: string }
  >
}

export type ProductBillingAdapterOptions = VendorBillingAdapterOptions & {
  /** Provider product ID for each BAUI plan ID. */
  products?: Record<string, string>
}

export type DodoPaymentsBillingAdapterOptions = VendorBillingAdapterOptions & {
  /** Dodo product or configured slug for each BAUI plan ID. */
  products?: Record<
    string,
    { type: "slug"; value: string } | { type: "product"; value: string }
  >
}

export type AutumnBillingAdapterOptions = VendorBillingAdapterOptions & {
  /** Autumn license plan used for seat quantity on each BAUI plan. */
  seatLicensePlans?: Record<string, string>
}

export type CommetBillingAdapterOptions = VendorBillingAdapterOptions & {
  /** Commet plan ID for each BAUI plan ID. */
  planIds?: Record<string, string>
  /** Commet seat feature updated by BAUI's seat editor. */
  seatFeatureCode?: string
  /** Read metered feature access into BAUI usage rows. @default false */
  usage?: boolean
}

type RecordValue = Record<string, unknown>

const record = (value: unknown): RecordValue | undefined =>
  value && typeof value === "object" ? (value as RecordValue) : undefined

const unwrap = <T>(result: unknown): T => {
  const value = record(result)
  const error = value?.error

  if (error) {
    const errorRecord = record(error)
    throw new Error(String(errorRecord?.message ?? error))
  }

  return (value && "data" in value ? value.data : result) as T
}

const items = (result: unknown): unknown[] => {
  const value = unwrap<unknown>(result)
  if (Array.isArray(value)) return value

  const resultRecord = record(value)
  const nested = resultRecord?.items ?? record(resultRecord?.result)?.items
  return Array.isArray(nested) ? nested : []
}

const stringValue = (value: unknown) =>
  typeof value === "string" ? value : undefined

const numberValue = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) ? value : undefined

const dateValue = (value: unknown) => {
  if (!value) return undefined
  const date = new Date(value as string | number | Date)
  return Number.isNaN(date.getTime()) ? undefined : date
}

const statusValue = (value: unknown): BillingSubscriptionStatus => {
  const status = stringValue(value)
  if (status === "cancelled") return "canceled"
  if (status === "scheduled_cancel") return "active"
  return status === "active" ||
    status === "trialing" ||
    status === "past_due" ||
    status === "paused" ||
    status === "canceled" ||
    status === "incomplete"
    ? status
    : "unknown"
}

const intervalValue = (value: unknown) => {
  const interval = stringValue(value)
  if (interval === "month" || interval === "monthly") return "month" as const
  if (interval === "year" || interval === "yearly" || interval === "annual")
    return "year" as const
  if (interval === "one-time" || interval === "one_time")
    return "one-time" as const
  return undefined
}

const mapSubscription = (value: unknown): BillingSubscription | undefined => {
  const subscription = record(value)
  const id =
    stringValue(subscription?.id) ??
    stringValue(subscription?.subscriptionId) ??
    stringValue(subscription?.subscription_id) ??
    stringValue(subscription?.creemSubscriptionId)
  if (!subscription || !id) return undefined
  const product = record(subscription.product)
  const plan = record(subscription.plan)
  const price = record(subscription.price) ?? record(plan?.price)
  const currentPeriod = record(subscription.currentPeriod)
  const canceledAt =
    subscription.canceledAt ??
    subscription.canceled_at ??
    subscription.cancelledAt ??
    subscription.cancelled_at

  return {
    id,
    planId:
      stringValue(subscription.planId) ??
      stringValue(subscription.plan) ??
      stringValue(subscription.productId) ??
      stringValue(subscription.product_id) ??
      stringValue(product?.id) ??
      stringValue(plan?.id) ??
      "unknown",
    planName:
      stringValue(subscription.planName) ??
      stringValue(product?.name) ??
      stringValue(plan?.name) ??
      stringValue(subscription.name),
    priceId:
      stringValue(subscription.priceId) ??
      stringValue(subscription.price_id) ??
      stringValue(price?.id),
    interval:
      intervalValue(
        subscription.interval ??
          subscription.billingInterval ??
          subscription.recurringInterval ??
          subscription.recurring_interval ??
          price?.interval
      ) ??
      (typeof subscription.annual === "boolean"
        ? subscription.annual
          ? "year"
          : "month"
        : undefined),
    status: statusValue(subscription.status),
    currentPeriodEnd: dateValue(
      subscription.currentPeriodEnd ??
        subscription.current_period_end ??
        subscription.currentPeriodEndDate ??
        subscription.current_period_end_date ??
        subscription.periodEnd ??
        subscription.period_end ??
        subscription.nextBillingDate ??
        subscription.next_billing_date ??
        currentPeriod?.end
    ),
    cancelAtPeriodEnd: Boolean(
      subscription.cancelAtPeriodEnd ??
        subscription.cancel_at_period_end ??
        subscription.cancelAtNextBillingDate ??
        subscription.cancel_at_next_billing_date ??
        subscription.status === "scheduled_cancel"
    ),
    canceledAt: dateValue(canceledAt),
    seats:
      numberValue(subscription.seats) ??
      numberValue(subscription.quantity) ??
      numberValue(subscription.units)
  }
}

const mapUsage = (value: unknown): BillingUsage | undefined => {
  const usage = record(value)
  const meter = record(usage?.meter)
  const id = stringValue(usage?.id) ?? stringValue(meter?.id)
  if (!usage || !id) return undefined

  const used =
    numberValue(usage.consumedUnits) ??
    numberValue(usage.consumed_units) ??
    numberValue(usage.used) ??
    0
  const credited =
    numberValue(usage.creditedUnits) ??
    numberValue(usage.credited_units) ??
    numberValue(usage.limit)

  return {
    id,
    label:
      stringValue(usage.label) ??
      stringValue(meter?.name) ??
      stringValue(meter?.slug) ??
      id,
    used,
    limit: credited,
    unit: stringValue(usage.unit) ?? stringValue(meter?.unit)
  }
}

const actionResult = (result: unknown): BillingActionResult => {
  const value = record(unwrap(result))
  return {
    url: stringValue(
      value?.url ??
        value?.paymentUrl ??
        value?.redirectUrl ??
        value?.redirect_url ??
        value?.customerPortalUrl
    )
  }
}

const userOnlyScope = (scope: BillingScope, provider: string) => {
  if (scope.type === "organization") {
    throw new Error(
      `${provider} does not accept an explicit organization ID in its Better Auth client API.`
    )
  }
}

const resolvePlanId = (
  providerPlanId: string,
  products: Record<string, string> | undefined
) =>
  Object.entries(products ?? {}).find(
    ([, productId]) => productId === providerPlanId
  )?.[0] ?? providerPlanId

const mapAutumnUsage = (customer: RecordValue): BillingUsage[] =>
  Object.entries(record(customer.balances) ?? {}).map(([id, value]) => {
    const balance = record(value)
    const feature = record(balance?.feature)
    const unlimited = balance?.unlimited === true

    return {
      id,
      label: stringValue(feature?.name) ?? id,
      used: numberValue(balance?.usage) ?? 0,
      limit: unlimited ? undefined : numberValue(balance?.granted),
      unit: stringValue(feature?.displayName) ?? stringValue(feature?.name)
    }
  })

const mapCommetUsage = (value: unknown): BillingUsage | undefined => {
  const feature = record(value)
  const consumption = record(feature?.consumption)
  const code = stringValue(feature?.code)
  const used = numberValue(consumption?.unitsUsed)
  if (!code || used === undefined) return undefined

  return {
    id: code,
    label: stringValue(feature?.name) ?? code,
    used,
    limit:
      consumption?.unlimited === true
        ? undefined
        : numberValue(consumption?.includedUnits),
    unit: stringValue(feature?.unitName)
  }
}

const scopeParams = (scope: BillingScope) => ({
  referenceId:
    scope.type === "organization" ? scope.organizationId : scope.userId,
  customerType: scope.type
})

export function createStripeBillingAdapter(
  client: StripeBillingClient,
  options: VendorBillingAdapterOptions
): BillingAdapter {
  const findPlan = (planId: string) =>
    options.plans.find((plan) => plan.id === planId)

  const checkout = async (
    scope: BillingScope,
    input: { planId: string; priceId: string; seats?: number },
    subscriptionId?: string
  ) => {
    const price = findPlan(input.planId)?.prices.find(
      (entry) => entry.id === input.priceId
    )

    return actionResult(
      await client.subscription.upgrade({
        plan: input.planId,
        annual: price?.interval === "year",
        ...scopeParams(scope),
        ...(subscriptionId ? { subscriptionId } : {}),
        ...(input.seats ? { seats: input.seats } : {}),
        successUrl: options.successUrl,
        cancelUrl: options.cancelUrl,
        returnUrl: options.returnUrl,
        disableRedirect: true
      })
    )
  }

  const getState = async (
    scope: BillingScope,
    signal?: AbortSignal
  ): Promise<BillingState> => {
    const subscriptions = items(
      await client.subscription.list({
        query: scopeParams(scope),
        fetchOptions: { signal, throw: true }
      })
    )
      .map(mapSubscription)
      .filter((value): value is BillingSubscription => Boolean(value))

    return { subscription: subscriptions[0], usage: [] }
  }

  return {
    id: "stripe",
    supports: { cancel: true, restore: true, seats: true },
    async listPlans() {
      return options.plans
    },
    getState,
    checkout: (scope, input) => checkout(scope, input),
    async openPortal(scope) {
      return actionResult(
        await client.subscription.billingPortal({
          ...scopeParams(scope),
          returnUrl: options.returnUrl,
          disableRedirect: true
        })
      )
    },
    async cancel(scope, subscriptionId) {
      return actionResult(
        await client.subscription.cancel({
          ...scopeParams(scope),
          subscriptionId,
          returnUrl: options.returnUrl,
          disableRedirect: true
        })
      )
    },
    async restore(scope, subscriptionId) {
      return actionResult(
        await client.subscription.restore({
          ...scopeParams(scope),
          subscriptionId
        })
      )
    },
    async updateSeats(scope, subscriptionId, seats) {
      const state = await getState(scope)
      const subscription = state.subscription
      const planId = subscription?.planId
      const plan = planId ? findPlan(planId) : undefined
      const price = subscription?.priceId
        ? plan?.prices.find((entry) => entry.id === subscription.priceId)
        : subscription?.interval
          ? plan?.prices.find(
              (entry) => entry.interval === subscription.interval
            )
          : plan?.prices.length === 1
            ? plan.prices[0]
            : undefined
      if (!plan || !price)
        throw new Error("The current billing price is unavailable.")
      return checkout(
        scope,
        { planId: plan.id, priceId: price.id, seats },
        subscriptionId
      )
    }
  }
}

export function createPolarBillingAdapter(
  client: PolarBillingClient,
  options: PolarBillingAdapterOptions
): BillingAdapter {
  const resolvePlanId = (providerPlanId: string) =>
    Object.entries(options.products ?? {}).find(
      ([, product]) => product.value === providerPlanId
    )?.[0] ?? providerPlanId

  const portal = async (_scope: BillingScope) =>
    actionResult(
      await client.customer.portal({
        fetchOptions: { throw: true }
      })
    )

  return {
    id: "polar",
    supports: { cancel: false, restore: false, seats: false },
    async listPlans() {
      return options.plans
    },
    async getState(scope, signal): Promise<BillingState> {
      const subscriptionQuery = {
        page: 1,
        limit: 100,
        active: true,
        ...(scope.type === "organization"
          ? { referenceId: scope.organizationId }
          : {})
      }
      const [subscriptionsResult, usageResult] = await Promise.all([
        client.customer.subscriptions.list({
          query: subscriptionQuery,
          fetchOptions: { signal, throw: true }
        }),
        client.usage.meters.list({
          query: { page: 1, limit: 100 },
          fetchOptions: { signal, throw: true }
        })
      ])
      const subscription = items(subscriptionsResult)
        .map(mapSubscription)
        .find(Boolean)
      const normalizedSubscription = subscription
        ? { ...subscription, planId: resolvePlanId(subscription.planId) }
        : undefined
      const usage = items(usageResult)
        .map(mapUsage)
        .filter((value): value is BillingUsage => Boolean(value))

      return { subscription: normalizedSubscription, usage }
    },
    async checkout(scope, input) {
      const product = options.products?.[input.planId]
      return actionResult(
        await client.checkout({
          ...(product?.type === "product"
            ? { products: [product.value] }
            : { slug: product?.value ?? input.planId }),
          ...(scope.type === "organization"
            ? { referenceId: scope.organizationId }
            : {}),
          ...(input.seats ? { seats: input.seats } : {}),
          successUrl: options.successUrl,
          disableRedirect: true
        })
      )
    },
    openPortal: portal,
    /** Polar completes cancellation in its customer portal. */
    async cancel(scope) {
      return portal(scope)
    },
    /** Polar completes restoration in its customer portal. */
    async restore(scope) {
      return portal(scope)
    },
    /** Polar completes seat changes in its customer portal. */
    async updateSeats(scope) {
      return portal(scope)
    }
  }
}

export function createAutumnBillingAdapter(
  client: AutumnBillingClient,
  options: AutumnBillingAdapterOptions
): BillingAdapter {
  const getState = async (
    scope: BillingScope,
    _signal?: AbortSignal
  ): Promise<BillingState> => {
    userOnlyScope(scope, "Autumn")
    const customer = record(
      await client.getOrCreateCustomer({
        expand: ["subscriptions.plan", "balances.feature"]
      })
    )
    const subscription = (
      Array.isArray(customer?.subscriptions) ? customer.subscriptions : []
    )
      .map(mapSubscription)
      .find(Boolean)

    return {
      subscription,
      usage: customer ? mapAutumnUsage(customer) : []
    }
  }

  const updateSubscription = async (
    scope: BillingScope,
    input: Parameters<AutumnBillingClient["updateSubscription"]>[0]
  ) => {
    userOnlyScope(scope, "Autumn")
    return actionResult(await client.updateSubscription(input))
  }

  return {
    id: "autumn",
    scopes: { user: true, organization: false },
    supports: {
      cancel: true,
      restore: true,
      seats: Boolean(options.seatLicensePlans)
    },
    async listPlans(scope) {
      userOnlyScope(scope, "Autumn")
      return options.plans
    },
    getState,
    async checkout(scope, input) {
      userOnlyScope(scope, "Autumn")
      const seatLicensePlan = options.seatLicensePlans?.[input.planId]
      return actionResult(
        await client.attach({
          planId: input.planId,
          successUrl: options.successUrl,
          redirectMode: "always",
          ...(seatLicensePlan && input.seats
            ? {
                licenseQuantities: [
                  { licensePlanId: seatLicensePlan, quantity: input.seats }
                ]
              }
            : {})
        })
      )
    },
    async openPortal(scope) {
      userOnlyScope(scope, "Autumn")
      return actionResult(
        await client.openCustomerPortal({
          returnUrl: options.returnUrl
        })
      )
    },
    cancel: (scope, subscriptionId) =>
      updateSubscription(scope, {
        subscriptionId,
        cancelAction: "cancel_end_of_cycle"
      }),
    restore: (scope, subscriptionId) =>
      updateSubscription(scope, {
        subscriptionId,
        cancelAction: "uncancel"
      }),
    async updateSeats(scope, subscriptionId, seats) {
      const state = await getState(scope)
      const planId = state.subscription?.planId
      const licensePlanId = planId
        ? options.seatLicensePlans?.[planId]
        : undefined
      if (!licensePlanId) {
        throw new Error("The Autumn seat license plan is unavailable.")
      }
      return updateSubscription(scope, {
        subscriptionId,
        licenseQuantities: [{ licensePlanId, quantity: seats }]
      })
    }
  }
}

export function createCreemBillingAdapter(
  client: CreemBillingClient,
  options: ProductBillingAdapterOptions
): BillingAdapter {
  const portal = async (scope: BillingScope) => {
    userOnlyScope(scope, "Creem")
    return actionResult(await client.creem.createPortal())
  }

  return {
    id: "creem",
    scopes: { user: true, organization: false },
    supports: { cancel: true, restore: false, seats: false },
    async listPlans(scope) {
      userOnlyScope(scope, "Creem")
      return options.plans
    },
    async getState(scope): Promise<BillingState> {
      userOnlyScope(scope, "Creem")
      const access = record(unwrap(await client.creem.hasAccessGranted()))
      const subscription = mapSubscription(access?.subscription)
      const normalizedSubscription = subscription
        ? {
            ...subscription,
            planId: resolvePlanId(subscription.planId, options.products)
          }
        : undefined

      return { subscription: normalizedSubscription, usage: [] }
    },
    async checkout(scope, input) {
      userOnlyScope(scope, "Creem")
      return actionResult(
        await client.creem.createCheckout({
          productId: options.products?.[input.planId] ?? input.planId,
          ...(input.seats ? { units: input.seats } : {}),
          successUrl: options.successUrl
        })
      )
    },
    openPortal: portal,
    async cancel(scope, subscriptionId) {
      userOnlyScope(scope, "Creem")
      return actionResult(
        await client.creem.cancelSubscription({ id: subscriptionId })
      )
    },
    /** Creem completes restoration in its customer portal. */
    restore: portal,
    /** Creem completes unit changes in its customer portal. */
    updateSeats: portal
  }
}

export function createDodoPaymentsBillingAdapter(
  client: DodoPaymentsBillingClient,
  options: DodoPaymentsBillingAdapterOptions
): BillingAdapter {
  const portal = async (scope: BillingScope) => {
    userOnlyScope(scope, "Dodo Payments")
    return actionResult(await client.dodopayments.customer.portal())
  }

  return {
    id: "dodo-payments",
    scopes: { user: true, organization: false },
    supports: { cancel: false, restore: false, seats: false },
    async listPlans(scope) {
      userOnlyScope(scope, "Dodo Payments")
      return options.plans
    },
    async getState(scope, signal): Promise<BillingState> {
      userOnlyScope(scope, "Dodo Payments")
      const subscriptions = items(
        await client.dodopayments.customer.subscriptions.list({
          query: { limit: 100, page: 1 },
          fetchOptions: { signal, throw: true }
        })
      )
      const subscription = subscriptions.map(mapSubscription).find(Boolean)
      if (!subscription) return { usage: [] }

      const providerPlanId = subscription.planId
      const planId =
        Object.entries(options.products ?? {}).find(
          ([, product]) => product.value === providerPlanId
        )?.[0] ?? providerPlanId
      return { subscription: { ...subscription, planId }, usage: [] }
    },
    async checkout(scope, input) {
      userOnlyScope(scope, "Dodo Payments")
      const product = options.products?.[input.planId]
      return actionResult(
        await client.dodopayments.checkoutSession({
          ...(product?.type === "product"
            ? {
                product_cart: [
                  {
                    product_id: product.value,
                    quantity: input.seats ?? 1
                  }
                ]
              }
            : { slug: product?.value ?? input.planId }),
          referenceId:
            scope.type === "user" ? scope.userId : scope.organizationId
        })
      )
    },
    openPortal: portal,
    /** Dodo Payments completes cancellation in its customer portal. */
    cancel: portal,
    /** Dodo Payments completes restoration in its customer portal. */
    restore: portal,
    /** Dodo Payments completes quantity changes in its customer portal. */
    updateSeats: portal
  }
}

export function createCommetBillingAdapter(
  client: CommetBillingClient,
  options: CommetBillingAdapterOptions
): BillingAdapter {
  const portal = async (scope: BillingScope) => {
    userOnlyScope(scope, "Commet")
    return actionResult(await client.customer.portal())
  }

  return {
    id: "commet",
    scopes: { user: true, organization: false },
    supports: {
      cancel: true,
      restore: false,
      seats: Boolean(options.seatFeatureCode)
    },
    async listPlans(scope) {
      userOnlyScope(scope, "Commet")
      return options.plans
    },
    async getState(scope, signal): Promise<BillingState> {
      userOnlyScope(scope, "Commet")
      const [subscriptionResult, featuresResult, seatsResult] =
        await Promise.all([
          client.subscription.get({ signal, throw: true }),
          options.usage
            ? client.features.list({ signal, throw: true })
            : undefined,
          options.seatFeatureCode
            ? client.seats.list({ signal, throw: true })
            : undefined
        ])
      const subscription = mapSubscription(unwrap(subscriptionResult))
      const seat = options.seatFeatureCode
        ? record(record(unwrap(seatsResult))?.[options.seatFeatureCode])
        : undefined
      const normalizedSubscription = subscription
        ? {
            ...subscription,
            planId: resolvePlanId(subscription.planId, options.planIds),
            seats: numberValue(seat?.current) ?? subscription.seats
          }
        : undefined
      const usage = options.usage
        ? items(featuresResult)
            .map(mapCommetUsage)
            .filter((value): value is BillingUsage => Boolean(value))
        : []

      return { subscription: normalizedSubscription, usage }
    },
    /** Commet starts plan changes in its customer portal. */
    checkout: portal,
    openPortal: portal,
    async cancel(scope) {
      userOnlyScope(scope, "Commet")
      return actionResult(
        await client.subscription.cancel({ immediate: false }, { throw: true })
      )
    },
    /** Commet completes restoration in its customer portal. */
    restore: portal,
    async updateSeats(scope, _subscriptionId, seats) {
      userOnlyScope(scope, "Commet")
      if (!options.seatFeatureCode) return portal(scope)
      return actionResult(
        await client.seats.set(
          { featureCode: options.seatFeatureCode, count: seats },
          { throw: true }
        )
      )
    }
  }
}
