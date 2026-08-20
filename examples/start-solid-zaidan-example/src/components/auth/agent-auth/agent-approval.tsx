import type {
  AgentApprovalRequest,
  AgentAuthClient,
  AgentCapabilityGrant
} from "@better-auth-ui/core/plugins/agent-auth"
import { useAuth, useAuthPlugin, useSession } from "@better-auth-ui/solid"
import {
  useAgentApproval,
  useApproveAgent,
  useDenyAgent
} from "@better-auth-ui/solid/plugins/agent-auth"
import {
  BotIcon,
  CheckIcon,
  CircleCheckIcon,
  CircleXIcon,
  FingerprintIcon
} from "lucide-solid"
import { createEffect, createSignal, For, Match, Show, Switch } from "solid-js"

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
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { agentAuthPlugin } from "@/lib/auth/agent-auth-plugin"
import { cn } from "@/lib/utils"

type ApprovalResult = "approved" | "denied"

const strengthVariant = (strength: AgentCapabilityGrant["approvalStrength"]) =>
  strength === "webauthn" ? "outline" : "secondary"

/** Read the approval parameters the agent host put on the URL. */
function readRequest(): AgentApprovalRequest | undefined {
  if (typeof window === "undefined") return undefined

  const query = new URLSearchParams(window.location.search)
  const agentId = query.get("agent_id")
  if (!agentId) return undefined

  return {
    agentId,
    approvalId: query.get("approval_id") ?? undefined,
    userCode: query.get("code") ?? query.get("user_code") ?? undefined
  }
}

export type AgentApprovalProps = {
  class?: string
}

/** Render the Agent Auth approval page configured by `agentApprovalPage`. */
export function AgentApproval(props: AgentApprovalProps) {
  const auth = useAuth<AgentAuthClient>()
  const plugin = useAuthPlugin(agentAuthPlugin)
  const session = useSession(auth.authClient)
  const userId = () => session.data?.user.id

  // The URL is fixed for the lifetime of the view, so this is read once.
  const request = readRequest()

  const approval = useAgentApproval(plugin.adapter, () => request, userId)
  const approve = useApproveAgent(plugin.adapter, userId)
  const deny = useDenyAgent(plugin.adapter, userId)

  const [selection, setSelection] = createSignal<Set<string>>()
  const [result, setResult] = createSignal<ApprovalResult>()

  createEffect(() => {
    if (session.isPending || session.data || typeof window === "undefined") {
      return
    }

    const returnPath = `${window.location.pathname}${window.location.search}`
    auth.navigate({
      to: `${auth.basePaths.auth}/${auth.viewPaths.auth.signIn}?redirectTo=${encodeURIComponent(returnPath)}`
    })
  })

  const requested = () => approval.data?.requestedCapabilities ?? []
  const selected = () =>
    selection() ?? new Set(requested().map((grant) => grant.capability))

  const updateSelection = (capability: string, isSelected: boolean) => {
    const next = new Set(selected())
    if (isSelected) next.add(capability)
    else next.delete(capability)
    setSelection(next)
  }

  return (
    <Switch>
      <Match when={!request}>
        <Card class={cn("w-full max-w-md", props.class)}>
          <CardContent class="text-sm text-destructive">
            {plugin.localization.invalidRequest}
          </CardContent>
        </Card>
      </Match>

      <Match when={result()}>
        {(decided) => (
          <Card class={cn("w-full max-w-md", props.class)}>
            <CardContent class="flex flex-col items-center gap-4 py-10 text-center">
              <Show
                fallback={<CircleXIcon class="size-10 text-muted-foreground" />}
                when={decided() === "approved"}
              >
                <CircleCheckIcon class="size-10 text-emerald-600" />
              </Show>

              <div class="flex flex-col gap-1">
                <h1 class="font-semibold">
                  {decided() === "approved"
                    ? plugin.localization.approvedTitle
                    : plugin.localization.deniedTitle}
                </h1>
                <p class="text-sm text-muted-foreground">
                  {decided() === "approved"
                    ? plugin.localization.approvedDescription
                    : plugin.localization.deniedDescription}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </Match>

      <Match when={request}>
        {(activeRequest) => (
          <Card class={cn("w-full max-w-md", props.class)}>
            <CardHeader class="flex-row items-start gap-3">
              <div class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted">
                <BotIcon class="size-5" />
              </div>
              <div class="flex min-w-0 flex-col gap-1">
                <CardTitle>{plugin.localization.approvalTitle}</CardTitle>
                <CardDescription>
                  {plugin.localization.approvalDescription}
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent class="flex flex-col gap-5">
              <Switch>
                <Match when={approval.isPending || session.isPending}>
                  <div class="flex flex-col gap-3">
                    <Skeleton class="h-14 rounded-xl" />
                    <Skeleton class="h-20 rounded-xl" />
                    <Skeleton class="h-20 rounded-xl" />
                  </div>
                </Match>

                <Match when={approval.isError}>
                  <p class="text-sm text-destructive">
                    {plugin.localization.approvalError}
                  </p>
                </Match>

                <Match when={approval.data}>
                  {(agent) => (
                    <>
                      <div class="flex items-center justify-between gap-3 rounded-xl bg-muted p-3">
                        <div class="flex min-w-0 flex-col">
                          <span class="truncate text-sm font-semibold">
                            {agent().name}
                          </span>
                          <span class="truncate text-xs text-muted-foreground">
                            {agent().hostName ?? agent().hostId}
                          </span>
                        </div>
                        <Badge variant="secondary">
                          {agent().mode === "autonomous"
                            ? plugin.localization.autonomousAgent
                            : plugin.localization.delegatedAgent}
                        </Badge>
                      </div>

                      <div class="flex flex-col gap-3">
                        <h2 class="text-sm font-semibold">
                          {plugin.localization.requestedCapabilities}
                        </h2>

                        <Show
                          fallback={
                            <p class="text-sm text-muted-foreground">
                              {plugin.localization.noCapabilities}
                            </p>
                          }
                          when={requested().length}
                        >
                          <For each={requested()}>
                            {(grant) => (
                              <label
                                class="flex cursor-pointer items-start gap-3 rounded-lg border p-3"
                                for={`agent-capability-${grant.capability}`}
                              >
                                <Checkbox
                                  checked={selected().has(grant.capability)}
                                  class="mt-0.5"
                                  id={`agent-capability-${grant.capability}`}
                                  onChange={(checked) =>
                                    updateSelection(
                                      grant.capability,
                                      checked === true
                                    )
                                  }
                                >
                                  <CheckIcon />
                                </Checkbox>

                                <span class="flex min-w-0 flex-1 flex-col gap-1">
                                  <span class="break-words text-sm font-medium">
                                    {grant.capability}
                                  </span>
                                  <Show when={grant.description}>
                                    <span class="text-xs text-muted-foreground">
                                      {grant.description}
                                    </span>
                                  </Show>
                                  <Show when={grant.reason}>
                                    <span class="text-xs text-muted-foreground">
                                      {plugin.localization.requestReason}:{" "}
                                      {grant.reason}
                                    </span>
                                  </Show>
                                  <Show when={grant.constraints}>
                                    <span class="text-xs text-muted-foreground">
                                      {plugin.localization.constraints}:{" "}
                                      <code>
                                        {JSON.stringify(grant.constraints)}
                                      </code>
                                    </span>
                                  </Show>

                                  <Badge
                                    class="mt-1 w-fit"
                                    variant={strengthVariant(
                                      grant.approvalStrength
                                    )}
                                  >
                                    <Show
                                      when={
                                        grant.approvalStrength === "webauthn"
                                      }
                                    >
                                      <FingerprintIcon />
                                    </Show>
                                    {grant.approvalStrength === "webauthn"
                                      ? plugin.localization.approvalWebauthn
                                      : grant.approvalStrength === "session"
                                        ? plugin.localization.approvalSession
                                        : plugin.localization.approvalNone}
                                  </Badge>
                                </span>
                              </label>
                            )}
                          </For>
                        </Show>
                      </div>
                    </>
                  )}
                </Match>
              </Switch>
            </CardContent>

            <CardFooter class="gap-3">
              <Button
                class="flex-1"
                disabled={approve.isPending || deny.isPending || !approval.data}
                onClick={() =>
                  deny.mutate(
                    { ...activeRequest(), agentId: activeRequest().agentId },
                    { onSuccess: () => setResult("denied") }
                  )
                }
                type="button"
                variant="outline"
              >
                <Show when={deny.isPending}>
                  <Spinner data-icon="inline-start" />
                </Show>
                {plugin.localization.deny}
              </Button>

              <Button
                class="flex-1"
                disabled={
                  approve.isPending ||
                  !selected().size ||
                  deny.isPending ||
                  !approval.data
                }
                onClick={() =>
                  approve.mutate(
                    {
                      ...activeRequest(),
                      agentId: activeRequest().agentId,
                      capabilities: [...selected()]
                    },
                    { onSuccess: () => setResult("approved") }
                  )
                }
                type="button"
              >
                <Show when={approve.isPending}>
                  <Spinner data-icon="inline-start" />
                </Show>
                {plugin.localization.allow}
              </Button>
            </CardFooter>
          </Card>
        )}
      </Match>
    </Switch>
  )
}
