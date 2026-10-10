import type { AgentAuthClient } from "@better-auth-ui/core/plugins/agent-auth"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import {
  useAgentAuthorizations,
  useRevokeAgentCapability
} from "@better-auth-ui/react/plugins/agent-auth"
import { useState } from "react"
import { agentAuthPlugin } from "../../../lib/auth/agent-auth-plugin"
import type { CardSlotProps } from "../../../lib/auth-plugin"
import { useNativeLocale } from "../../../lib/native-locale"
import { AlertDialog } from "../../../primitives/alert-dialog"
import { Button } from "../../../primitives/button"
import { Card } from "../../../primitives/card"
import { Description } from "../../../primitives/description"
import { Skeleton } from "../../../primitives/skeleton"
import { Box, Txt } from "../../../primitives/styled"
import { AgentGrantDetails } from "./agent-approval"

export function AgentAuthorizations(props: CardSlotProps) {
  const { authClient, localization: common } = useAuth()
  const { adapter, localization } = useAuthPlugin(agentAuthPlugin)
  const { languageTag } = useNativeLocale()
  const agents = useAgentAuthorizations(authClient as AgentAuthClient, adapter)
  const revoke = useRevokeAgentCapability(
    authClient as AgentAuthClient,
    adapter
  )
  const [action, setAction] = useState<{
    agentId: string
    capability: string
  }>()
  return (
    <Box className={props.className ?? "gap-4"}>
      <Txt className="font-semibold">{localization.agents}</Txt>
      <Description>{localization.agentsDescription}</Description>
      {agents.isPending ? <Skeleton className="h-20 w-full" /> : null}
      {agents.error ? (
        <Txt accessibilityRole="alert">{agents.error.message}</Txt>
      ) : null}
      {agents.data?.length === 0 ? (
        <Description>{localization.noAgents}</Description>
      ) : null}
      {agents.data?.map((agent) => (
        <Card key={agent.id} variant={props.variant}>
          <Card.Header>
            <Card.Title>{agent.name}</Card.Title>
            <Description>{agent.hostName ?? agent.hostId}</Description>
            <Description>
              {agent.mode === "autonomous"
                ? localization.autonomousAgent
                : localization.delegatedAgent}
            </Description>
            <Description>
              {["active", "pending", "denied", "revoked"].includes(agent.status)
                ? localization[
                    agent.status as "active" | "pending" | "denied" | "revoked"
                  ]
                : agent.status}
            </Description>
            {agent.expiresAt ? (
              <Description>
                {localization.expires.replace(
                  "{date}",
                  new Intl.DateTimeFormat(languageTag, {
                    dateStyle: "medium"
                  }).format(agent.expiresAt)
                )}
              </Description>
            ) : null}
            <Description>
              {agent.lastUsedAt
                ? localization.lastUsed.replace(
                    "{date}",
                    new Intl.DateTimeFormat(languageTag, {
                      dateStyle: "medium"
                    }).format(agent.lastUsedAt)
                  )
                : localization.neverUsed}
            </Description>
          </Card.Header>
          <Card.Content className="gap-4">
            {agent.grants.map((grant) => (
              <Box key={grant.capability} className="gap-2">
                <AgentGrantDetails grant={grant} />
                <Description>{localization[grant.status]}</Description>
                {grant.status === "active" ? (
                  <Button
                    variant="danger"
                    onPress={() =>
                      setAction({
                        agentId: agent.id,
                        capability: grant.capability
                      })
                    }
                  >
                    {localization.revoke}
                  </Button>
                ) : null}
              </Box>
            ))}
          </Card.Content>
        </Card>
      ))}
      <AlertDialog
        isOpen={!!action}
        onOpenChange={(open) => {
          if (!open && !revoke.isPending) setAction(undefined)
        }}
      >
        <AlertDialog.Header>
          <AlertDialog.Heading>{localization.revokeTitle}</AlertDialog.Heading>
        </AlertDialog.Header>
        <AlertDialog.Body>
          <Description>{localization.revokeDescription}</Description>
          {revoke.error ? (
            <Txt accessibilityRole="alert">{revoke.error.message}</Txt>
          ) : null}
        </AlertDialog.Body>
        <AlertDialog.Footer>
          <Button
            isDisabled={revoke.isPending}
            onPress={() => setAction(undefined)}
          >
            {common.settings.cancel}
          </Button>
          <Button
            variant="danger"
            isPending={revoke.isPending}
            onPress={() => {
              if (action)
                revoke.mutate(action, { onSuccess: () => setAction(undefined) })
            }}
          >
            {localization.confirmRevoke}
          </Button>
        </AlertDialog.Footer>
      </AlertDialog>
    </Box>
  )
}
