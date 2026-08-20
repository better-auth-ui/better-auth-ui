import type {
  AgentAuthClient,
  AgentAuthorization,
  AgentCapabilityGrant
} from "@better-auth-ui/core/plugins/agent-auth"
import { useAuth, useAuthPlugin, useSession } from "@better-auth-ui/solid"
import {
  useAgentAuthorizations,
  useRevokeAgentCapability
} from "@better-auth-ui/solid/plugins/agent-auth"
import { BotIcon, ShieldAlertIcon, XIcon } from "lucide-solid"
import { createSignal, For, Match, Show, Switch } from "solid-js"

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
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { agentAuthPlugin } from "@/lib/auth/agent-auth-plugin"
import { cn } from "@/lib/utils"

type RevokeTarget = {
  agent: AgentAuthorization
  grant: AgentCapabilityGrant
}

export type AgentAuthorizationsProps = {
  class?: string
}

/** List user-owned agents and revoke individual active capability grants. */
export function AgentAuthorizations(props: AgentAuthorizationsProps) {
  const auth = useAuth<AgentAuthClient>()
  const plugin = useAuthPlugin(agentAuthPlugin)
  // The Solid agent-auth hooks take the user id directly, unlike the React
  // ones which resolve it from the client.
  const session = useSession(auth.authClient)
  const userId = () => session.data?.user.id
  const agents = useAgentAuthorizations(plugin.adapter, userId)
  const revoke = useRevokeAgentCapability(plugin.adapter, userId)
  const [target, setTarget] = createSignal<RevokeTarget>()

  return (
    <div class={cn("flex flex-col gap-3", props.class)}>
      <div class="flex flex-col gap-1">
        <h2 class="text-sm font-semibold">{plugin.localization.agents}</h2>
        <p class="text-xs text-muted-foreground">
          {plugin.localization.agentsDescription}
        </p>
      </div>

      <Card class="p-0">
        <CardContent class="flex flex-col gap-5 p-4">
          <Switch>
            <Match when={agents.isPending}>
              <Skeleton class="h-24 rounded-xl" />
              <Skeleton class="h-24 rounded-xl" />
            </Match>

            <Match when={agents.data?.length}>
              <For each={agents.data}>
                {(agent) => (
                  <div class="flex flex-col gap-3">
                    <div class="flex items-center gap-3">
                      <div class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                        <BotIcon class="size-4" />
                      </div>
                      <div class="flex min-w-0 flex-1 flex-col">
                        <span class="truncate text-sm font-semibold">
                          {agent.name}
                        </span>
                        <span class="truncate text-xs text-muted-foreground">
                          {agent.hostName ?? agent.hostId}
                        </span>
                      </div>
                      <Badge variant="secondary">
                        {agent.mode === "autonomous"
                          ? plugin.localization.autonomousAgent
                          : plugin.localization.delegatedAgent}
                      </Badge>
                    </div>

                    <div class="flex flex-col gap-2 pl-13">
                      <For each={agent.grants}>
                        {(grant) => (
                          <div class="flex items-center gap-2">
                            <div class="flex min-w-0 flex-1 flex-col">
                              <span class="truncate text-sm">
                                {grant.capability}
                              </span>
                              <Show when={grant.description}>
                                <span class="truncate text-xs text-muted-foreground">
                                  {grant.description}
                                </span>
                              </Show>
                            </div>
                            <Badge variant="secondary">
                              {plugin.localization[grant.status]}
                            </Badge>
                            <Show when={grant.status === "active"}>
                              <Button
                                aria-label={`${plugin.localization.revoke} ${grant.capability}`}
                                onClick={() => setTarget({ agent, grant })}
                                size="icon-sm"
                                type="button"
                                variant="ghost"
                              >
                                <XIcon />
                              </Button>
                            </Show>
                          </div>
                        )}
                      </For>
                    </div>
                  </div>
                )}
              </For>
            </Match>

            <Match when={!agents.data?.length}>
              <div class="flex items-center gap-3 text-muted-foreground">
                <BotIcon class="size-5" />
                <p class="text-sm">{plugin.localization.noAgents}</p>
              </div>
            </Match>
          </Switch>
        </CardContent>
      </Card>

      <AlertDialog
        onOpenChange={(open) => {
          if (!open) setTarget(undefined)
        }}
        open={Boolean(target())}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <ShieldAlertIcon />
            </AlertDialogMedia>
            <AlertDialogTitle>
              {plugin.localization.revokeTitle}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {plugin.localization.revokeDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <code class="rounded-lg bg-muted p-3 text-xs">
            {target()?.grant.capability}
          </code>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={revoke.isPending}>
              {auth.localization.settings.cancel}
            </AlertDialogCancel>
            <Button
              disabled={revoke.isPending}
              onClick={() => {
                const revokeTarget = target()
                if (!revokeTarget) return

                revoke.mutate(
                  {
                    agentId: revokeTarget.agent.id,
                    capability: revokeTarget.grant.capability
                  },
                  { onSuccess: () => setTarget(undefined) }
                )
              }}
              type="button"
              variant="destructive"
            >
              <Show when={revoke.isPending}>
                <Spinner data-icon="inline-start" />
              </Show>
              {plugin.localization.confirmRevoke}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
