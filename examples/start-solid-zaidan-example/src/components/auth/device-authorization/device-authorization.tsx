import type { DeviceAuthorizationLocalization } from "@better-auth-ui/core/plugins"
import {
  approveDeviceOptions,
  type DeviceAuthorizationAuthClient,
  denyDeviceOptions,
  useAuth,
  useAuthPlugin,
  useSession,
  verifyDeviceCodeOptions
} from "@better-auth-ui/solid"
import { createMutation } from "@tanstack/solid-query"
import type { BetterFetchError } from "better-auth/client"
import { Check, CircleCheck, CircleX, X } from "lucide-solid"
import {
  createEffect,
  createSignal,
  For,
  Match,
  onMount,
  Show,
  Switch
} from "solid-js"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel
} from "@/components/ui/field"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot
} from "@/components/ui/input-otp"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import { deviceAuthorizationPlugin } from "@/lib/auth/device-authorization-plugin"
import { cn } from "@/lib/utils"

type DeviceAuthorizationStep = "code" | "approval" | "approved" | "denied"

type VerifyDeviceCodeData = Awaited<
  ReturnType<DeviceAuthorizationAuthClient["device"]>
>
type VerifyDeviceCodeVariables = Parameters<
  DeviceAuthorizationAuthClient["device"]
>[0]
type ApproveDeviceData = Awaited<
  ReturnType<DeviceAuthorizationAuthClient["device"]["approve"]>
>
type ApproveDeviceVariables = Parameters<
  DeviceAuthorizationAuthClient["device"]["approve"]
>[0]
type DenyDeviceData = Awaited<
  ReturnType<DeviceAuthorizationAuthClient["device"]["deny"]>
>
type DenyDeviceVariables = Parameters<
  DeviceAuthorizationAuthClient["device"]["deny"]
>[0]

function normalizeDeviceCode(value: string) {
  return value.replace(/-/g, "").trim().toUpperCase()
}

function createDeviceCodeSlots(length: number) {
  return Array.from({ length }, (_, slotIndex) => ({
    id: `device-code-character-${String(slotIndex + 1)}`,
    index: slotIndex
  }))
}

export type DeviceAuthorizationProps = {
  class?: string
}

/**
 * Render Better Auth's browser-side device authorization ceremony.
 *
 * The view accepts a user code, sends unauthenticated users through sign-in
 * with a return URL, verifies and claims the code for the current session,
 * and lets the user approve or deny the device.
 */
export function DeviceAuthorization(props: DeviceAuthorizationProps) {
  const auth = useAuth()
  const {
    localization,
    userCodeLength,
    viewPaths: deviceAuthorizationViewPaths
  } = useAuthPlugin(deviceAuthorizationPlugin)
  const deviceAuthClient = auth.authClient as DeviceAuthorizationAuthClient
  const session = useSession(deviceAuthClient)
  const [step, setStep] = createSignal<DeviceAuthorizationStep>("code")
  const [userCode, setUserCode] = createSignal("")
  const [codeError, setCodeError] = createSignal("")
  const normalizedUserCode = () => normalizeDeviceCode(userCode())
  let submittedCode: string | undefined

  const handleAuthorizationError = () => {
    setStep("code")
    setCodeError(localization.invalidDeviceCode)
  }

  onMount(() => {
    const code = new URLSearchParams(window.location.search).get("user_code")
    if (!code) return

    setUserCode(
      normalizeDeviceCode(code)
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, userCodeLength)
    )
  })

  const verifyDeviceCode = createMutation<
    VerifyDeviceCodeData,
    BetterFetchError,
    VerifyDeviceCodeVariables
  >(() => ({
    ...verifyDeviceCodeOptions(deviceAuthClient),
    onError: handleAuthorizationError,
    onSuccess: ({ status }) => {
      if (status === "approved" || status === "denied") {
        setStep(status)
        return
      }

      setStep("approval")
    }
  }))

  const approveDevice = createMutation<
    ApproveDeviceData,
    BetterFetchError,
    ApproveDeviceVariables
  >(() => ({
    ...approveDeviceOptions(deviceAuthClient),
    onError: handleAuthorizationError,
    onSuccess: () => setStep("approved")
  }))

  const denyDevice = createMutation<
    DenyDeviceData,
    BetterFetchError,
    DenyDeviceVariables
  >(() => ({
    ...denyDeviceOptions(deviceAuthClient),
    onError: handleAuthorizationError,
    onSuccess: () => setStep("denied")
  }))

  const handleCodeChange = (value: string) => {
    const nextCode = normalizeDeviceCode(value)
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, userCodeLength)

    if (nextCode !== submittedCode) {
      submittedCode = undefined
    }

    setUserCode(nextCode)
    setCodeError("")
  }

  const submitCode = (completedCode: string) => {
    const normalizedCode = normalizeDeviceCode(completedCode)

    if (
      session.isPending ||
      verifyDeviceCode.isPending ||
      normalizedCode.length !== userCodeLength ||
      normalizedCode === submittedCode
    ) {
      return
    }

    submittedCode = normalizedCode

    if (!session.data) {
      const verificationPath = `${auth.basePaths.auth}/${deviceAuthorizationViewPaths.auth.deviceAuthorization}?user_code=${encodeURIComponent(normalizedCode)}`
      const signInPath = `${auth.basePaths.auth}/${auth.viewPaths.auth.signIn}?redirectTo=${encodeURIComponent(verificationPath)}`
      auth.navigate({ to: signInPath })
      return
    }

    verifyDeviceCode.mutate({
      query: { user_code: normalizedCode }
    })
  }

  createEffect(() => {
    const currentCode = normalizedUserCode()

    if (currentCode.length === userCodeLength) {
      submitCode(currentCode)
    }
  })

  const handleSubmit = (event: SubmitEvent) => {
    event.preventDefault()

    if (normalizedUserCode().length !== userCodeLength) {
      handleAuthorizationError()
      return
    }

    submitCode(normalizedUserCode())
  }

  const cardClass = () => cn("w-full max-w-sm", props.class)

  return (
    <Switch>
      <Match when={step() === "approval" ? session.data : undefined}>
        {(currentSession) => (
          <DeviceApproval
            class={cardClass()}
            isApproving={approveDevice.isPending}
            isDenying={denyDevice.isPending}
            localization={localization}
            user={currentSession().user}
            userCode={normalizedUserCode()}
            onApprove={() =>
              approveDevice.mutate({ userCode: normalizedUserCode() })
            }
            onDeny={() => denyDevice.mutate({ userCode: normalizedUserCode() })}
          />
        )}
      </Match>

      <Match when={step() === "approved" || step() === "denied"}>
        <DeviceAuthorizationResult
          class={cardClass()}
          localization={localization}
          status={step() as "approved" | "denied"}
          onReturn={() => auth.navigate({ to: auth.redirectTo })}
        />
      </Match>

      <Match when>
        <DeviceCodeForm
          class={cardClass()}
          codeError={codeError()}
          isSessionPending={session.isPending}
          isVerifying={verifyDeviceCode.isPending}
          localization={localization}
          userCode={userCode()}
          userCodeLength={userCodeLength}
          onCodeChange={handleCodeChange}
          onCodeComplete={submitCode}
          onSubmit={handleSubmit}
        />
      </Match>
    </Switch>
  )
}

type DeviceCodeFormProps = {
  class: string
  codeError: string
  isSessionPending: boolean
  isVerifying: boolean
  localization: DeviceAuthorizationLocalization
  userCode: string
  userCodeLength: number
  onCodeChange: (value: string) => void
  onCodeComplete: (value: string) => void
  onSubmit: (event: SubmitEvent) => void
}

function DeviceCodeForm(props: DeviceCodeFormProps) {
  const slots = createDeviceCodeSlots(props.userCodeLength)
  const groupBreak = Math.ceil(props.userCodeLength / 2)
  const firstGroup = slots.slice(0, groupBreak)
  const secondGroup = slots.slice(groupBreak)
  const errorId = "device-code-error"

  return (
    <Card class={props.class}>
      <CardHeader>
        <CardTitle class="text-xl">
          {props.localization.deviceAuthorization}
        </CardTitle>
        <CardDescription>
          {props.localization.deviceAuthorizationDescription}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form
          aria-label={props.localization.deviceAuthorization}
          onSubmit={props.onSubmit}
        >
          <FieldGroup>
            <Field data-invalid={Boolean(props.codeError)}>
              <FieldLabel for="device-code">
                {props.localization.deviceCode}
              </FieldLabel>

              <InputOTP
                maxLength={props.userCodeLength}
                id="device-code"
                aria-describedby={props.codeError ? errorId : undefined}
                aria-invalid={Boolean(props.codeError)}
                aria-label={props.localization.deviceCode}
                autocomplete="one-time-code"
                containerClass="w-full justify-center"
                disabled={props.isVerifying}
                inputmode="text"
                name="userCode"
                pattern="^[A-Za-z0-9]*$"
                value={props.userCode}
                onValueChange={props.onCodeChange}
                onComplete={props.onCodeComplete}
              >
                <InputOTPGroup>
                  <For each={firstGroup}>
                    {(slot) => <InputOTPSlot index={slot.index} />}
                  </For>
                </InputOTPGroup>

                <Show when={secondGroup.length > 0}>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <For each={secondGroup}>
                      {(slot) => <InputOTPSlot index={slot.index} />}
                    </For>
                  </InputOTPGroup>
                </Show>
              </InputOTP>

              <Show when={props.codeError}>
                <FieldError id={errorId}>{props.codeError}</FieldError>
              </Show>
            </Field>

            <Button
              class="w-full"
              disabled={
                props.userCode.length !== props.userCodeLength ||
                props.isSessionPending ||
                props.isVerifying
              }
              type="submit"
            >
              <Show when={props.isVerifying}>
                <Spinner />
              </Show>
              {props.localization.continue}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}

type DeviceApprovalProps = {
  class: string
  isApproving: boolean
  isDenying: boolean
  localization: DeviceAuthorizationLocalization
  user: {
    email: string
    name: string
  }
  userCode: string
  onApprove: () => void
  onDeny: () => void
}

function DeviceApproval(props: DeviceApprovalProps) {
  const isPending = () => props.isApproving || props.isDenying

  return (
    <Card class={props.class}>
      <CardHeader>
        <CardTitle class="text-xl">
          {props.localization.approveDevice}
        </CardTitle>
        <CardDescription>
          {props.localization.approveDeviceDescription}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div class="flex flex-col gap-3 rounded-lg border bg-muted/50 p-3">
          <div class="flex flex-col gap-1">
            <p class="text-xs text-muted-foreground">
              {props.localization.deviceCode}
            </p>
            <p class="font-mono text-sm font-medium tracking-wider">
              {props.userCode}
            </p>
          </div>

          <Separator />

          <div class="flex flex-col gap-1">
            <p class="text-xs text-muted-foreground">
              {props.localization.signedInAs}
            </p>
            <p class="text-sm font-medium">
              {props.user.name || props.user.email}
            </p>
            <Show when={props.user.name}>
              <p class="text-xs text-muted-foreground">{props.user.email}</p>
            </Show>
          </div>
        </div>
      </CardContent>

      <CardFooter class="grid grid-cols-2 gap-2">
        <Button disabled={isPending()} variant="outline" onClick={props.onDeny}>
          <Show when={props.isDenying} fallback={<X />}>
            <Spinner />
          </Show>
          {props.localization.deny}
        </Button>

        <Button disabled={isPending()} onClick={props.onApprove}>
          <Show when={props.isApproving} fallback={<Check />}>
            <Spinner />
          </Show>
          {props.localization.approve}
        </Button>
      </CardFooter>
    </Card>
  )
}

type DeviceAuthorizationResultProps = {
  class: string
  localization: DeviceAuthorizationLocalization
  status: "approved" | "denied"
  onReturn: () => void
}

function DeviceAuthorizationResult(props: DeviceAuthorizationResultProps) {
  const approved = () => props.status === "approved"

  return (
    <Card class={props.class}>
      <CardHeader class="justify-items-center text-center">
        <Show
          when={approved()}
          fallback={
            <CircleX aria-hidden="true" class="mb-1 size-10 text-destructive" />
          }
        >
          <CircleCheck aria-hidden="true" class="mb-1 size-10 text-primary" />
        </Show>
        <CardTitle class="text-xl">
          {approved()
            ? props.localization.deviceApproved
            : props.localization.deviceDenied}
        </CardTitle>
        <CardDescription>
          {approved()
            ? props.localization.deviceApprovedDescription
            : props.localization.deviceDeniedDescription}
        </CardDescription>
      </CardHeader>

      <CardFooter>
        <Button class="w-full" onClick={props.onReturn}>
          {props.localization.returnToApplication}
        </Button>
      </CardFooter>
    </Card>
  )
}
