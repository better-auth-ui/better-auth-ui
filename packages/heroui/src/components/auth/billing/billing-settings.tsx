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
import {
  ArrowRotateLeft,
  Check,
  CreditCard,
  Gear,
  Xmark
} from "@gravity-ui/icons"
import {
  AlertDialog,
  Button,
  Card,
  type CardProps,
  Chip,
  cn,
  Label,
  ListBox,
  NumberField,
  ProgressBar,
  Select,
  Spinner
} from "@heroui/react"
import { useState } from "react"

import { billingPlugin } from "../../../lib/auth/billing-plugin"

type SubscriptionAction = "cancel" | "restore"

export type BillingSettingsProps = {
  adapter: BillingAdapter
  scope: BillingScope
  className?: string
  variant?: CardProps["variant"]
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
  onChoose,
  variant
}: {
  plan: BillingPlan
  interval: BillingInterval
  currentPlanId?: string
  isPending: boolean
  onChoose: (plan: BillingPlan, priceId: string) => void
  variant?: CardProps["variant"]
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
      variant={plan.highlighted ? "tertiary" : variant}
      className={cn(
        "relative h-full",
        plan.highlighted && "ring-accent ring-1"
      )}
    >
      <Card.Header className="flex-row items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <Card.Title>{plan.name}</Card.Title>
          {plan.description && (
            <Card.Description>{plan.description}</Card.Description>
          )}
        </div>
        {plan.highlighted && <Chip size="sm">{localization.popular}</Chip>}
      </Card.Header>
      <Card.Content className="flex flex-1 flex-col gap-4">
        <div>
          <span className="text-2xl font-semibold tracking-tight">
            {formatPrice(price.amount, price.currency)}
          </span>
          <span className="text-muted ml-1 text-xs">{suffix}</span>
        </div>
        {plan.features?.length ? (
          <ul className="flex flex-col gap-2 text-sm">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <Check className="text-success mt-0.5 size-4 shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </Card.Content>
      <Card.Footer>
        <Button
          fullWidth
          variant={isCurrent ? "outline" : "primary"}
          isDisabled={isCurrent || isPending}
          onPress={() => onChoose(plan, price.id)}
        >
          {isCurrent ? localization.currentPlan : localization.choosePlan}
        </Button>
      </Card.Footer>
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
      <NumberField
        className="max-w-40"
        minValue={1}
        value={value}
        onChange={(next) => setValue(next ?? 1)}
        variant="secondary"
      >
        <Label>{localization.seats}</Label>
        <NumberField.Group>
          <NumberField.DecrementButton />
          <NumberField.Input />
          <NumberField.IncrementButton />
        </NumberField.Group>
      </NumberField>
      <Button
        size="sm"
        variant="outline"
        isPending={isPending}
        isDisabled={value === seats}
        onPress={() => onSave(value)}
      >
        {localization.updateSeats}
      </Button>
    </div>
  )
}

export function BillingSettings({
  adapter,
  scope,
  className,
  variant
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
  const [actionError, setActionError] = useState("")
  const subscription = state.data?.subscription
  const intervals = availableIntervals(plans.data ?? [])
  const resolvedInterval = intervals.includes(interval)
    ? interval
    : (intervals[0] ?? "month")
  const isActionPending =
    cancelSubscription.isPending || restoreSubscription.isPending

  const handleAction = () => {
    if (!subscription || !action) return
    setActionError("")
    const mutation =
      action === "cancel" ? cancelSubscription : restoreSubscription
    mutation.mutate(subscription.id, {
      onError: (error) => setActionError(error.message),
      onSuccess: (result) => {
        setAction(undefined)
        followBillingAction(result)
      }
    })
  }

  const openAction = (nextAction: SubscriptionAction) => {
    setActionError("")
    setAction(nextAction)
  }

  const closeAction = () => {
    setAction(undefined)
    setActionError("")
  }

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold">{localization.billing}</h2>
        <p className="text-muted text-sm">{localization.billingDescription}</p>
      </div>

      <Card variant={variant}>
        <Card.Header className="flex-row items-start justify-between gap-3">
          <div>
            <Card.Title>{localization.subscription}</Card.Title>
            <Card.Description>
              {subscription
                ? (subscription.planName ?? subscription.planId)
                : localization.noSubscriptionDescription}
            </Card.Description>
          </div>
          {subscription && <Chip size="sm">{subscription.status}</Chip>}
        </Card.Header>
        <Card.Content className="flex flex-col gap-4">
          {state.isPending ? (
            <div className="flex min-h-20 items-center justify-center">
              <Spinner aria-label={localization.loadingBilling} />
            </div>
          ) : subscription ? (
            <>
              {subscription.currentPeriodEnd && (
                <p className="text-muted text-sm">
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
                adapter.supports.seats && (
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
                )}
            </>
          ) : (
            <p className="text-muted text-sm">{localization.noSubscription}</p>
          )}
        </Card.Content>
        <Card.Footer className="flex-wrap gap-2">
          <Button
            variant="outline"
            isPending={portal.isPending}
            onPress={() =>
              portal.mutate(undefined, { onSuccess: followBillingAction })
            }
          >
            <Gear />
            {localization.manageBilling}
          </Button>
          {subscription?.cancelAtPeriodEnd && adapter.supports.restore ? (
            <Button variant="outline" onPress={() => openAction("restore")}>
              <ArrowRotateLeft />
              {localization.restoreSubscription}
            </Button>
          ) : subscription && adapter.supports.cancel ? (
            <Button variant="ghost" onPress={() => openAction("cancel")}>
              <Xmark />
              {localization.cancelSubscription}
            </Button>
          ) : null}
        </Card.Footer>
      </Card>

      {state.data?.usage.length ? (
        <Card variant={variant}>
          <Card.Header>
            <Card.Title>{localization.usage}</Card.Title>
          </Card.Header>
          <Card.Content className="flex flex-col gap-4">
            {state.data.usage.map((usage) => (
              <ProgressBar
                key={usage.id}
                value={usage.used}
                maxValue={usage.limit ?? Math.max(usage.used, 1)}
                valueLabel={
                  usage.limit
                    ? `${usage.used} / ${usage.limit}${usage.unit ? ` ${usage.unit}` : ""}`
                    : localization.used.replace("{{used}}", String(usage.used))
                }
              >
                <Label>{usage.label}</Label>
                <ProgressBar.Output />
                <ProgressBar.Track>
                  <ProgressBar.Fill />
                </ProgressBar.Track>
              </ProgressBar>
            ))}
          </Card.Content>
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
              aria-label={localization.plans}
              value={resolvedInterval}
              onChange={(value) => setInterval(value as BillingInterval)}
            >
              <Select.Trigger className="w-36">
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  {intervals.map((entry) => (
                    <ListBox.Item key={entry} id={entry}>
                      {entry === "month"
                        ? localization.perMonth
                        : entry === "year"
                          ? localization.perYear
                          : localization.oneTime}
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
            </Select>
          )}
        </div>
        {plans.isPending ? (
          <div className="flex min-h-40 items-center justify-center">
            <Spinner aria-label={localization.loadingBilling} />
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
                variant={variant}
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

      <AlertDialog.Backdrop
        isOpen={Boolean(action)}
        onOpenChange={(open) => !open && closeAction()}
      >
        <AlertDialog.Container>
          <AlertDialog.Dialog>
            <AlertDialog.CloseTrigger />
            <AlertDialog.Header>
              <AlertDialog.Icon
                status={action === "cancel" ? "danger" : "default"}
              >
                <CreditCard />
              </AlertDialog.Icon>
              <AlertDialog.Heading>
                {action === "cancel"
                  ? localization.cancelSubscriptionTitle
                  : localization.restoreSubscriptionTitle}
              </AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body>
              <p>
                {action === "cancel"
                  ? localization.cancelSubscriptionDescription
                  : localization.restoreSubscriptionDescription}
              </p>
              {actionError && (
                <p className="text-danger mt-2" role="alert">
                  {actionError}
                </p>
              )}
            </AlertDialog.Body>
            <AlertDialog.Footer>
              <Button variant="ghost" onPress={closeAction}>
                {localization.cancel}
              </Button>
              <Button
                variant={action === "cancel" ? "danger" : "primary"}
                isPending={isActionPending}
                onPress={handleAction}
              >
                {localization.confirm}
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
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
