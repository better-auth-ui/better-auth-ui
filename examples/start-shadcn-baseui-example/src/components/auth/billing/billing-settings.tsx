"use client"

import {
  type BillingAdapter,
  type BillingInterval,
  type BillingPlan,
  type BillingScope,
  followBillingAction
} from "@better-auth-ui/core/plugins/billing"
import { useAuth, useAuthPlugin, useSession } from "@better-auth-ui/react"
import {
  useBillingCheckout,
  useBillingPlans,
  useBillingPortal,
  useBillingState,
  useCancelBillingSubscription,
  useRestoreBillingSubscription,
  useUpdateBillingSeats
} from "@better-auth-ui/react/plugins/billing"
import { Check, CreditCard, ExternalLink, RotateCcw, X } from "lucide-react"
import { useState } from "react"

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { billingPlugin } from "@/lib/auth/billing-plugin"
import { cn } from "@/lib/utils"

type SubscriptionAction = "cancel" | "restore"

export type BillingSettingsProps = {
  adapter: BillingAdapter
  scope: BillingScope
  className?: string
}

const formatPrice = (amount: number, currency: string) => {
  const fractionDigits =
    new Intl.NumberFormat(undefined, {
      style: "currency",
      currency
    }).resolvedOptions().maximumFractionDigits ?? 2
  const divisor = 10 ** fractionDigits

  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: amount % divisor === 0 ? 0 : fractionDigits
  }).format(amount / divisor)
}

const availableIntervals = (plans: BillingPlan[]) =>
  Array.from(
    new Set(plans.flatMap((plan) => plan.prices.map((price) => price.interval)))
  )

function PlanCard({
  plan,
  interval,
  currentPlanId,
  isPending,
  onChoose
}: {
  plan: BillingPlan
  interval: BillingInterval
  currentPlanId?: string
  isPending: boolean
  onChoose: (plan: BillingPlan, priceId: string) => void
}) {
  const { localization } = useAuthPlugin(billingPlugin)
  const price = plan.prices.find((entry) => entry.interval === interval)
  if (!price) return null
  const isCurrent = currentPlanId === plan.id
  const suffix =
    price.interval === "month"
      ? localization.perMonth
      : price.interval === "year"
        ? localization.perYear
        : localization.oneTime

  return (
    <Card
      className={cn(
        "relative h-full",
        plan.highlighted && "border-primary/50 bg-primary/5"
      )}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            <CardTitle>{plan.name}</CardTitle>
            {plan.description && (
              <CardDescription>{plan.description}</CardDescription>
            )}
          </div>
          {plan.highlighted && <Badge>{localization.popular}</Badge>}
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <div>
          <span className="text-2xl font-semibold tracking-tight">
            {formatPrice(price.amount, price.currency)}
          </span>
          <span className="ml-1 text-xs text-muted-foreground">{suffix}</span>
        </div>
        {plan.features?.length ? (
          <ul className="flex flex-col gap-2 text-sm">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          variant={isCurrent ? "outline" : "default"}
          disabled={isCurrent || isPending}
          onClick={() => onChoose(plan, price.id)}
        >
          {isCurrent ? localization.currentPlan : localization.choosePlan}
        </Button>
      </CardFooter>
    </Card>
  )
}

function SeatsEditor({
  seats,
  isPending,
  onSave
}: {
  seats: number
  isPending: boolean
  onSave: (seats: number) => void
}) {
  const { localization } = useAuthPlugin(billingPlugin)
  const [value, setValue] = useState(seats)

  return (
    <div className="flex items-end gap-2">
      <Field className="max-w-40">
        <FieldLabel htmlFor="billing-seats">{localization.seats}</FieldLabel>
        <Input
          id="billing-seats"
          type="number"
          min={1}
          value={value}
          onChange={(event) =>
            setValue(Math.max(1, event.target.valueAsNumber || 1))
          }
        />
      </Field>
      <Button
        size="sm"
        variant="outline"
        disabled={isPending || value === seats}
        onClick={() => onSave(value)}
      >
        {isPending && <Spinner />}
        {localization.updateSeats}
      </Button>
    </div>
  )
}

export function BillingSettings({
  adapter,
  scope,
  className
}: BillingSettingsProps) {
  const { localization } = useAuthPlugin(billingPlugin)
  const plans = useBillingPlans(adapter, scope)
  const state = useBillingState(adapter, scope)
  const checkout = useBillingCheckout(adapter, scope)
  const portal = useBillingPortal(adapter, scope)
  const cancelSubscription = useCancelBillingSubscription(adapter, scope)
  const restoreSubscription = useRestoreBillingSubscription(adapter, scope)
  const updateSeats = useUpdateBillingSeats(adapter, scope)
  const [interval, setInterval] = useState<BillingInterval>("month")
  const [action, setAction] = useState<SubscriptionAction>()
  const subscription = state.data?.subscription
  const intervals = availableIntervals(plans.data ?? [])
  const resolvedInterval = intervals.includes(interval)
    ? interval
    : (intervals[0] ?? "month")
  const isActionPending =
    cancelSubscription.isPending || restoreSubscription.isPending

  const handleAction = () => {
    if (!subscription || !action) return
    const mutation =
      action === "cancel" ? cancelSubscription : restoreSubscription
    mutation.mutate(subscription.id, {
      onSuccess: (result) => {
        setAction(undefined)
        followBillingAction(result)
      }
    })
  }

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold">{localization.billing}</h2>
        <p className="text-sm text-muted-foreground">
          {localization.billingDescription}
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle>{localization.subscription}</CardTitle>
              <CardDescription>
                {subscription
                  ? (subscription.planName ?? subscription.planId)
                  : localization.noSubscriptionDescription}
              </CardDescription>
            </div>
            {subscription && (
              <Badge variant="secondary">{subscription.status}</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {state.isPending ? (
            <div className="flex min-h-20 items-center justify-center">
              <Spinner />
              <span className="sr-only">{localization.loadingBilling}</span>
            </div>
          ) : subscription ? (
            <>
              {subscription.currentPeriodEnd && (
                <p className="text-sm text-muted-foreground">
                  {(subscription.cancelAtPeriodEnd
                    ? localization.endsOn
                    : localization.renewsOn
                  ).replace(
                    "{{date}}",
                    new Intl.DateTimeFormat(undefined, {
                      dateStyle: "medium"
                    }).format(subscription.currentPeriodEnd)
                  )}
                </p>
              )}
              {typeof subscription.seats === "number" &&
                (adapter.supports.seats ? (
                  <SeatsEditor
                    key={subscription.id}
                    seats={subscription.seats}
                    isPending={updateSeats.isPending}
                    onSave={(seats) =>
                      updateSeats.mutate(
                        { subscriptionId: subscription.id, seats },
                        { onSuccess: followBillingAction }
                      )
                    }
                  />
                ) : (
                  <Button
                    className="self-start"
                    size="sm"
                    variant="outline"
                    disabled={portal.isPending}
                    onClick={() =>
                      portal.mutate(undefined, {
                        onSuccess: followBillingAction
                      })
                    }
                  >
                    {portal.isPending ? <Spinner /> : <ExternalLink />}
                    {localization.manageBilling}
                  </Button>
                ))}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              {localization.noSubscription}
            </p>
          )}
        </CardContent>
        <CardFooter className="flex-wrap gap-2">
          <Button
            variant="outline"
            disabled={portal.isPending}
            onClick={() =>
              portal.mutate(undefined, { onSuccess: followBillingAction })
            }
          >
            {portal.isPending ? <Spinner /> : <ExternalLink />}
            {localization.manageBilling}
          </Button>
          {subscription?.cancelAtPeriodEnd && adapter.supports.restore ? (
            <Button variant="outline" onClick={() => setAction("restore")}>
              <RotateCcw />
              {localization.restoreSubscription}
            </Button>
          ) : subscription && adapter.supports.cancel ? (
            <Button variant="ghost" onClick={() => setAction("cancel")}>
              <X />
              {localization.cancelSubscription}
            </Button>
          ) : null}
        </CardFooter>
      </Card>

      {state.data?.usage.length ? (
        <Card>
          <CardHeader>
            <CardTitle>{localization.usage}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {state.data.usage.map((usage) => (
              <div key={usage.id} className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium">{usage.label}</span>
                  <span className="text-muted-foreground">
                    {usage.limit
                      ? `${usage.used} / ${usage.limit}${usage.unit ? ` ${usage.unit}` : ""}`
                      : localization.used.replace(
                          "{{used}}",
                          String(usage.used)
                        )}
                  </span>
                </div>
                <Progress
                  value={usage.limit ? (usage.used / usage.limit) * 100 : 0}
                  aria-label={usage.label}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <section
        className="flex flex-col gap-3"
        aria-labelledby="billing-plans-heading"
      >
        <div className="flex items-end justify-between gap-3">
          <h3 id="billing-plans-heading" className="text-sm font-semibold">
            {localization.plans}
          </h3>
          {intervals.length > 1 && (
            <Select
              value={resolvedInterval}
              onValueChange={(value) => setInterval(value as BillingInterval)}
            >
              <SelectTrigger className="w-36" aria-label={localization.plans}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {intervals.map((entry) => (
                  <SelectItem key={entry} value={entry}>
                    {entry === "month"
                      ? localization.perMonth
                      : entry === "year"
                        ? localization.perYear
                        : localization.oneTime}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        {plans.isPending ? (
          <div className="flex min-h-40 items-center justify-center">
            <Spinner />
            <span className="sr-only">{localization.loadingBilling}</span>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {plans.data?.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                interval={resolvedInterval}
                currentPlanId={subscription?.planId}
                isPending={checkout.isPending}
                onChoose={(selectedPlan, priceId) =>
                  checkout.mutate(
                    {
                      planId: selectedPlan.id,
                      priceId,
                      seats: selectedPlan.seatBased ? 1 : undefined
                    },
                    { onSuccess: followBillingAction }
                  )
                }
              />
            ))}
          </div>
        )}
      </section>

      <AlertDialog
        open={Boolean(action)}
        onOpenChange={(open) => !open && setAction(undefined)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <CreditCard />
            </AlertDialogMedia>
            <AlertDialogTitle>
              {action === "cancel"
                ? localization.cancelSubscriptionTitle
                : localization.restoreSubscriptionTitle}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {action === "cancel"
                ? localization.cancelSubscriptionDescription
                : localization.restoreSubscriptionDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isActionPending}>
              {localization.cancel}
            </AlertDialogCancel>
            <Button
              type="button"
              variant={action === "cancel" ? "destructive" : "default"}
              disabled={isActionPending}
              onClick={handleAction}
            >
              {isActionPending && <Spinner />}
              {localization.confirm}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export function UserBillingSettings(
  props: Omit<BillingSettingsProps, "adapter" | "scope">
) {
  const { authClient } = useAuth()
  const { data: session } = useSession(authClient)
  const { adapter } = useAuthPlugin(billingPlugin)
  if (!session?.user.id) return null
  return (
    <BillingSettings
      {...props}
      adapter={adapter}
      scope={{ type: "user", userId: session.user.id }}
    />
  )
}

export function OrganizationBillingSettings({
  organizationId,
  organizationSlug,
  ...props
}: Omit<BillingSettingsProps, "adapter" | "scope"> & {
  organizationId: string
  organizationSlug: string
}) {
  const { adapter } = useAuthPlugin(billingPlugin)
  if (!organizationId || !organizationSlug) return null

  return (
    <BillingSettings
      {...props}
      adapter={adapter}
      scope={{ type: "organization", organizationId, organizationSlug }}
    />
  )
}
