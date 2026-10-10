import type {
  AgentApprovalRequest,
  AgentAuthClient
} from "@better-auth-ui/core/plugins/agent-auth"
import { useAuth, useAuthPlugin, useSession } from "@better-auth-ui/solid"
import {
  useAgentApproval,
  useApproveAgent,
  useDenyAgent
} from "@better-auth-ui/solid/plugins/agent-auth"
import {
  BotIcon,
  CircleCheckIcon,
  CircleXIcon,
  FingerprintIcon,
  EllipsisIcon
} from "lucide-solid"
import { createEffect, createSignal, For, Match, Show, Switch } from "solid-js"

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
import { UserAvatar } from "../user/user-avatar"
import { cn } from "cn"

type ApprovalResult = "approved" | "denied"

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
          <Card
            class={cn(
              "max-h-[calc(100dvh-2rem)] w-full max-w-lg gap-0! overflow-hidden py-0!",
              props.class
            )}
          >
            <div
              class="min-h-0 overflow-y-auto overscroll-contain focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
              role="region"
              aria-label={plugin.localization.approvalTitle}
              tabIndex={0}
            >
              <CardHeader class="flex flex-col items-stretch gap-5! p-6!">
                <div class="flex items-center justify-center gap-5">
                  <div class="flex size-16 shrink-0 items-center justify-center rounded-full bg-muted/50">
                    <BotIcon aria-hidden="true" class="size-7" />
                  </div>
                  <EllipsisIcon
                    aria-hidden="true"
                    class="size-5 text-muted-foreground"
                  />
                  <Show
                    when={!session.isPending}
                    fallback={<Skeleton class="size-16 rounded-full" />}
                  >
                    <UserAvatar class="size-16!" user={session.data?.user} />
                  </Show>
                </div>
                <div class="grid justify-items-center gap-1 text-center">
                  <CardTitle class="max-w-full break-words text-xl! font-semibold!">
                    {approval.data ? (
                      approval.data.name
                    ) : approval.isPending ? (
                      <Skeleton class="h-6 w-40" />
                    ) : (
                      plugin.localization.approvalTitle
                    )}
                  </CardTitle>
                  <CardDescription>
                    {plugin.localization.approvalDescription}
                  </CardDescription>
                  {approval.data ? (
                    <p class="text-sm text-muted-foreground">
                      {approval.data.hostName ?? approval.data.hostId} ·{" "}
                      {approval.data.mode === "autonomous"
                        ? plugin.localization.autonomousAgent
                        : plugin.localization.delegatedAgent}
                    </p>
                  ) : approval.isPending ? (
                    <Skeleton class="h-4 w-48" />
                  ) : null}
                  <div class="mt-2 flex max-w-full flex-wrap justify-center gap-x-1 text-sm text-muted-foreground">
                    <span>{plugin.localization.signedInAs}</span>
                    {session.data ? (
                      <span class="break-all font-medium text-foreground">
                        {session.data.user.name || session.data.user.email}
                      </span>
                    ) : session.isPending ? (
                      <Skeleton class="h-4 w-32" />
                    ) : null}
                  </div>
                </div>
              </CardHeader>
              <CardContent class="px-4! pt-0! pb-6! sm:px-6!">
                <div class="grid gap-4 rounded-lg bg-muted/50 p-5">
                  <h2 class="text-sm font-medium">
                    {plugin.localization.requestedCapabilities}
                  </h2>
                  {approval.isError ? (
                    <p class="text-sm text-destructive">
                      {plugin.localization.approvalError}
                    </p>
                  ) : approval.isPending || session.isPending ? (
                    <div class="flex gap-3">
                      <Skeleton class="size-4 shrink-0" />
                      <div class="grid flex-1 gap-2">
                        <Skeleton class="h-4 w-32" />
                        <Skeleton class="h-4 w-full" />
                      </div>
                    </div>
                  ) : requested().length ? (
                    <div class="grid gap-5">
                      <For each={requested()}>
                        {(grant) => (
                          <div class="flex items-start gap-3">
                            <Checkbox
                              id={`agent-capability-${grant.capability}`}
                              class="mt-1"
                              checked={selected().has(grant.capability)}
                              disabled={approve.isPending || deny.isPending}
                              aria-label={grant.capability}
                              onChange={(checked) =>
                                updateSelection(
                                  grant.capability,
                                  checked === true
                                )
                              }
                            />
                            <div class="grid min-w-0 flex-1 gap-1">
                              <label
                                for={`agent-capability-${grant.capability}`}
                                class="cursor-pointer text-base leading-6 break-words"
                              >
                                {grant.capability}
                              </label>
                              {grant.description ? (
                                <p class="text-sm leading-5 text-muted-foreground">
                                  {grant.description}
                                </p>
                              ) : null}
                              {grant.reason ? (
                                <p class="text-sm leading-5 text-muted-foreground">
                                  {plugin.localization.requestReason}:{" "}
                                  {grant.reason}
                                </p>
                              ) : null}
                              {grant.approvalStrength !== "none" ? (
                                <p class="flex items-center gap-1.5 text-sm text-muted-foreground">
                                  {grant.approvalStrength === "webauthn" ? (
                                    <>
                                      <FingerprintIcon
                                        aria-hidden="true"
                                        class="size-4"
                                      />
                                      {plugin.localization.approvalWebauthn}
                                    </>
                                  ) : (
                                    plugin.localization.approvalSession
                                  )}
                                </p>
                              ) : null}
                              {grant.constraints ? (
                                <details class="mt-1 text-sm text-muted-foreground">
                                  <summary class="w-fit cursor-pointer rounded-sm focus-visible:outline-2 focus-visible:outline-ring">
                                    {plugin.localization.constraints}
                                  </summary>
                                  <pre class="mt-2 max-w-full overflow-x-auto rounded-md bg-background/50 p-3 text-xs">
                                    {JSON.stringify(grant.constraints, null, 2)}
                                  </pre>
                                </details>
                              ) : null}
                            </div>
                          </div>
                        )}
                      </For>
                    </div>
                  ) : (
                    <p class="text-sm text-muted-foreground">
                      {plugin.localization.noCapabilities}
                    </p>
                  )}
                </div>
              </CardContent>
            </div>
            <CardFooter class="grid shrink-0 grid-cols-2 gap-3 border-t border-border p-4! sm:p-6!">
              <Button
                class="h-11! w-full"
                disabled={
                  approve.isPending ||
                  deny.isPending ||
                  !approval.data ||
                  !session.data ||
                  approval.isFetching ||
                  approval.isError
                }
                variant="secondary"
                onClick={() =>
                  deny.mutate(
                    { ...activeRequest(), agentId: activeRequest().agentId },
                    { onSuccess: () => setResult("denied") }
                  )
                }
              >
                {deny.isPending && <Spinner />}
                {plugin.localization.deny}
              </Button>
              <Button
                class="h-11! w-full"
                disabled={
                  approve.isPending ||
                  deny.isPending ||
                  !selected().size ||
                  !approval.data ||
                  !session.data ||
                  approval.isFetching ||
                  approval.isError
                }
                onClick={() =>
                  approve.mutate(
                    { ...activeRequest(), capabilities: [...selected()] },
                    { onSuccess: () => setResult("approved") }
                  )
                }
              >
                {approve.isPending && <Spinner />}
                {plugin.localization.allow}
              </Button>
            </CardFooter>
          </Card>
        )}
      </Match>
    </Switch>
  )
}
