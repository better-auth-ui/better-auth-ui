"use client"

import type {
  AgentAuthClient,
  AgentAuthorization,
  AgentCapabilityGrant
} from "@better-auth-ui/core/plugins/agent-auth"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import {
  useAgentAuthorizations,
  useRevokeAgentCapability
} from "@better-auth-ui/react/plugins/agent-auth"
import { BotIcon, ShieldAlertIcon, XIcon } from "lucide-react"
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
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { agentAuthPlugin } from "@/lib/auth/agent-auth-plugin"
import { cn } from "@/lib/utils"

type RevokeTarget = {
  agent: AgentAuthorization
  grant: AgentCapabilityGrant
}

export type AgentAuthorizationsProps = { className?: string }

/** List user-owned agents and revoke individual active capability grants. */
export function AgentAuthorizations({ className }: AgentAuthorizationsProps) {
  const { authClient, localization } = useAuth<AgentAuthClient>()
  const plugin = useAuthPlugin(agentAuthPlugin)
  const agents = useAgentAuthorizations(authClient, plugin.adapter)
  const revoke = useRevokeAgentCapability(authClient, plugin.adapter)
  const [target, setTarget] = useState<RevokeTarget>()

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-semibold">{plugin.localization.agents}</h2>
        <p className="text-xs text-muted-foreground">
          {plugin.localization.agentsDescription}
        </p>
      </div>
      <Card className="p-0">
        <CardContent className="flex flex-col gap-5 p-4">
          {agents.isPending ? (
            <>
              <Skeleton className="h-24 rounded-xl" />
              <Skeleton className="h-24 rounded-xl" />
            </>
          ) : agents.data?.length ? (
            agents.data.map((agent) => (
              <div key={agent.id} className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                    <BotIcon className="size-4" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-semibold">
                      {agent.name}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {agent.hostName ?? agent.hostId}
                    </span>
                  </div>
                  <Badge variant="secondary">
                    {agent.mode === "autonomous"
                      ? plugin.localization.autonomousAgent
                      : plugin.localization.delegatedAgent}
                  </Badge>
                </div>
                <div className="flex flex-col gap-2 pl-13">
                  {agent.grants.map((grant) => (
                    <div
                      key={grant.capability}
                      className="flex items-center gap-2"
                    >
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-sm">
                          {grant.capability}
                        </span>
                        {grant.description && (
                          <span className="truncate text-xs text-muted-foreground">
                            {grant.description}
                          </span>
                        )}
                      </div>
                      <Badge variant="secondary">
                        {plugin.localization[grant.status]}
                      </Badge>
                      {grant.status === "active" && (
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="ghost"
                          aria-label={`${plugin.localization.revoke} ${grant.capability}`}
                          onClick={() => setTarget({ agent, grant })}
                        >
                          <XIcon />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="flex items-center gap-3 text-muted-foreground">
              <BotIcon className="size-5" />
              <p className="text-sm">{plugin.localization.noAgents}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={Boolean(target)}
        onOpenChange={(open) => {
          if (!open) setTarget(undefined)
        }}
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
          <code className="rounded-lg bg-muted p-3 text-xs">
            {target?.grant.capability}
          </code>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={revoke.isPending}>
              {localization.settings.cancel}
            </AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={revoke.isPending}
              onClick={() => {
                if (!target) return
                revoke.mutate(
                  {
                    agentId: target.agent.id,
                    capability: target.grant.capability
                  },
                  { onSuccess: () => setTarget(undefined) }
                )
              }}
            >
              {revoke.isPending && <Spinner />}
              {plugin.localization.confirmRevoke}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
