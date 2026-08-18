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
import { FaceRobot, ShieldExclamation, Xmark } from "@gravity-ui/icons"
import {
  AlertDialog,
  Button,
  Card,
  type CardProps,
  Chip,
  cn,
  Skeleton,
  Spinner
} from "@heroui/react"
import { useState } from "react"

import { agentAuthPlugin } from "../../../lib/auth/agent-auth-plugin"

type RevokeTarget = {
  agent: AgentAuthorization
  grant: AgentCapabilityGrant
}

const statusColor = (status: AgentCapabilityGrant["status"]) =>
  status === "active"
    ? "success"
    : status === "pending"
      ? "warning"
      : status === "denied"
        ? "danger"
        : "default"

export type AgentAuthorizationsProps = Omit<CardProps, "children">

/** List user-owned agents and revoke individual active capability grants. */
export function AgentAuthorizations({
  className,
  variant,
  ...props
}: AgentAuthorizationsProps) {
  const { authClient, localization } = useAuth()
  const plugin = useAuthPlugin(agentAuthPlugin)
  const agents = useAgentAuthorizations(
    authClient as AgentAuthClient,
    plugin.adapter
  )
  const revoke = useRevokeAgentCapability(
    authClient as AgentAuthClient,
    plugin.adapter
  )
  const [target, setTarget] = useState<RevokeTarget>()

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-semibold">{plugin.localization.agents}</h2>
        <p className="text-muted text-xs">
          {plugin.localization.agentsDescription}
        </p>
      </div>
      <Card variant={variant} {...props}>
        <Card.Content className="flex flex-col gap-5">
          {agents.isPending ? (
            <>
              <Skeleton className="h-24 rounded-xl" />
              <Skeleton className="h-24 rounded-xl" />
            </>
          ) : agents.data?.length ? (
            agents.data.map((agent) => (
              <div key={agent.id} className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="bg-surface-secondary flex size-10 shrink-0 items-center justify-center rounded-xl">
                    <FaceRobot className="size-4.5" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-semibold">
                      {agent.name}
                    </span>
                    <span className="text-muted truncate text-xs">
                      {agent.hostName ?? agent.hostId}
                    </span>
                  </div>
                  <Chip size="sm" variant="soft">
                    {agent.mode === "autonomous"
                      ? plugin.localization.autonomousAgent
                      : plugin.localization.delegatedAgent}
                  </Chip>
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
                          <span className="text-muted truncate text-xs">
                            {grant.description}
                          </span>
                        )}
                      </div>
                      <Chip
                        color={statusColor(grant.status)}
                        size="sm"
                        variant="soft"
                      >
                        {plugin.localization[grant.status]}
                      </Chip>
                      {grant.status === "active" && (
                        <Button
                          aria-label={`${plugin.localization.revoke} ${grant.capability}`}
                          isIconOnly
                          size="sm"
                          variant="ghost"
                          onPress={() => setTarget({ agent, grant })}
                        >
                          <Xmark />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-muted flex items-center gap-3">
              <FaceRobot className="size-5" />
              <p className="text-sm">{plugin.localization.noAgents}</p>
            </div>
          )}
        </Card.Content>
      </Card>
      <AlertDialog.Backdrop
        isOpen={Boolean(target)}
        onOpenChange={(isOpen) => {
          if (!isOpen) setTarget(undefined)
        }}
      >
        <AlertDialog.Container>
          <AlertDialog.Dialog>
            <AlertDialog.CloseTrigger />
            <AlertDialog.Header>
              <AlertDialog.Icon status="danger">
                <ShieldExclamation />
              </AlertDialog.Icon>
              <AlertDialog.Heading>
                {plugin.localization.revokeTitle}
              </AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body className="flex flex-col gap-2">
              <p className="text-muted text-sm">
                {plugin.localization.revokeDescription}
              </p>
              <code className="bg-surface-secondary rounded-lg p-3 text-xs">
                {target?.grant.capability}
              </code>
            </AlertDialog.Body>
            <AlertDialog.Footer>
              <Button
                slot="close"
                variant="tertiary"
                isDisabled={revoke.isPending}
              >
                {localization.settings.cancel}
              </Button>
              <Button
                variant="danger"
                isPending={revoke.isPending}
                onPress={() => {
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
                {revoke.isPending && <Spinner color="current" size="sm" />}
                {plugin.localization.confirmRevoke}
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </div>
  )
}
