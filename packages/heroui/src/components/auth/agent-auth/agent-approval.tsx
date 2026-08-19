"use client"

import type {
  AgentApprovalRequest,
  AgentAuthClient,
  AgentCapabilityGrant
} from "@better-auth-ui/core/plugins/agent-auth"
import { useAuth, useAuthPlugin, useSession } from "@better-auth-ui/react"
import {
  useAgentApproval,
  useApproveAgent,
  useDenyAgent
} from "@better-auth-ui/react/plugins/agent-auth"
import {
  Check,
  CircleCheck,
  CircleXmark,
  FaceRobot,
  Fingerprint
} from "@gravity-ui/icons"
import {
  Button,
  Card,
  type CardProps,
  Checkbox,
  Chip,
  cn,
  Skeleton,
  Spinner
} from "@heroui/react"
import { useEffect, useMemo, useState } from "react"

import { agentAuthPlugin } from "../../../lib/auth/agent-auth-plugin"

type ApprovalResult = "approved" | "denied"

const strengthColor = (strength: AgentCapabilityGrant["approvalStrength"]) =>
  strength === "webauthn"
    ? "warning"
    : strength === "session"
      ? "accent"
      : "default"

export type AgentApprovalProps = {
  className?: string
  variant?: CardProps["variant"]
}

/** Render the Agent Auth device-approval page configured on the server. */
export function AgentApproval({ className, variant }: AgentApprovalProps) {
  const { authClient, basePaths, navigate, viewPaths } = useAuth()
  const plugin = useAuthPlugin(agentAuthPlugin)
  const session = useSession(authClient as AgentAuthClient)
  const request = useMemo<AgentApprovalRequest | undefined>(() => {
    if (typeof window === "undefined") return undefined
    const query = new URLSearchParams(window.location.search)
    const agentId = query.get("agent_id")
    if (!agentId) return undefined
    return {
      agentId,
      approvalId: query.get("approval_id") ?? undefined,
      userCode: query.get("code") ?? query.get("user_code") ?? undefined
    }
  }, [])
  const approval = useAgentApproval(
    authClient as AgentAuthClient,
    plugin.adapter,
    request
  )
  const approve = useApproveAgent(authClient as AgentAuthClient, plugin.adapter)
  const deny = useDenyAgent(authClient as AgentAuthClient, plugin.adapter)
  const [selection, setSelection] = useState<Set<string> | null>(null)
  const [result, setResult] = useState<ApprovalResult>()

  useEffect(() => {
    if (session.isPending || session.data || typeof window === "undefined") {
      return
    }
    const returnPath = `${window.location.pathname}${window.location.search}`
    navigate({
      to: `${basePaths.auth}/${viewPaths.auth.signIn}?redirectTo=${encodeURIComponent(returnPath)}`
    })
  }, [
    basePaths.auth,
    navigate,
    session.data,
    session.isPending,
    viewPaths.auth.signIn
  ])

  const requested = approval.data?.requestedCapabilities ?? []
  const selected =
    selection ?? new Set(requested.map((grant) => grant.capability))
  const updateSelection = (capability: string, isSelected: boolean) => {
    const next = new Set(selected)
    if (isSelected) next.add(capability)
    else next.delete(capability)
    setSelection(next)
  }
  const decision = {
    ...request,
    agentId: request?.agentId ?? "",
    capabilities: [...selected]
  }
  const denyDecision = {
    ...request,
    agentId: request?.agentId ?? ""
  }

  if (!request) {
    return (
      <Card className={cn("w-full max-w-md", className)} variant={variant}>
        <Card.Content className="text-danger text-sm">
          {plugin.localization.invalidRequest}
        </Card.Content>
      </Card>
    )
  }

  if (result) {
    const approved = result === "approved"
    return (
      <Card className={cn("w-full max-w-md", className)} variant={variant}>
        <Card.Content className="flex flex-col items-center gap-4 py-8 text-center">
          {approved ? (
            <CircleCheck className="text-success size-10" />
          ) : (
            <CircleXmark className="text-muted size-10" />
          )}
          <div className="flex flex-col gap-1">
            <h1 className="font-semibold">
              {approved
                ? plugin.localization.approvedTitle
                : plugin.localization.deniedTitle}
            </h1>
            <p className="text-muted text-sm">
              {approved
                ? plugin.localization.approvedDescription
                : plugin.localization.deniedDescription}
            </p>
          </div>
        </Card.Content>
      </Card>
    )
  }

  return (
    <Card
      className={cn("w-full max-w-md gap-5 md:p-6", className)}
      variant={variant}
    >
      <Card.Header className="flex items-start gap-3">
        <div className="bg-surface-secondary flex size-11 shrink-0 items-center justify-center rounded-xl">
          <FaceRobot className="size-5" />
        </div>
        <div className="flex min-w-0 flex-col gap-1">
          <Card.Title>{plugin.localization.approvalTitle}</Card.Title>
          <Card.Description>
            {plugin.localization.approvalDescription}
          </Card.Description>
        </div>
      </Card.Header>
      <Card.Content className="flex flex-col gap-5">
        {approval.isPending || session.isPending ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-14 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
          </div>
        ) : approval.isError ? (
          <p className="text-danger text-sm">
            {plugin.localization.approvalError}
          </p>
        ) : approval.data ? (
          <>
            <div className="bg-surface-secondary flex items-center justify-between gap-3 rounded-xl p-3">
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-semibold">
                  {approval.data.name}
                </span>
                <span className="text-muted truncate text-xs">
                  {approval.data.hostName ?? approval.data.hostId}
                </span>
              </div>
              <Chip size="sm" variant="soft">
                {approval.data.mode === "autonomous"
                  ? plugin.localization.autonomousAgent
                  : plugin.localization.delegatedAgent}
              </Chip>
            </div>
            <div className="flex flex-col gap-3">
              <h2 className="text-sm font-semibold">
                {plugin.localization.requestedCapabilities}
              </h2>
              {requested.length ? (
                requested.map((grant) => (
                  <Checkbox
                    key={grant.capability}
                    isSelected={selected.has(grant.capability)}
                    onChange={(isSelected) =>
                      updateSelection(grant.capability, isSelected)
                    }
                  >
                    <Checkbox.Content className="items-start gap-3">
                      <Checkbox.Control className="mt-0.5">
                        <Checkbox.Indicator>
                          <Check />
                        </Checkbox.Indicator>
                      </Checkbox.Control>
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <span className="break-words text-sm font-medium">
                          {grant.capability}
                        </span>
                        {grant.description && (
                          <span className="text-muted text-xs">
                            {grant.description}
                          </span>
                        )}
                        {grant.reason && (
                          <span className="text-muted text-xs">
                            {plugin.localization.requestReason}: {grant.reason}
                          </span>
                        )}
                        {grant.constraints && (
                          <span className="text-muted text-xs">
                            {plugin.localization.constraints}:{" "}
                            <code>{JSON.stringify(grant.constraints)}</code>
                          </span>
                        )}
                        <Chip
                          className="mt-1 self-start"
                          color={strengthColor(grant.approvalStrength)}
                          size="sm"
                          variant="soft"
                        >
                          {grant.approvalStrength === "webauthn" && (
                            <Fingerprint />
                          )}
                          {grant.approvalStrength === "webauthn"
                            ? plugin.localization.approvalWebauthn
                            : grant.approvalStrength === "session"
                              ? plugin.localization.approvalSession
                              : plugin.localization.approvalNone}
                        </Chip>
                      </div>
                    </Checkbox.Content>
                  </Checkbox>
                ))
              ) : (
                <p className="text-muted text-sm">
                  {plugin.localization.noCapabilities}
                </p>
              )}
            </div>
          </>
        ) : null}
      </Card.Content>
      <Card.Footer className="flex gap-3">
        <Button
          className="flex-1"
          variant="outline"
          isDisabled={approve.isPending || deny.isPending || !approval.data}
          isPending={deny.isPending}
          onPress={() =>
            deny.mutate(denyDecision, {
              onSuccess: () => setResult("denied")
            })
          }
        >
          {deny.isPending && <Spinner color="current" size="sm" />}
          {plugin.localization.deny}
        </Button>
        <Button
          className="flex-1"
          isDisabled={
            approve.isPending ||
            !selected.size ||
            deny.isPending ||
            !approval.data
          }
          isPending={approve.isPending}
          onPress={() =>
            approve.mutate(decision, {
              onSuccess: () => setResult("approved")
            })
          }
        >
          {approve.isPending && <Spinner color="current" size="sm" />}
          {plugin.localization.allow}
        </Button>
      </Card.Footer>
    </Card>
  )
}
