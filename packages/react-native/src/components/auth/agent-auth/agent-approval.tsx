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
import { useWindowDimensions } from "react-native"
import { agentAuthPlugin } from "../../../lib/auth/agent-auth-plugin"
import { useNativeAuthenticate } from "../../../lib/auth/use-native-authenticate"
import type { AuthViewProps } from "../../../lib/auth-plugin"
import { useNativeLocale } from "../../../lib/native-locale"
import { useAuthNavigation } from "../../../navigation/navigation-context"
import { cn } from "../../../lib/cn"
import { Separator } from "../../../primitives/separator"
import { Display } from "../../../primitives/ui-icons"
import { UserAvatar } from "../user/user-avatar"
import { Button } from "../../../primitives/button"
import { Card } from "../../../primitives/card"
import { Checkbox } from "../../../primitives/checkbox"
import { Description } from "../../../primitives/description"
import { Skeleton } from "../../../primitives/skeleton"
import { Box, ScrollBox, Txt } from "../../../primitives/styled"

export function AgentGrantDetails({
  grant,
  showCapability = true
}: {
  grant: AgentCapabilityGrant
  showCapability?: boolean
}) {
  const { localization } = useAuthPlugin(agentAuthPlugin)
  const { languageTag } = useNativeLocale()
  const [expanded, setExpanded] = useState(false)
  return (
    <Box className="gap-1">
      {showCapability ? (
        <Txt className="font-medium">{grant.capability}</Txt>
      ) : null}
      {grant.description ? (
        <Description>{grant.description}</Description>
      ) : null}
      {grant.reason ? (
        <Description>
          {localization.requestReason}: {grant.reason}
        </Description>
      ) : null}
      {grant.constraints ? (
        <Box className="gap-2">
          <Button
            className="self-start px-0"
            size="sm"
            variant="ghost"
            aria-label={`${localization.constraints}: ${grant.capability}`}
            aria-expanded={expanded}
            onPress={() => setExpanded(!expanded)}
          >
            {localization.constraints}
          </Button>
          {expanded ? (
            <Txt className="rounded-md bg-surface p-3 text-xs text-muted">
              {JSON.stringify(grant.constraints, null, 2)}
            </Txt>
          ) : null}
        </Box>
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
  const { height } = useWindowDimensions()
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
  if (!request || result) {
    return (
      <Card className={props.className} variant={props.variant}>
        <Card.Header className="gap-2">
          <Card.Title>
            {result === "approved"
              ? localization.approvedTitle
              : result === "denied"
                ? localization.deniedTitle
                : localization.invalidRequest}
          </Card.Title>
          {result ? (
            <Description>
              {result === "approved"
                ? localization.approvedDescription
                : localization.deniedDescription}
            </Description>
          ) : null}
        </Card.Header>
      </Card>
    )
  }
  return (
    <Box style={{ maxHeight: Math.max(0, height - 32) }}>
      <Card
        className={cn("min-h-0 shrink overflow-hidden p-0", props.className)}
        variant={props.variant}
      >
        <ScrollBox
          className="min-h-0 shrink"
          contentContainerClassName="gap-6 p-6"
        >
          <Card.Header className="items-center gap-5">
            <Box className="flex-row items-center justify-center gap-5">
              <Box className="size-16 items-center justify-center rounded-full bg-surface-secondary">
                <Display aria-hidden={true} className="size-7" />
              </Box>
              <Txt aria-hidden={true} className="text-muted">
                ···
              </Txt>
              <UserAvatar
                className="size-16"
                user={session.data?.user}
                isPending={session.isPending}
              />
            </Box>
            <Box className="items-center gap-1">
              {approval.data ? (
                <Card.Title className="text-center">
                  {approval.data.name}
                </Card.Title>
              ) : approval.isPending ? (
                <Skeleton className="h-6 w-40" />
              ) : (
                <Card.Title className="text-center">
                  {localization.approvalTitle}
                </Card.Title>
              )}
              <Description className="text-center">
                {localization.approvalDescription}
              </Description>
              {approval.data ? (
                <Description className="text-center">
                  {approval.data.hostName ?? approval.data.hostId} ·{" "}
                  {approval.data.mode === "autonomous"
                    ? localization.autonomousAgent
                    : localization.delegatedAgent}
                </Description>
              ) : approval.isPending ? (
                <Skeleton className="h-4 w-48" />
              ) : null}
              <Box className="mt-2 flex-row flex-wrap justify-center gap-1">
                <Description>{localization.signedInAs}</Description>
                {session.data ? (
                  <Txt className="text-sm font-medium text-foreground">
                    {session.data.user.name || session.data.user.email}
                  </Txt>
                ) : session.isPending ? (
                  <Skeleton className="h-4 w-32" />
                ) : null}
              </Box>
            </Box>
          </Card.Header>
          <Card.Content className="gap-5 rounded-lg bg-surface-secondary p-5">
            <Txt className="text-sm font-medium text-foreground">
              {localization.requestedCapabilities}
            </Txt>
            {approval.error ? (
              <Txt accessibilityRole="alert">{approval.error.message}</Txt>
            ) : approval.isPending || session.isPending ? (
              <Box className="flex-row gap-3">
                <Skeleton className="size-4" />
                <Box className="flex-1 gap-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-full" />
                </Box>
              </Box>
            ) : requested.length ? (
              requested.map((grant) => (
                <Box key={grant.capability} className="gap-1">
                  <Checkbox
                    className="items-start gap-3"
                    isSelected={selected.has(grant.capability)}
                    isDisabled={pending}
                    onChange={(checked) => {
                      const next = new Set(selected)
                      if (checked) next.add(grant.capability)
                      else next.delete(grant.capability)
                      setSelection(next)
                    }}
                  >
                    <Txt className="flex-1 text-base text-foreground">
                      {grant.capability}
                    </Txt>
                  </Checkbox>
                  <Box className="pl-8">
                    <AgentGrantDetails grant={grant} showCapability={false} />
                  </Box>
                </Box>
              ))
            ) : (
              <Description>{localization.noCapabilities}</Description>
            )}
          </Card.Content>
        </ScrollBox>
        <Separator />
        <Card.Footer className="flex-row gap-3 p-4">
          <Button
            className="flex-1"
            variant="secondary"
            isPending={deny.isPending}
            isDisabled={
              pending ||
              !session.data ||
              !approval.data ||
              approval.isFetching ||
              !!approval.error
            }
            onPress={() =>
              deny.mutate(request, { onSuccess: () => setResult("denied") })
            }
          >
            {localization.deny}
          </Button>
          <Button
            className="flex-1"
            variant="primary"
            isPending={approve.isPending}
            isDisabled={
              pending ||
              !session.data ||
              !approval.data ||
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
        </Card.Footer>
      </Card>
    </Box>
  )
}
