"use client"

import type {
  AgentApprovalRequest,
  AgentAuthClient
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
  Fingerprint,
  Ellipsis
} from "@gravity-ui/icons"
import {
  Button,
  Card,
  type CardProps,
  Checkbox,
  cn,
  Skeleton,
  Spinner
} from "@heroui/react"
import { useEffect, useMemo, useState } from "react"

import { UserAvatar } from "../user/user-avatar"
import { agentAuthPlugin } from "../../../lib/auth/agent-auth-plugin"

type ApprovalResult = "approved" | "denied"

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
      className={cn(
        "max-h-[calc(100dvh-2rem)] w-full max-w-lg gap-0 overflow-hidden p-0",
        className
      )}
      variant={variant}
    >
      <div
        className="min-h-0 overflow-y-auto overscroll-contain focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus"
        role="region"
        aria-label={plugin.localization.approvalTitle}
        tabIndex={0}
      >
        <Card.Header className="flex flex-col items-stretch gap-5 p-6">
          <div className="flex items-center justify-center gap-5">
            <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-surface-secondary">
              <FaceRobot aria-hidden="true" className="size-7" />
            </div>
            <Ellipsis aria-hidden="true" className="size-5 text-muted" />
            <UserAvatar
              className="size-16"
              user={session.data?.user}
              isPending={session.isPending}
            />
          </div>
          <div className="grid justify-items-center gap-1 text-center">
            <Card.Title className="max-w-full break-words text-xl font-semibold">
              {approval.data ? (
                approval.data.name
              ) : approval.isPending ? (
                <Skeleton className="h-6 w-40" />
              ) : (
                plugin.localization.approvalTitle
              )}
            </Card.Title>
            <Card.Description>
              {plugin.localization.approvalDescription}
            </Card.Description>
            {approval.data ? (
              <p className="text-sm text-muted">
                {approval.data.hostName ?? approval.data.hostId} ·{" "}
                {approval.data.mode === "autonomous"
                  ? plugin.localization.autonomousAgent
                  : plugin.localization.delegatedAgent}
              </p>
            ) : approval.isPending ? (
              <Skeleton className="h-4 w-48" />
            ) : null}
            <div className="mt-2 flex max-w-full flex-wrap justify-center gap-x-1 text-sm text-muted">
              <span>{plugin.localization.signedInAs}</span>
              {session.data ? (
                <span className="break-all font-medium text-foreground">
                  {session.data.user.name || session.data.user.email}
                </span>
              ) : session.isPending ? (
                <Skeleton className="h-4 w-32" />
              ) : null}
            </div>
          </div>
        </Card.Header>
        <Card.Content className="px-4 pb-6 sm:px-6">
          <div className="grid gap-4 rounded-lg bg-surface-secondary p-5">
            <h2 className="text-sm font-medium">
              {plugin.localization.requestedCapabilities}
            </h2>
            {approval.isError ? (
              <p className="text-sm text-danger">
                {plugin.localization.approvalError}
              </p>
            ) : approval.isPending || session.isPending ? (
              <div className="flex gap-3">
                <Skeleton className="size-4 shrink-0" />
                <div className="grid flex-1 gap-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ) : requested.length ? (
              <div className="grid gap-5">
                {requested.map((grant) => (
                  <div
                    key={grant.capability}
                    className="flex items-start gap-3"
                  >
                    <Checkbox
                      isSelected={selected.has(grant.capability)}
                      isDisabled={approve.isPending || deny.isPending}
                      aria-label={grant.capability}
                      onChange={(checked) =>
                        updateSelection(grant.capability, checked)
                      }
                    >
                      <Checkbox.Content>
                        <Checkbox.Control className="mt-1">
                          <Checkbox.Indicator>
                            <Check />
                          </Checkbox.Indicator>
                        </Checkbox.Control>
                      </Checkbox.Content>
                    </Checkbox>
                    <div className="grid min-w-0 flex-1 gap-1">
                      <span className="text-base leading-6 break-words">
                        {grant.capability}
                      </span>
                      {grant.description ? (
                        <p className="text-sm leading-5 text-muted">
                          {grant.description}
                        </p>
                      ) : null}
                      {grant.reason ? (
                        <p className="text-sm leading-5 text-muted">
                          {plugin.localization.requestReason}: {grant.reason}
                        </p>
                      ) : null}
                      {grant.approvalStrength !== "none" ? (
                        <p className="flex items-center gap-1.5 text-sm text-muted">
                          {grant.approvalStrength === "webauthn" ? (
                            <>
                              <Fingerprint
                                aria-hidden="true"
                                className="size-4"
                              />
                              {plugin.localization.approvalWebauthn}
                            </>
                          ) : (
                            plugin.localization.approvalSession
                          )}
                        </p>
                      ) : null}
                      {grant.constraints ? (
                        <details className="mt-1 text-sm text-muted">
                          <summary className="w-fit cursor-pointer rounded-sm focus-visible:outline-2 focus-visible:outline-focus">
                            {plugin.localization.constraints}
                          </summary>
                          <pre className="mt-2 max-w-full overflow-x-auto rounded-md bg-background/50 p-3 text-xs">
                            {JSON.stringify(grant.constraints, null, 2)}
                          </pre>
                        </details>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted">
                {plugin.localization.noCapabilities}
              </p>
            )}
          </div>
        </Card.Content>
      </div>
      <Card.Footer className="grid shrink-0 grid-cols-2 gap-3 border-t border-separator p-4 sm:p-6">
        <Button
          className="h-11 w-full"
          isDisabled={
            approve.isPending ||
            deny.isPending ||
            !approval.data ||
            !session.data ||
            approval.isFetching ||
            approval.isError
          }
          variant="secondary"
          onPress={() =>
            deny.mutate(denyDecision, { onSuccess: () => setResult("denied") })
          }
        >
          {deny.isPending && <Spinner color="current" size="sm" />}
          {plugin.localization.deny}
        </Button>
        <Button
          className="h-11 w-full"
          isDisabled={
            approve.isPending ||
            deny.isPending ||
            !selected.size ||
            !approval.data ||
            !session.data ||
            approval.isFetching ||
            approval.isError
          }
          onPress={() =>
            approve.mutate(decision, { onSuccess: () => setResult("approved") })
          }
        >
          {approve.isPending && <Spinner color="current" size="sm" />}
          {plugin.localization.allow}
        </Button>
      </Card.Footer>
    </Card>
  )
}
