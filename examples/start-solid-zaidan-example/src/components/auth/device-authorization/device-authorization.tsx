import type { User } from "better-auth"
import {
  approveDeviceOptions,
  type DeviceAuthorizationAuthClient,
  type DeviceAuthorizationLocalization,
  denyDeviceOptions,
  verifyDeviceCodeOptions
} from "@better-auth-ui/core/plugins/device-authorization"
import { useAuth, useAuthPlugin, useSession } from "@better-auth-ui/solid"
import { createMutation } from "@tanstack/solid-query"
import type { BetterFetchError } from "better-auth/client"
import { CircleCheck, CircleX } from "lucide-solid"
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
import { Spinner } from "@/components/ui/spinner"
import { deviceAuthorizationPlugin } from "@/lib/auth/device-authorization-plugin"
import { UserAvatar } from "../user/user-avatar"
import { cn } from "cn"
import { createAuthForm, isAuthFormFieldInvalid } from "../auth-form"

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

  const submitCode = async (completedCode: string) => {
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

    await verifyDeviceCode.mutateAsync({
      query: { user_code: normalizedCode }
    })
  }

  createEffect(() => {
    const currentCode = normalizedUserCode()

    if (currentCode.length === userCodeLength) {
      void submitCode(currentCode).catch(() => undefined)
    }
  })

  const cardClass = () => cn("w-full max-w-sm", props.class)

  return (
    <Switch>
      <Match when={step() === "approval" ? session.data : undefined}>
        {(currentSession) => (
          <DeviceApproval
            class={props.class ?? ""}
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
          onCodeComplete={(value) =>
            void submitCode(value).catch(() => undefined)
          }
          onSubmit={submitCode}
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
  onSubmit: (value: string) => Promise<void>
}

function DeviceCodeForm(props: DeviceCodeFormProps) {
  const slots = createDeviceCodeSlots(props.userCodeLength)
  const groupBreak = Math.ceil(props.userCodeLength / 2)
  const firstGroup = slots.slice(0, groupBreak)
  const secondGroup = slots.slice(groupBreak)
  const errorId = "device-code-error"
  const form = createAuthForm(() => ({
    defaultValues: { userCode: props.userCode },
    onSubmit: async ({ value }) => props.onSubmit(value.userCode)
  }))
  createEffect(() => {
    if (form.getFieldValue("userCode") !== props.userCode) {
      form.setFieldValue("userCode", props.userCode)
    }
  })

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
        <form.AppForm>
          <form.AuthFormRoot
            aria-label={props.localization.deviceAuthorization}
          >
            <FieldGroup>
              <form.AppField
                name="userCode"
                validators={{
                  onChange: ({ value }) =>
                    normalizeDeviceCode(value).length === props.userCodeLength
                      ? undefined
                      : props.localization.invalidDeviceCode
                }}
              >
                {(field) => (
                  <Field
                    data-invalid={
                      Boolean(props.codeError) ||
                      isAuthFormFieldInvalid(field().state.meta)
                    }
                  >
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
                      value={field().state.value}
                      onValueChange={(value) => {
                        field().handleChange(value)
                        props.onCodeChange(value)
                      }}
                      onComplete={(value) => {
                        field().handleChange(value)
                        props.onCodeComplete(value)
                      }}
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
                    <field.AuthFormFieldError />
                  </Field>
                )}
              </form.AppField>

              <form.AuthFormSubmitButton
                class="w-full"
                disabled={
                  props.userCode.length !== props.userCodeLength ||
                  props.isSessionPending ||
                  props.isVerifying
                }
              >
                {props.localization.continue}
              </form.AuthFormSubmitButton>
              <form.AuthFormServerError />
            </FieldGroup>
          </form.AuthFormRoot>
        </form.AppForm>
      </CardContent>
    </Card>
  )
}

type DeviceApprovalProps = {
  class: string
  isApproving: boolean
  isDenying: boolean
  localization: DeviceAuthorizationLocalization
  user: User
  userCode: string
  onApprove: () => void
  onDeny: () => void
}

function DeviceApproval(props: DeviceApprovalProps) {
  const isPending = () => props.isApproving || props.isDenying

  return (
    <Card
      class={cn("w-full max-w-lg gap-0! overflow-hidden py-0!", props.class)}
    >
      <CardHeader class="grid justify-items-center gap-5! p-6! text-center">
        <UserAvatar class="size-16!" user={props.user} />
        <div class="grid gap-1">
          <CardTitle class="text-xl! font-semibold!">
            {props.localization.approveDevice}
          </CardTitle>
          <CardDescription>
            {props.localization.approveDeviceDescription}
          </CardDescription>
        </div>
        <div class="grid max-w-full gap-1 text-sm text-muted-foreground">
          <span>{props.localization.signedInAs}</span>
          <span class="break-all font-medium text-foreground">
            {props.user.name || props.user.email}
          </span>
          {props.user.name ? (
            <span class="break-all">{props.user.email}</span>
          ) : null}
        </div>
      </CardHeader>
      <CardContent class="px-4! pt-0! pb-6! sm:px-6!">
        <div class="grid justify-items-center gap-2 rounded-lg bg-muted/50 p-5">
          <p class="text-sm text-muted-foreground">
            {props.localization.deviceCode}
          </p>
          <p class="font-mono text-2xl font-semibold tracking-widest">
            {props.userCode}
          </p>
        </div>
      </CardContent>
      <CardFooter class="grid grid-cols-2 gap-3 border-t border-border p-4! sm:p-6!">
        <Button
          class="h-11! w-full"
          disabled={isPending()}
          variant="secondary"
          onClick={props.onDeny}
        >
          {props.isDenying ? <Spinner /> : null}
          {props.localization.deny}
        </Button>
        <Button
          class="h-11! w-full"
          disabled={isPending()}
          onClick={props.onApprove}
        >
          {props.isApproving ? <Spinner /> : null}
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
