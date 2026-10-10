import type {
  AgentAuthClient,
  AgentApprovalRequest,
  AgentCapabilityGrant
} from "@better-auth-ui/core/plugins/agent-auth"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import {
  useAgentApproval,
  useApproveAgent,
  useDenyAgent
} from "@better-auth-ui/react/plugins/agent-auth"
import { useState } from "react"
import { agentAuthPlugin } from "../../../lib/auth/agent-auth-plugin"
import { useNativeAuthenticate } from "../../../lib/auth/use-native-authenticate"
import type { AuthViewProps } from "../../../lib/auth-plugin"
import { useNativeLocale } from "../../../lib/native-locale"
import { useAuthNavigation } from "../../../navigation/navigation-context"
import { Button } from "../../../primitives/button"
import { Card } from "../../../primitives/card"
import { Checkbox } from "../../../primitives/checkbox"
import { Description } from "../../../primitives/description"
import { Skeleton } from "../../../primitives/skeleton"
import { Box, Txt } from "../../../primitives/styled"

export function AgentGrantDetails({ grant }: { grant: AgentCapabilityGrant }) {
  const { localization } = useAuthPlugin(agentAuthPlugin)
  const { languageTag } = useNativeLocale()
  return (
    <Box className="gap-1">
      <Txt className="font-medium">{grant.capability}</Txt>
      {grant.description ? (
        <Description>{grant.description}</Description>
      ) : null}
      {grant.reason ? (
        <Description>
          {localization.requestReason}: {grant.reason}
        </Description>
      ) : null}
      {grant.constraints ? (
        <Description>
          {localization.constraints}: {JSON.stringify(grant.constraints)}
        </Description>
      ) : null}
      <Description>
        {grant.approvalStrength === "webauthn"
          ? localization.approvalWebauthn
          : grant.approvalStrength === "session"
            ? localization.approvalSession
            : localization.approvalNone}
      </Description>
      {grant.expiresAt ? (
        <Description>
          {localization.expires.replace(
            "{date}",
            new Intl.DateTimeFormat(languageTag, {
              dateStyle: "medium"
            }).format(grant.expiresAt)
          )}
        </Description>
      ) : null}
    </Box>
  )
}

export function AgentApproval(
  props: AuthViewProps & { request?: AgentApprovalRequest }
) {
  const navigation = useAuthNavigation()
  const identity = JSON.stringify(
    props.request ?? [
      navigation.getParam("agent_id"),
      navigation.getParam("approval_id"),
      navigation.getParam("code") ?? navigation.getParam("user_code")
    ]
  )
  return <AgentApprovalFlow key={identity} {...props} />
}

function AgentApprovalFlow(
  props: AuthViewProps & { request?: AgentApprovalRequest }
) {
  const { authClient } = useAuth()
  const { adapter, localization } = useAuthPlugin(agentAuthPlugin)
  const navigation = useAuthNavigation()
  const session = useNativeAuthenticate({
    section: "auth",
    view: "agentApproval"
  })
  const request =
    props.request ??
    (navigation.getParam("agent_id")
      ? {
          agentId: navigation.getParam("agent_id")!,
          approvalId: navigation.getParam("approval_id"),
          userCode:
            navigation.getParam("code") ?? navigation.getParam("user_code")
        }
      : undefined)
  const approval = useAgentApproval(
    authClient as AgentAuthClient,
    adapter,
    request
  )
  const approve = useApproveAgent(authClient as AgentAuthClient, adapter)
  const deny = useDenyAgent(authClient as AgentAuthClient, adapter)
  const [selection, setSelection] = useState<Set<string>>()
  const [result, setResult] = useState<"approved" | "denied">()
  const requested = approval.data?.requestedCapabilities ?? []
  const selected =
    selection ?? new Set(requested.map((grant) => grant.capability))
  const permitted = requested
    .filter((grant) => selected.has(grant.capability))
    .map((grant) => grant.capability)
  const pending = approve.isPending || deny.isPending
  return (
    <Card className={props.className} variant={props.variant}>
      <Card.Header>
        <Card.Title>
          {result === "approved"
            ? localization.approvedTitle
            : result === "denied"
              ? localization.deniedTitle
              : localization.approvalTitle}
        </Card.Title>
        <Description>
          {result === "approved"
            ? localization.approvedDescription
            : result === "denied"
              ? localization.deniedDescription
              : localization.approvalDescription}
        </Description>
      </Card.Header>
      <Card.Content className="gap-4">
        {!request ? (
          <Txt accessibilityRole="alert">{localization.invalidRequest}</Txt>
        ) : result ? null : (
          <>
            {session.isPending || approval.isPending ? (
              <Skeleton className="h-20 w-full" />
            ) : null}
            {approval.error ? (
              <Txt accessibilityRole="alert">{approval.error.message}</Txt>
            ) : null}
            {approval.data ? (
              <>
                <Txt className="font-semibold">{approval.data.name}</Txt>
                <Description>
                  {approval.data.hostName ?? approval.data.hostId}
                </Description>
                <Description>
                  {approval.data.mode === "autonomous"
                    ? localization.autonomousAgent
                    : localization.delegatedAgent}
                </Description>
                <Txt>{localization.requestedCapabilities}</Txt>
                {requested.length === 0 ? (
                  <Description>{localization.noCapabilities}</Description>
                ) : (
                  requested.map((grant) => (
                    <Checkbox
                      key={grant.capability}
                      isSelected={selected.has(grant.capability)}
                      isDisabled={pending}
                      onChange={(checked) => {
                        const next = new Set(selected)
                        if (checked) next.add(grant.capability)
                        else next.delete(grant.capability)
                        setSelection(next)
                      }}
                    >
                      <AgentGrantDetails grant={grant} />
                    </Checkbox>
                  ))
                )}
                <Box className="flex-row gap-2">
                  <Button
                    isPending={deny.isPending}
                    isDisabled={
                      pending ||
                      !session.data ||
                      approval.isFetching ||
                      !!approval.error
                    }
                    onPress={() =>
                      deny.mutate(request, {
                        onSuccess: () => setResult("denied")
                      })
                    }
                  >
                    {localization.deny}
                  </Button>
                  <Button
                    isPending={approve.isPending}
                    isDisabled={
                      pending ||
                      !session.data ||
                      !permitted.length ||
                      approval.isFetching ||
                      !!approval.error
                    }
                    onPress={() =>
                      approve.mutate(
                        { ...request, capabilities: permitted },
                        { onSuccess: () => setResult("approved") }
                      )
                    }
                  >
                    {localization.allow}
                  </Button>
                </Box>
              </>
            ) : null}
          </>
        )}
      </Card.Content>
    </Card>
  )
}
