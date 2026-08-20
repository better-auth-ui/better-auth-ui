import {
  type BillingAdapter,
  type BillingInterval,
  type BillingPlan,
  type BillingScope,
  followBillingAction
} from "@better-auth-ui/core/plugins/billing"
import { useAuth, useAuthPlugin, useSession } from "@better-auth-ui/solid"
import {
  useBillingCheckout,
  useBillingPlans,
  useBillingPortal,
  useBillingState,
  useCancelBillingSubscription,
  useRestoreBillingSubscription,
  useUpdateBillingSeats
} from "@better-auth-ui/solid/plugins/billing"
import { Check, CreditCard, ExternalLink, RotateCcw, X } from "lucide-solid"
import { createEffect, createSignal, For, Match, Show, Switch } from "solid-js"

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
  class?: string
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

function PlanCard(props: {
  plan: BillingPlan
  interval: BillingInterval
  currentPlanId?: string
  isPending: boolean
  onChoose: (plan: BillingPlan, priceId: string) => void
}) {
  const { localization } = useAuthPlugin(billingPlugin)
  const price = () =>
    props.plan.prices.find((entry) => entry.interval === props.interval)
  const isCurrent = () => props.currentPlanId === props.plan.id

  const suffix = (interval: BillingInterval) =>
    interval === "month"
      ? localization.perMonth
      : interval === "year"
        ? localization.perYear
        : localization.oneTime

  return (
    <Show when={price()}>
      {(activePrice) => (
        <Card
          class={cn(
            "relative h-full",
            props.plan.highlighted && "border-primary/50 bg-primary/5"
          )}
        >
          <CardHeader>
            <div class="flex items-start justify-between gap-3">
              <div class="flex min-w-0 flex-col gap-1">
                <CardTitle>{props.plan.name}</CardTitle>
                <Show when={props.plan.description}>
                  <CardDescription>{props.plan.description}</CardDescription>
                </Show>
              </div>
              <Show when={props.plan.highlighted}>
                <Badge>{localization.popular}</Badge>
              </Show>
            </div>
          </CardHeader>

          <CardContent class="flex flex-1 flex-col gap-4">
            <div>
              <span class="text-2xl font-semibold tracking-tight">
                {formatPrice(activePrice().amount, activePrice().currency)}
              </span>
              <span class="ml-1 text-xs text-muted-foreground">
                {suffix(activePrice().interval)}
              </span>
            </div>

            <Show when={props.plan.features?.length}>
              <ul class="flex flex-col gap-2 text-sm">
                <For each={props.plan.features}>
                  {(feature) => (
                    <li class="flex items-start gap-2">
                      <Check class="mt-0.5 size-4 shrink-0 text-emerald-600" />
                      <span>{feature}</span>
                    </li>
                  )}
                </For>
              </ul>
            </Show>
          </CardContent>

          <CardFooter>
            <Button
              class="w-full"
              disabled={isCurrent() || props.isPending}
              onClick={() => props.onChoose(props.plan, activePrice().id)}
              variant={isCurrent() ? "outline" : "default"}
            >
              {isCurrent() ? localization.currentPlan : localization.choosePlan}
            </Button>
          </CardFooter>
        </Card>
      )}
    </Show>
  )
}

function SeatsEditor(props: {
  seats: number
  isPending: boolean
  onSave: (seats: number) => void
}) {
  const { localization } = useAuthPlugin(billingPlugin)
  const [value, setValue] = createSignal(props.seats)

  createEffect(() => setValue(props.seats))

  return (
    <div class="flex items-end gap-2">
      <Field class="max-w-40">
        <FieldLabel for="billing-seats">{localization.seats}</FieldLabel>
        <Input
          id="billing-seats"
          min={1}
          onInput={(event) =>
            setValue(Math.max(1, event.currentTarget.valueAsNumber || 1))
          }
          type="number"
          value={value()}
        />
      </Field>
      <Button
        disabled={props.isPending || value() === props.seats}
        onClick={() => props.onSave(value())}
        size="sm"
        variant="outline"
      >
        <Show when={props.isPending}>
          <Spinner data-icon="inline-start" />
        </Show>
        {localization.updateSeats}
      </Button>
    </div>
  )
}

/**
 * Zaidan has no progress primitive, so the usage bar is rendered here with the
 * ARIA attributes a progress bar needs.
 */
function UsageBar(props: { label: string; percent: number }) {
  return (
    <div
      aria-label={props.label}
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={Math.round(props.percent)}
      class="h-2 w-full overflow-hidden rounded-full bg-muted"
      role="progressbar"
    >
      <div
        class="h-full rounded-full bg-primary transition-[width]"
        style={{ width: `${props.percent}%` }}
      />
    </div>
  )
}

export function BillingSettings(props: BillingSettingsProps) {
  const { localization } = useAuthPlugin(billingPlugin)
  const scope = () => props.scope

  const plans = useBillingPlans(props.adapter, scope)
  const state = useBillingState(props.adapter, scope)
  const checkout = useBillingCheckout(props.adapter, scope)
  const portal = useBillingPortal(props.adapter, scope)
  const cancelSubscription = useCancelBillingSubscription(props.adapter, scope)
  const restoreSubscription = useRestoreBillingSubscription(
    props.adapter,
    scope
  )
  const updateSeats = useUpdateBillingSeats(props.adapter, scope)

  const [interval, setInterval] = createSignal<BillingInterval>("month")
  const [action, setAction] = createSignal<SubscriptionAction>()

  const subscription = () => state.data?.subscription
  const intervals = () => availableIntervals(plans.data ?? [])
  const resolvedInterval = () =>
    intervals().includes(interval()) ? interval() : (intervals()[0] ?? "month")
  const isActionPending = () =>
    cancelSubscription.isPending || restoreSubscription.isPending

  const intervalLabel = (entry: BillingInterval) =>
    entry === "month"
      ? localization.perMonth
      : entry === "year"
        ? localization.perYear
        : localization.oneTime

  const handleAction = () => {
    const active = subscription()
    const pending = action()
    if (!active || !pending) return

    const mutation =
      pending === "cancel" ? cancelSubscription : restoreSubscription

    mutation.mutate(active.id, {
      onSuccess: (result) => {
        setAction(undefined)
        followBillingAction(result)
      }
    })
  }

  return (
    <div class={cn("flex flex-col gap-6", props.class)}>
      <div class="flex flex-col gap-1">
        <h2 class="text-base font-semibold">{localization.billing}</h2>
        <p class="text-sm text-muted-foreground">
          {localization.billingDescription}
        </p>
      </div>

      <Card>
        <CardHeader>
          <div class="flex items-start justify-between gap-3">
            <div>
              <CardTitle>{localization.subscription}</CardTitle>
              <CardDescription>
                {subscription()
                  ? (subscription()?.planName ?? subscription()?.planId)
                  : localization.noSubscriptionDescription}
              </CardDescription>
            </div>
            <Show when={subscription()}>
              {(active) => <Badge variant="secondary">{active().status}</Badge>}
            </Show>
          </div>
        </CardHeader>

        <CardContent class="flex flex-col gap-4">
          <Switch>
            <Match when={state.isPending}>
              <div class="flex min-h-20 items-center justify-center">
                <Spinner />
                <span class="sr-only">{localization.loadingBilling}</span>
              </div>
            </Match>

            <Match when={subscription()}>
              {(active) => (
                <>
                  <Show when={active().currentPeriodEnd}>
                    {(periodEnd) => (
                      <p class="text-sm text-muted-foreground">
                        {(active().cancelAtPeriodEnd
                          ? localization.endsOn
                          : localization.renewsOn
                        ).replace(
                          "{{date}}",
                          new Intl.DateTimeFormat(undefined, {
                            dateStyle: "medium"
                          }).format(periodEnd())
                        )}
                      </p>
                    )}
                  </Show>

                  <Show
                    when={
                      typeof active().seats === "number" &&
                      props.adapter.supports.seats
                    }
                  >
                    <SeatsEditor
                      isPending={updateSeats.isPending}
                      onSave={(seats) =>
                        updateSeats.mutate(
                          { subscriptionId: active().id, seats },
                          { onSuccess: followBillingAction }
                        )
                      }
                      seats={active().seats ?? 1}
                    />
                  </Show>
                </>
              )}
            </Match>

            <Match when={!subscription()}>
              <p class="text-sm text-muted-foreground">
                {localization.noSubscription}
              </p>
            </Match>
          </Switch>
        </CardContent>

        <CardFooter class="flex-wrap gap-2">
          <Button
            disabled={portal.isPending}
            onClick={() =>
              portal.mutate(undefined, { onSuccess: followBillingAction })
            }
            variant="outline"
          >
            <Show
              fallback={<ExternalLink data-icon="inline-start" />}
              when={portal.isPending}
            >
              <Spinner data-icon="inline-start" />
            </Show>
            {localization.manageBilling}
          </Button>

          <Switch>
            <Match
              when={
                subscription()?.cancelAtPeriodEnd &&
                props.adapter.supports.restore
              }
            >
              <Button onClick={() => setAction("restore")} variant="outline">
                <RotateCcw data-icon="inline-start" />
                {localization.restoreSubscription}
              </Button>
            </Match>

            <Match when={subscription() && props.adapter.supports.cancel}>
              <Button onClick={() => setAction("cancel")} variant="ghost">
                <X data-icon="inline-start" />
                {localization.cancelSubscription}
              </Button>
            </Match>
          </Switch>
        </CardFooter>
      </Card>

      <Show when={state.data?.usage.length}>
        <Card>
          <CardHeader>
            <CardTitle>{localization.usage}</CardTitle>
          </CardHeader>
          <CardContent class="flex flex-col gap-4">
            <For each={state.data?.usage}>
              {(usage) => (
                <div class="flex flex-col gap-2">
                  <div class="flex items-center justify-between gap-3 text-sm">
                    <span class="font-medium">{usage.label}</span>
                    <span class="text-muted-foreground">
                      {usage.limit
                        ? `${usage.used} / ${usage.limit}${usage.unit ? ` ${usage.unit}` : ""}`
                        : localization.used.replace(
                            "{{used}}",
                            String(usage.used)
                          )}
                    </span>
                  </div>
                  <UsageBar
                    label={usage.label}
                    percent={
                      usage.limit
                        ? Math.min(100, (usage.used / usage.limit) * 100)
                        : 0
                    }
                  />
                </div>
              )}
            </For>
          </CardContent>
        </Card>
      </Show>

      <section
        aria-labelledby="billing-plans-heading"
        class="flex flex-col gap-3"
      >
        <div class="flex items-end justify-between gap-3">
          <h3 class="text-sm font-semibold" id="billing-plans-heading">
            {localization.plans}
          </h3>

          <Show when={intervals().length > 1}>
            <Select
              itemComponent={(itemProps) => (
                <SelectItem item={itemProps.item}>
                  {intervalLabel(itemProps.item.rawValue)}
                </SelectItem>
              )}
              onChange={(value) => {
                if (value) setInterval(value)
              }}
              options={intervals()}
              value={resolvedInterval()}
            >
              <SelectTrigger aria-label={localization.plans} class="w-36">
                <SelectValue>
                  {(selectState) =>
                    intervalLabel(
                      selectState.selectedOption() as BillingInterval
                    )
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent />
            </Select>
          </Show>
        </div>

        <Show
          fallback={
            <div class="flex min-h-40 items-center justify-center">
              <Spinner />
              <span class="sr-only">{localization.loadingBilling}</span>
            </div>
          }
          when={!plans.isPending}
        >
          <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <For each={plans.data}>
              {(plan) => (
                <PlanCard
                  currentPlanId={subscription()?.planId}
                  interval={resolvedInterval()}
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
                  plan={plan}
                />
              )}
            </For>
          </div>
        </Show>
      </section>

      <AlertDialog
        onOpenChange={(open) => {
          if (!open) setAction(undefined)
        }}
        open={Boolean(action())}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <CreditCard />
            </AlertDialogMedia>
            <AlertDialogTitle>
              {action() === "cancel"
                ? localization.cancelSubscriptionTitle
                : localization.restoreSubscriptionTitle}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {action() === "cancel"
                ? localization.cancelSubscriptionDescription
                : localization.restoreSubscriptionDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isActionPending()}>
              {localization.cancel}
            </AlertDialogCancel>
            <Button
              disabled={isActionPending()}
              onClick={handleAction}
              type="button"
              variant={action() === "cancel" ? "destructive" : "default"}
            >
              <Show when={isActionPending()}>
                <Spinner data-icon="inline-start" />
              </Show>
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
  const auth = useAuth()
  const session = useSession(auth.authClient)
  const { adapter } = useAuthPlugin(billingPlugin)

  return (
    <Show when={session.data?.user.id}>
      {(userId) => (
        <BillingSettings
          adapter={adapter}
          class={props.class}
          scope={{ type: "user", userId: userId() }}
        />
      )}
    </Show>
  )
}

export function OrganizationBillingSettings(
  props: Omit<BillingSettingsProps, "adapter" | "scope"> & {
    organizationId: string
    organizationSlug: string
  }
) {
  const { adapter } = useAuthPlugin(billingPlugin)

  return (
    <Show when={props.organizationId && props.organizationSlug}>
      <BillingSettings
        adapter={adapter}
        class={props.class}
        scope={{
          type: "organization",
          organizationId: props.organizationId,
          organizationSlug: props.organizationSlug
        }}
      />
    </Show>
  )
}
