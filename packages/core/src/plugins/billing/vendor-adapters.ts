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

type Endpoint = (params?: unknown) => Promise<unknown>

export type StripeBillingClient = {
  subscription: {
    list: Endpoint
    upgrade: Endpoint
    billingPortal: Endpoint
    cancel: Endpoint
    restore: Endpoint
  }
}

export type PolarBillingClient = {
  checkout: Endpoint
  customer: {
    portal: Endpoint
    subscriptions: { list: Endpoint }
  }
  usage: { meters: { list: Endpoint } }
}

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
  return status === "active" ||
    status === "trialing" ||
    status === "past_due" ||
    status === "paused" ||
    status === "canceled" ||
    status === "incomplete"
    ? status
    : "unknown"
}

const mapSubscription = (value: unknown): BillingSubscription | undefined => {
  const subscription = record(value)
  const id = stringValue(subscription?.id)
  if (!subscription || !id) return undefined
  const product = record(subscription.product)

  return {
    id,
    planId:
      stringValue(subscription.plan) ??
      stringValue(subscription.productId) ??
      stringValue(subscription.product_id) ??
      stringValue(product?.id) ??
      "unknown",
    planName: stringValue(subscription.planName) ?? stringValue(product?.name),
    status: statusValue(subscription.status),
    currentPeriodEnd: dateValue(
      subscription.currentPeriodEnd ?? subscription.current_period_end
    ),
    cancelAtPeriodEnd: Boolean(
      subscription.cancelAtPeriodEnd ?? subscription.cancel_at_period_end
    ),
    canceledAt: dateValue(subscription.canceledAt ?? subscription.canceled_at),
    seats: numberValue(subscription.seats) ?? numberValue(subscription.quantity)
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
  return { url: stringValue(value?.url ?? value?.customerPortalUrl) }
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

  return {
    id: "stripe",
    async listPlans() {
      return options.plans
    },
    async getState(scope, signal) {
      const subscriptions = items(
        await client.subscription.list({
          query: scopeParams(scope),
          fetchOptions: { signal, throw: true }
        })
      )
        .map(mapSubscription)
        .filter((value): value is BillingSubscription => Boolean(value))

      return { subscription: subscriptions[0], usage: [] }
    },
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
          returnUrl: options.returnUrl
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
      const state = await this.getState(scope)
      const planId = state.subscription?.planId
      const plan = planId ? findPlan(planId) : undefined
      const price = plan?.prices[0]
      if (!plan || !price)
        throw new Error("The current billing plan is unavailable.")
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

  const portal = async (scope: BillingScope) =>
    actionResult(
      await client.customer.portal({
        ...(scope.type === "organization"
          ? { referenceId: scope.organizationId }
          : {}),
        returnUrl: options.returnUrl,
        disableRedirect: true
      })
    )

  return {
    id: "polar",
    async listPlans() {
      return options.plans
    },
    async getState(scope, signal): Promise<BillingState> {
      const query = {
        page: 1,
        limit: 100,
        active: false,
        ...(scope.type === "organization"
          ? { referenceId: scope.organizationId }
          : {})
      }
      const [subscriptionsResult, usageResult] = await Promise.all([
        client.customer.subscriptions.list({
          query,
          fetchOptions: { signal, throw: true }
        }),
        client.usage.meters.list({
          query,
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
    cancel: portal,
    restore: portal,
    updateSeats: portal
  }
}
