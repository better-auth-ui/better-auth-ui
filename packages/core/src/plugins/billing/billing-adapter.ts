export type BillingScope =
  | { type: "user"; userId: string }
  | {
      type: "organization"
      organizationId: string
      organizationSlug: string
    }

export type BillingInterval = "one-time" | "month" | "year"

export type BillingPrice = {
  id: string
  amount: number
  currency: string
  interval: BillingInterval
  intervalCount?: number
}

export type BillingPlan = {
  id: string
  name: string
  description?: string
  prices: BillingPrice[]
  features?: string[]
  highlighted?: boolean
  seatBased?: boolean
}

export type BillingSubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "paused"
  | "canceled"
  | "incomplete"
  | "unknown"

export type BillingSubscription = {
  id: string
  planId: string
  priceId?: string
  interval?: BillingInterval
  planName?: string
  status: BillingSubscriptionStatus
  currentPeriodEnd?: Date
  cancelAtPeriodEnd?: boolean
  canceledAt?: Date
  seats?: number
}

export type BillingUsage = {
  id: string
  label: string
  used: number
  limit?: number
  unit?: string
}

export type BillingState = {
  subscription?: BillingSubscription
  usage: BillingUsage[]
}

export type BillingCheckoutInput = {
  planId: string
  priceId: string
  seats?: number
}

export type BillingActionResult = {
  url?: string
}

export type BillingCapabilities = {
  cancel: boolean
  restore: boolean
  seats: boolean
}

/** Provider-neutral billing operations consumed by every BAUI billing view. */
export interface BillingAdapter {
  readonly id: string
  readonly supports: BillingCapabilities
  listPlans(scope: BillingScope, signal?: AbortSignal): Promise<BillingPlan[]>
  getState(scope: BillingScope, signal?: AbortSignal): Promise<BillingState>
  checkout(
    scope: BillingScope,
    input: BillingCheckoutInput
  ): Promise<BillingActionResult>
  openPortal(scope: BillingScope): Promise<BillingActionResult>
  cancel(
    scope: BillingScope,
    subscriptionId: string
  ): Promise<BillingActionResult>
  restore(
    scope: BillingScope,
    subscriptionId: string
  ): Promise<BillingActionResult>
  updateSeats(
    scope: BillingScope,
    subscriptionId: string,
    seats: number
  ): Promise<BillingActionResult>
}

export const billingScopeKey = (scope: BillingScope) =>
  scope.type === "user"
    ? `user:${scope.userId}`
    : `organization:${scope.organizationId}:${scope.organizationSlug}`

export function followBillingAction(result: BillingActionResult) {
  if (!result.url || typeof window === "undefined") return

  try {
    const url = new URL(result.url, window.location.href)
    if (url.protocol === "http:" || url.protocol === "https:") {
      window.location.assign(url.href)
    }
  } catch {
    // Ignore malformed adapter responses instead of interrupting the UI.
  }
}
