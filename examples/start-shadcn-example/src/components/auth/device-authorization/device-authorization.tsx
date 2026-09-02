"use client"

import type {
  DeviceAuthorizationAuthClient,
  DeviceAuthorizationLocalization
} from "@better-auth-ui/core/plugins/device-authorization"
import { useAuth, useAuthPlugin, useSession } from "@better-auth-ui/react"
import {
  useApproveDevice,
  useDenyDevice,
  useVerifyDeviceCode
} from "@better-auth-ui/react/plugins/device-authorization"
import { useSelector } from "@tanstack/react-form"
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp"
import { CheckIcon, CircleCheckIcon, CircleXIcon, XIcon } from "lucide-react"
import {
  type ReactNode,
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState
} from "react"

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
import { useAuthForm } from "../auth-form"

type DeviceAuthorizationStep = "code" | "approval" | "approved" | "denied"

type DeviceAuthorizationState = {
  step: DeviceAuthorizationStep
  codeError: string
}

type DeviceAuthorizationAction =
  | { type: "codeChanged" }
  | { type: "verificationFailed"; message: string }
  | { type: "verificationSucceeded"; status: string }
  | { type: "approved" }
  | { type: "denied" }

const initialDeviceAuthorizationState: DeviceAuthorizationState = {
  step: "code",
  codeError: ""
}

function deviceAuthorizationReducer(
  state: DeviceAuthorizationState,
  action: DeviceAuthorizationAction
): DeviceAuthorizationState {
  switch (action.type) {
    case "codeChanged":
      return state.codeError ? { ...state, codeError: "" } : state
    case "verificationFailed":
      return { step: "code", codeError: action.message }
    case "verificationSucceeded":
      if (action.status === "approved") {
        return { step: "approved", codeError: "" }
      }
      if (action.status === "denied") {
        return { step: "denied", codeError: "" }
      }
      return { step: "approval", codeError: "" }
    case "approved":
      return { step: "approved", codeError: "" }
    case "denied":
      return { step: "denied", codeError: "" }
  }
}

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
  className?: string
}

/**
 * Render Better Auth's browser-side device authorization ceremony.
 *
 * The view accepts a user code, sends unauthenticated users through sign-in
 * with a return URL, verifies and claims the code for the current session,
 * and lets the user approve or deny the device.
 *
 * @param className - Additional CSS classes applied to the card.
 */
export function DeviceAuthorization({ className }: DeviceAuthorizationProps) {
  const { authClient, basePaths, navigate, redirectTo, viewPaths } = useAuth()
  const {
    localization,
    userCodeLength,
    viewPaths: deviceAuthorizationViewPaths
  } = useAuthPlugin(deviceAuthorizationPlugin)
  const deviceAuthClient = authClient as DeviceAuthorizationAuthClient
  const { data: session, isPending: isSessionPending } =
    useSession(deviceAuthClient)
  const [userCode, setUserCode] = useState("")
  const [state, dispatch] = useReducer(
    deviceAuthorizationReducer,
    initialDeviceAuthorizationState
  )
  const submittedCodeRef = useRef<string | null>(null)

  const handleAuthorizationError = () => {
    dispatch({
      type: "verificationFailed",
      message: localization.invalidDeviceCode
    })
  }

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("user_code")
    if (!code) return

    setUserCode(
      normalizeDeviceCode(code)
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, userCodeLength)
    )
  }, [userCodeLength])

  const { mutate: verifyDeviceCode, isPending: isVerifying } =
    useVerifyDeviceCode(deviceAuthClient, {
      onError: handleAuthorizationError,
      onSuccess: ({ status }) => {
        dispatch({ type: "verificationSucceeded", status })
      }
    })

  const { mutate: approveDevice, isPending: isApproving } = useApproveDevice(
    deviceAuthClient,
    {
      onError: handleAuthorizationError,
      onSuccess: () => dispatch({ type: "approved" })
    }
  )

  const { mutate: denyDevice, isPending: isDenying } = useDenyDevice(
    deviceAuthClient,
    {
      onError: handleAuthorizationError,
      onSuccess: () => dispatch({ type: "denied" })
    }
  )

  const submitCode = useCallback(
    (completedCode: string) => {
      const normalizedCode = normalizeDeviceCode(completedCode)

      if (
        isSessionPending ||
        isVerifying ||
        normalizedCode.length !== userCodeLength ||
        normalizedCode === submittedCodeRef.current
      ) {
        return
      }

      submittedCodeRef.current = normalizedCode

      if (!session) {
        const verificationPath = `${basePaths.auth}/${deviceAuthorizationViewPaths.auth.deviceAuthorization}?user_code=${encodeURIComponent(normalizedCode)}`
        const signInPath = `${basePaths.auth}/${viewPaths.auth.signIn}?redirectTo=${encodeURIComponent(verificationPath)}`
        navigate({ to: signInPath })
        return
      }

      verifyDeviceCode({
        query: { user_code: normalizedCode }
      })
    },
    [
      basePaths.auth,
      deviceAuthorizationViewPaths.auth.deviceAuthorization,
      isSessionPending,
      isVerifying,
      navigate,
      session,
      userCodeLength,
      verifyDeviceCode,
      viewPaths.auth.signIn
    ]
  )

  const handleSubmit = useCallback(
    (code: string) => {
      const normalizedCode = normalizeDeviceCode(code)
      if (normalizedCode.length !== userCodeLength) {
        dispatch({
          type: "verificationFailed",
          message: localization.invalidDeviceCode
        })
        return
      }
      submitCode(normalizedCode)
    },
    [localization.invalidDeviceCode, submitCode, userCodeLength]
  )

  const authorizedCode = submittedCodeRef.current ?? ""

  const cardClassName = cn("w-full max-w-sm", className)

  if (state.step === "approval" && session) {
    return (
      <DeviceApproval
        className={cardClassName}
        localization={localization}
        userCode={authorizedCode}
        user={session.user}
        isApproving={isApproving}
        isDenying={isDenying}
        onApprove={() => approveDevice({ userCode: authorizedCode })}
        onDeny={() => denyDevice({ userCode: authorizedCode })}
      />
    )
  }

  if (state.step === "approved" || state.step === "denied") {
    return (
      <DeviceAuthorizationResult
        className={cardClassName}
        localization={localization}
        status={state.step}
        action={
          <Button
            className="w-full"
            onClick={() => navigate({ to: redirectTo })}
          >
            {localization.returnToApplication}
          </Button>
        }
      />
    )
  }

  return (
    <DeviceCodeForm
      className={cardClassName}
      codeError={state.codeError}
      isSessionPending={isSessionPending}
      isVerifying={isVerifying}
      localization={localization}
      initialUserCode={userCode}
      userCodeLength={userCodeLength}
      onCodeChange={() => dispatch({ type: "codeChanged" })}
      onSubmitCode={handleSubmit}
    />
  )
}

type DeviceCodeFormProps = {
  className: string
  codeError: string
  isSessionPending: boolean
  isVerifying: boolean
  localization: DeviceAuthorizationLocalization
  initialUserCode: string
  userCodeLength: number
  onCodeChange: (value: string) => void
  onSubmitCode: (code: string) => void
}

function DeviceCodeForm({
  className,
  codeError,
  isSessionPending,
  isVerifying,
  localization,
  initialUserCode,
  userCodeLength,
  onCodeChange,
  onSubmitCode
}: DeviceCodeFormProps) {
  const slots = createDeviceCodeSlots(userCodeLength)
  const groupBreak = Math.ceil(userCodeLength / 2)
  const firstGroup = slots.slice(0, groupBreak)
  const secondGroup = slots.slice(groupBreak)
  const errorId = "device-code-error"
  const form = useAuthForm({
    defaultValues: { userCode: initialUserCode },
    onSubmit: ({ value }) => onSubmitCode(value.userCode)
  })
  const userCodeComplete = useSelector(
    form.store,
    (state) => state.values.userCode.length === userCodeLength
  )

  useEffect(() => {
    form.setFieldValue("userCode", initialUserCode)
    if (initialUserCode.length === userCodeLength) {
      onSubmitCode(initialUserCode)
    }
  }, [form.setFieldValue, initialUserCode, onSubmitCode, userCodeLength])

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-xl">
          {localization.deviceAuthorization}
        </CardTitle>
        <CardDescription>
          {localization.deviceAuthorizationDescription}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form.AppForm>
          <form.AuthFormRoot aria-label={localization.deviceAuthorization}>
            <FieldGroup>
              <form.AppField name="userCode">
                {(field) => (
                  <Field data-invalid={Boolean(codeError)}>
                    <FieldLabel htmlFor="device-code">
                      {localization.deviceCode}
                    </FieldLabel>

                    <InputOTP
                      id="device-code"
                      aria-describedby={codeError ? errorId : undefined}
                      aria-invalid={Boolean(codeError)}
                      autoComplete="one-time-code"
                      containerClassName="w-full justify-center"
                      disabled={isVerifying}
                      inputMode="text"
                      maxLength={userCodeLength}
                      name={field.name}
                      pasteTransformer={normalizeDeviceCode}
                      pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
                      value={field.state.value}
                      onChange={(value) => {
                        const nextCode = normalizeDeviceCode(value)
                          .replace(/[^A-Z0-9]/g, "")
                          .slice(0, userCodeLength)
                        field.handleChange(nextCode)
                        onCodeChange(nextCode)
                        if (nextCode.length === userCodeLength)
                          onSubmitCode(nextCode)
                      }}
                    >
                      <InputOTPGroup>
                        {firstGroup.map((slot) => (
                          <InputOTPSlot key={slot.id} index={slot.index} />
                        ))}
                      </InputOTPGroup>

                      {secondGroup.length > 0 ? (
                        <>
                          <InputOTPSeparator />
                          <InputOTPGroup>
                            {secondGroup.map((slot) => (
                              <InputOTPSlot key={slot.id} index={slot.index} />
                            ))}
                          </InputOTPGroup>
                        </>
                      ) : null}
                    </InputOTP>

                    <FieldError id={errorId}>{codeError}</FieldError>
                  </Field>
                )}
              </form.AppField>

              <form.AuthFormSubmitButton
                className="w-full"
                disabled={!userCodeComplete || isSessionPending || isVerifying}
                type="submit"
              >
                {isVerifying ? <Spinner data-icon="inline-start" /> : null}
                {localization.continue}
              </form.AuthFormSubmitButton>
            </FieldGroup>
          </form.AuthFormRoot>
        </form.AppForm>
      </CardContent>
    </Card>
  )
}

type DeviceApprovalProps = {
  className: string
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

function DeviceApproval({
  className,
  isApproving,
  isDenying,
  localization,
  user,
  userCode,
  onApprove,
  onDeny
}: DeviceApprovalProps) {
  const isPending = isApproving || isDenying

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-xl">{localization.approveDevice}</CardTitle>
        <CardDescription>
          {localization.approveDeviceDescription}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col gap-3 rounded-lg border bg-muted/50 p-3">
          <div className="flex flex-col gap-1">
            <p className="text-xs text-muted-foreground">
              {localization.deviceCode}
            </p>
            <p className="font-mono text-sm font-medium tracking-wider">
              {userCode}
            </p>
          </div>

          <Separator />

          <div className="flex flex-col gap-1">
            <p className="text-xs text-muted-foreground">
              {localization.signedInAs}
            </p>
            <p className="text-sm font-medium">{user.name || user.email}</p>
            {user.name ? (
              <p className="text-xs text-muted-foreground">{user.email}</p>
            ) : null}
          </div>
        </div>
      </CardContent>

      <CardFooter className="grid grid-cols-2 gap-2">
        <Button disabled={isPending} variant="outline" onClick={onDeny}>
          {isDenying ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <XIcon data-icon="inline-start" />
          )}
          {localization.deny}
        </Button>

        <Button disabled={isPending} onClick={onApprove}>
          {isApproving ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <CheckIcon data-icon="inline-start" />
          )}
          {localization.approve}
        </Button>
      </CardFooter>
    </Card>
  )
}

type DeviceAuthorizationResultProps = {
  action: ReactNode
  className: string
  localization: DeviceAuthorizationLocalization
  status: "approved" | "denied"
}

function DeviceAuthorizationResult({
  action,
  className,
  localization,
  status
}: DeviceAuthorizationResultProps) {
  const approved = status === "approved"
  const Icon = approved ? CircleCheckIcon : CircleXIcon

  return (
    <Card className={className}>
      <CardHeader className="justify-items-center text-center">
        <Icon
          aria-hidden="true"
          className={cn(
            "mb-1 size-10",
            approved ? "text-primary" : "text-destructive"
          )}
        />
        <CardTitle className="text-xl">
          {approved ? localization.deviceApproved : localization.deviceDenied}
        </CardTitle>
        <CardDescription>
          {approved
            ? localization.deviceApprovedDescription
            : localization.deviceDeniedDescription}
        </CardDescription>
      </CardHeader>

      <CardFooter>{action}</CardFooter>
    </Card>
  )
}
