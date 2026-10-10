import type {
  BillingAdapter,
  BillingScope,
  BillingInterval,
  BillingActionResult
} from "@better-auth-ui/core/plugins/billing"
import { useAuth, useAuthPlugin, useSession } from "@better-auth-ui/react"
import {
  useBillingPlans,
  useBillingState,
  useBillingCheckout,
  useBillingPortal,
  useCancelBillingSubscription,
  useRestoreBillingSubscription,
  useUpdateBillingSeats
} from "@better-auth-ui/react/plugins/billing"
import { useState } from "react"
import { billingPlugin } from "../../../lib/auth/billing-plugin"
import type { CardSlotProps } from "../../../lib/auth-plugin"
import { useNativeLocale } from "../../../lib/native-locale"
import { openExternalURL } from "../../../lib/open-external-url"
import { AlertDialog } from "../../../primitives/alert-dialog"
import { Button } from "../../../primitives/button"
import { Card } from "../../../primitives/card"
import { Description } from "../../../primitives/description"
import { NumberField } from "../../../primitives/inputs-extra"
import { Select } from "../../../primitives/menu"
import { Skeleton } from "../../../primitives/skeleton"
import { Box, Txt } from "../../../primitives/styled"
import { toast } from "../../../primitives/toast"

export type BillingSettingsProps = CardSlotProps & {
  adapter: BillingAdapter
  scope: BillingScope
}

function SeatsEditor({
  seats,
  pending,
  save
}: {
  seats: number
  pending: boolean
  save: (value: number) => void
}) {
  const { localization } = useAuthPlugin(billingPlugin)
  const [value, setValue] = useState(seats)
  return (
    <Box className="gap-2">
      <Txt>{localization.seats}</Txt>
      <NumberField
        value={value}
        onChange={setValue}
        minValue={1}
        isDisabled={pending}
        aria-label={localization.seats}
      />
      <Button
        isPending={pending}
        isDisabled={!Number.isInteger(value) || value < 1 || value === seats}
        onPress={() => save(value)}
      >
        {localization.updateSeats}
      </Button>
    </Box>
  )
}

export function BillingSettings({
  adapter,
  scope,
  className,
  variant
}: BillingSettingsProps) {
  const { baseURL } = useAuth()
  const { languageTag } = useNativeLocale()
  const { localization } = useAuthPlugin(billingPlugin)
  const plans = useBillingPlans(adapter, scope)
  const state = useBillingState(adapter, scope)
  const checkout = useBillingCheckout(adapter, scope)
  const portal = useBillingPortal(adapter, scope)
  const cancel = useCancelBillingSubscription(adapter, scope)
  const restore = useRestoreBillingSubscription(adapter, scope)
  const updateSeats = useUpdateBillingSeats(adapter, scope)
  const [interval, setInterval] = useState<BillingInterval>("month")
  const [action, setAction] = useState<"cancel" | "restore">()
  const [error, setError] = useState("")
  const subscription = state.data?.subscription
  const intervals = [
    ...new Set(
      plans.data?.flatMap((plan) =>
        plan.prices.map((price) => price.interval)
      ) ?? []
    )
  ]
  const currentInterval = intervals.includes(interval) ? interval : intervals[0]
  const pending = cancel.isPending || restore.isPending
  const follow = (result: BillingActionResult) => {
    void openExternalURL(result.url, baseURL).catch((error) =>
      toast.danger(error.message)
    )
  }
  const intervalLabel = (value: BillingInterval) =>
    value === "month"
      ? localization.perMonth
      : value === "year"
        ? localization.perYear
        : localization.oneTime
  const formatPrice = (amount: number, currency: string) => {
    const digits =
      new Intl.NumberFormat(languageTag, {
        style: "currency",
        currency
      }).resolvedOptions().maximumFractionDigits ?? 2
    return new Intl.NumberFormat(languageTag, {
      style: "currency",
      currency
    }).format(amount / 10 ** digits)
  }
  return (
    <Box className={className ?? "gap-4"}>
      <Txt className="font-semibold">{localization.billing}</Txt>
      <Description>{localization.billingDescription}</Description>
      <Card variant={variant}>
        <Card.Header>
          <Card.Title>{localization.subscription}</Card.Title>
        </Card.Header>
        <Card.Content className="gap-3">
          {state.isPending ? (
            <Skeleton className="h-10 w-full" />
          ) : state.error ? (
            <Txt accessibilityRole="alert">{state.error.message}</Txt>
          ) : subscription ? (
            <>
              <Txt>{subscription.planName ?? subscription.planId}</Txt>
              <Description>{subscription.status}</Description>
              {subscription.currentPeriodEnd ? (
                <Description>
                  {(subscription.cancelAtPeriodEnd
                    ? localization.endsOn
                    : localization.renewsOn
                  ).replace(
                    "{{date}}",
                    new Intl.DateTimeFormat(languageTag, {
                      dateStyle: "medium"
                    }).format(subscription.currentPeriodEnd)
                  )}
                </Description>
              ) : null}
              {typeof subscription.seats === "number" &&
              adapter.supports.seats ? (
                <SeatsEditor
                  key={`${subscription.id}:${subscription.seats}`}
                  seats={subscription.seats}
                  pending={updateSeats.isPending}
                  save={(seats) =>
                    updateSeats.mutate(
                      { subscriptionId: subscription.id, seats },
                      { onSuccess: follow }
                    )
                  }
                />
              ) : null}
            </>
          ) : (
            <Description>{localization.noSubscriptionDescription}</Description>
          )}
          <Button
            isPending={portal.isPending}
            onPress={() => portal.mutate(undefined, { onSuccess: follow })}
          >
            {localization.manageBilling}
          </Button>
          {subscription &&
          (subscription.cancelAtPeriodEnd
            ? adapter.supports.restore
            : adapter.supports.cancel) ? (
            <Button
              onPress={() => {
                setError("")
                setAction(subscription.cancelAtPeriodEnd ? "restore" : "cancel")
              }}
            >
              {subscription.cancelAtPeriodEnd
                ? localization.restoreSubscription
                : localization.cancelSubscription}
            </Button>
          ) : null}
        </Card.Content>
      </Card>
      {state.data?.usage.length ? (
        <Card variant={variant}>
          <Card.Header>
            <Card.Title>{localization.usage}</Card.Title>
          </Card.Header>
          <Card.Content className="gap-3">
            {state.data.usage.map((usage) => (
              <Box key={usage.id} className="gap-1">
                <Txt>{usage.label}</Txt>
                <Description>
                  {new Intl.NumberFormat(languageTag).format(usage.used)} /{" "}
                  {usage.limit === undefined
                    ? localization.unlimited
                    : new Intl.NumberFormat(languageTag).format(usage.limit)}
                  {usage.unit ? ` ${usage.unit}` : ""}
                </Description>
                {usage.limit !== undefined && usage.limit > 0 ? (
                  <Box
                    accessibilityRole="progressbar"
                    accessibilityValue={{
                      min: 0,
                      max: usage.limit,
                      now: usage.used
                    }}
                    className="h-2 bg-surface-secondary rounded-full"
                  >
                    <Box
                      className="h-2 bg-accent rounded-full"
                      style={{
                        width: `${Math.max(0, Math.min(100, (usage.used / usage.limit) * 100))}%`
                      }}
                    />
                  </Box>
                ) : null}
              </Box>
            ))}
          </Card.Content>
        </Card>
      ) : null}
      <Txt className="font-semibold">{localization.plans}</Txt>
      {intervals.length > 1 ? (
        <Select
          label={localization.plans}
          selectedKey={currentInterval}
          options={intervals.map((key) => ({ key, label: intervalLabel(key) }))}
          onSelectionChange={(key) => setInterval(key as BillingInterval)}
        />
      ) : null}
      {plans.isPending ? <Skeleton className="h-32 w-full" /> : null}
      {plans.error ? (
        <Txt accessibilityRole="alert">{plans.error.message}</Txt>
      ) : null}
      {plans.data?.map((plan) => {
        const price = plan.prices.find(
          (price) => price.interval === currentInterval
        )
        if (!price) return null
        const current =
          subscription?.planId === plan.id &&
          (!subscription.priceId || subscription.priceId === price.id)
        return (
          <Card key={plan.id} variant={variant}>
            <Card.Header>
              <Card.Title>{plan.name}</Card.Title>
              {plan.highlighted ? (
                <Description>{localization.popular}</Description>
              ) : null}
              {plan.description ? (
                <Description>{plan.description}</Description>
              ) : null}
            </Card.Header>
            <Card.Content className="gap-2">
              <Txt>
                {formatPrice(price.amount, price.currency)}{" "}
                {intervalLabel(price.interval)}
              </Txt>
              {plan.features?.map((feature) => (
                <Description key={feature}>{feature}</Description>
              ))}
              <Button
                isDisabled={current || state.isPending}
                isPending={checkout.isPending}
                onPress={() =>
                  checkout.mutate(
                    {
                      planId: plan.id,
                      priceId: price.id,
                      seats: plan.seatBased ? 1 : undefined
                    },
                    { onSuccess: follow }
                  )
                }
              >
                {current ? localization.currentPlan : localization.choosePlan}
              </Button>
            </Card.Content>
          </Card>
        )
      })}
      <AlertDialog
        isOpen={!!action}
        onOpenChange={(open) => {
          if (!open && !pending) setAction(undefined)
        }}
      >
        <AlertDialog.Header>
          <AlertDialog.Heading>
            {action === "cancel"
              ? localization.cancelSubscriptionTitle
              : localization.restoreSubscriptionTitle}
          </AlertDialog.Heading>
        </AlertDialog.Header>
        <AlertDialog.Body>
          <Description>
            {action === "cancel"
              ? localization.cancelSubscriptionDescription
              : localization.restoreSubscriptionDescription}
          </Description>
          {error ? <Txt accessibilityRole="alert">{error}</Txt> : null}
        </AlertDialog.Body>
        <AlertDialog.Footer>
          <Button isDisabled={pending} onPress={() => setAction(undefined)}>
            {localization.cancel}
          </Button>
          <Button
            isPending={pending}
            onPress={() => {
              if (!subscription || !action) return
              ;(action === "cancel" ? cancel : restore).mutate(
                subscription.id,
                {
                  onError: (error) => setError(error.message),
                  onSuccess: (result) => {
                    setAction(undefined)
                    follow(result)
                  }
                }
              )
            }}
          >
            {localization.confirm}
          </Button>
        </AlertDialog.Footer>
      </AlertDialog>
    </Box>
  )
}

export function UserBillingSettings(props: CardSlotProps) {
  const { authClient } = useAuth()
  const session = useSession(authClient)
  const { adapter } = useAuthPlugin(billingPlugin)
  return session.data ? (
    <BillingSettings
      {...props}
      adapter={adapter}
      scope={{ type: "user", userId: session.data.user.id }}
    />
  ) : (
    <Skeleton className="h-10 w-full" />
  )
}

export function OrganizationBillingSettings({
  organizationId,
  organizationSlug,
  ...props
}: CardSlotProps & { organizationId: string; organizationSlug: string }) {
  const { adapter } = useAuthPlugin(billingPlugin)
  return (
    <BillingSettings
      {...props}
      adapter={adapter}
      scope={{ type: "organization", organizationId, organizationSlug }}
    />
  )
}
