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
  BotIcon,
  CircleCheckIcon,
  CircleXIcon,
  FingerprintIcon,
  EllipsisIcon
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"

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

export type AgentApprovalProps = { className?: string }

/** Render the Agent Auth approval page configured by `deviceAuthorizationPage`. */
export function AgentApproval({ className }: AgentApprovalProps) {
  const { authClient, basePaths, navigate, viewPaths } =
    useAuth<AgentAuthClient>()
  const plugin = useAuthPlugin(agentAuthPlugin)
  const session = useSession(authClient)
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
  const approval = useAgentApproval(authClient, plugin.adapter, request)
  const approve = useApproveAgent(authClient, plugin.adapter)
  const deny = useDenyAgent(authClient, plugin.adapter)
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
      <Card className={cn("w-full max-w-md", className)}>
        <CardContent className="text-sm text-destructive">
          {plugin.localization.invalidRequest}
        </CardContent>
      </Card>
    )
  }

  if (result) {
    const approved = result === "approved"
    return (
      <Card className={cn("w-full max-w-md", className)}>
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          {approved ? (
            <CircleCheckIcon className="size-10 text-emerald-600" />
          ) : (
            <CircleXIcon className="size-10 text-muted-foreground" />
          )}
          <div className="flex flex-col gap-1">
            <h1 className="font-semibold">
              {approved
                ? plugin.localization.approvedTitle
                : plugin.localization.deniedTitle}
            </h1>
            <p className="text-sm text-muted-foreground">
              {approved
                ? plugin.localization.approvedDescription
                : plugin.localization.deniedDescription}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className={cn(
        "max-h-[calc(100dvh-2rem)] w-full max-w-lg gap-0 overflow-hidden p-0",
        className
      )}
    >
      <div
        className="min-h-0 overflow-y-auto overscroll-contain focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
        role="region"
        aria-label={plugin.localization.approvalTitle}
        tabIndex={0}
      >
        <CardHeader className="flex flex-col items-stretch gap-5 p-6">
          <div className="flex items-center justify-center gap-5">
            <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-muted/50">
              <BotIcon aria-hidden="true" className="size-7" />
            </div>
            <EllipsisIcon
              aria-hidden="true"
              className="size-5 text-muted-foreground"
            />
            <UserAvatar
              className="size-16"
              user={session.data?.user}
              isPending={session.isPending}
            />
          </div>
          <div className="grid justify-items-center gap-1 text-center">
            <CardTitle className="max-w-full break-words text-xl font-semibold">
              {approval.data ? (
                approval.data.name
              ) : approval.isPending ? (
                <Skeleton className="h-6 w-40" />
              ) : (
                plugin.localization.approvalTitle
              )}
            </CardTitle>
            <CardDescription>
              {plugin.localization.approvalDescription}
            </CardDescription>
            {approval.data ? (
              <p className="text-sm text-muted-foreground">
                {approval.data.hostName ?? approval.data.hostId} ·{" "}
                {approval.data.mode === "autonomous"
                  ? plugin.localization.autonomousAgent
                  : plugin.localization.delegatedAgent}
              </p>
            ) : approval.isPending ? (
              <Skeleton className="h-4 w-48" />
            ) : null}
            <div className="mt-2 flex max-w-full flex-wrap justify-center gap-x-1 text-sm text-muted-foreground">
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
        </CardHeader>
        <CardContent className="px-4 pb-6 sm:px-6">
          <div className="grid gap-4 rounded-lg bg-muted/50 p-5">
            <h2 className="text-sm font-medium">
              {plugin.localization.requestedCapabilities}
            </h2>
            {approval.isError ? (
              <p className="text-sm text-destructive">
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
                      id={`agent-capability-${grant.capability}`}
                      className="mt-1"
                      checked={selected.has(grant.capability)}
                      disabled={approve.isPending || deny.isPending}
                      aria-label={grant.capability}
                      onCheckedChange={(checked) =>
                        updateSelection(grant.capability, checked === true)
                      }
                    />
                    <div className="grid min-w-0 flex-1 gap-1">
                      <label
                        htmlFor={`agent-capability-${grant.capability}`}
                        className="cursor-pointer text-base leading-6 break-words"
                      >
                        {grant.capability}
                      </label>
                      {grant.description ? (
                        <p className="text-sm leading-5 text-muted-foreground">
                          {grant.description}
                        </p>
                      ) : null}
                      {grant.reason ? (
                        <p className="text-sm leading-5 text-muted-foreground">
                          {plugin.localization.requestReason}: {grant.reason}
                        </p>
                      ) : null}
                      {grant.approvalStrength !== "none" ? (
                        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          {grant.approvalStrength === "webauthn" ? (
                            <>
                              <FingerprintIcon
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
                        <details className="mt-1 text-sm text-muted-foreground">
                          <summary className="w-fit cursor-pointer rounded-sm focus-visible:outline-2 focus-visible:outline-ring">
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
              <p className="text-sm text-muted-foreground">
                {plugin.localization.noCapabilities}
              </p>
            )}
          </div>
        </CardContent>
      </div>
      <CardFooter className="grid shrink-0 grid-cols-2 gap-3 p-4 sm:p-6">
        <Button
          className="h-11 w-full"
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
            deny.mutate(denyDecision, { onSuccess: () => setResult("denied") })
          }
        >
          {deny.isPending && <Spinner />}
          {plugin.localization.deny}
        </Button>
        <Button
          className="h-11 w-full"
          disabled={
            approve.isPending ||
            deny.isPending ||
            !selected.size ||
            !approval.data ||
            !session.data ||
            approval.isFetching ||
            approval.isError
          }
          onClick={() =>
            approve.mutate(decision, { onSuccess: () => setResult("approved") })
          }
        >
          {approve.isPending && <Spinner />}
          {plugin.localization.allow}
        </Button>
      </CardFooter>
    </Card>
  )
}
