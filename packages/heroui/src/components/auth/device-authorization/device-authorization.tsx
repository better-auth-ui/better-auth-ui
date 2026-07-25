import type { DeviceAuthorizationLocalization } from "@better-auth-ui/core/plugins"
import {
  type DeviceAuthorizationAuthClient,
  useApproveDevice,
  useAuth,
  useAuthPlugin,
  useDenyDevice,
  useSession,
  useVerifyDeviceCode
} from "@better-auth-ui/react"
import { Check, CircleCheck, CircleXmark, Xmark } from "@gravity-ui/icons"
import {
  Button,
  Card,
  type CardProps,
  cn,
  Form,
  InputOTP,
  Label,
  REGEXP_ONLY_DIGITS_AND_CHARS,
  Spinner
} from "@heroui/react"
import {
  type FormEvent,
  type ReactNode,
  useEffect,
  useReducer,
  useState
} from "react"

import { deviceAuthorizationPlugin } from "../../../lib/auth/device-authorization-plugin"

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
  variant?: CardProps["variant"]
}

/**
 * Render Better Auth's browser-side device authorization ceremony.
 *
 * The view accepts a user code, sends unauthenticated users through sign-in
 * with a return URL, verifies and claims the code for the current session,
 * and lets the user approve or deny the device.
 *
 * @param className - Additional CSS classes applied to the card.
 * @param variant - HeroUI card variant.
 */
export function DeviceAuthorization({
  className,
  variant
}: DeviceAuthorizationProps) {
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
  const normalizedUserCode = normalizeDeviceCode(userCode)

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

  const handleCodeChange = (value: string) => {
    setUserCode(value.toUpperCase())
    dispatch({ type: "codeChanged" })
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (normalizedUserCode.length !== userCodeLength) {
      dispatch({
        type: "verificationFailed",
        message: localization.invalidDeviceCode
      })
      return
    }

    if (!session) {
      const verificationPath = `${basePaths.auth}/${deviceAuthorizationViewPaths.auth.deviceAuthorization}?user_code=${encodeURIComponent(normalizedUserCode)}`
      const signInPath = `${basePaths.auth}/${viewPaths.auth.signIn}?redirectTo=${encodeURIComponent(verificationPath)}`
      navigate({ to: signInPath })
      return
    }

    verifyDeviceCode({
      query: { user_code: normalizedUserCode }
    })
  }

  const cardClassName = cn("w-full max-w-sm gap-4 md:p-6", className) ?? ""

  if (state.step === "approval" && session) {
    return (
      <DeviceApproval
        className={cardClassName}
        localization={localization}
        userCode={normalizedUserCode}
        user={session.user}
        variant={variant}
        isApproving={isApproving}
        isDenying={isDenying}
        onApprove={() => approveDevice({ userCode: normalizedUserCode })}
        onDeny={() => denyDevice({ userCode: normalizedUserCode })}
      />
    )
  }

  if (state.step === "approved" || state.step === "denied") {
    return (
      <DeviceAuthorizationResult
        className={cardClassName}
        localization={localization}
        status={state.step}
        variant={variant}
        action={
          <Button
            className="w-full"
            onPress={() => navigate({ to: redirectTo })}
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
      userCode={userCode}
      userCodeLength={userCodeLength}
      variant={variant}
      onCodeChange={handleCodeChange}
      onSubmit={handleSubmit}
    />
  )
}

type DeviceCodeFormProps = {
  className: string
  codeError: string
  isSessionPending: boolean
  isVerifying: boolean
  localization: DeviceAuthorizationLocalization
  userCode: string
  userCodeLength: number
  variant?: CardProps["variant"]
  onCodeChange: (value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

function DeviceCodeForm({
  className,
  codeError,
  isSessionPending,
  isVerifying,
  localization,
  userCode,
  userCodeLength,
  variant,
  onCodeChange,
  onSubmit
}: DeviceCodeFormProps) {
  const slots = createDeviceCodeSlots(userCodeLength)
  const groupBreak = Math.ceil(userCodeLength / 2)
  const firstGroup = slots.slice(0, groupBreak)
  const secondGroup = slots.slice(groupBreak)
  const errorId = "device-code-error"

  return (
    <Card className={className} variant={variant}>
      <Card.Header>
        <Card.Title className="text-xl font-semibold mb-1">
          {localization.deviceAuthorization}
        </Card.Title>
        <Card.Description>
          {localization.deviceAuthorizationDescription}
        </Card.Description>
      </Card.Header>

      <Card.Content>
        <Form className="flex flex-col gap-4" onSubmit={onSubmit}>
          <div className="flex flex-col gap-2">
            <Label htmlFor="device-code">{localization.deviceCode}</Label>

            <InputOTP
              id="device-code"
              aria-describedby={codeError ? errorId : undefined}
              aria-label={localization.deviceCode}
              className="w-full flex-col items-center justify-center gap-2 sm:flex-row"
              inputMode="text"
              isDisabled={isVerifying}
              isInvalid={Boolean(codeError)}
              maxLength={userCodeLength}
              name="userCode"
              pasteTransformer={normalizeDeviceCode}
              pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
              value={userCode}
              variant={variant === "transparent" ? "primary" : "secondary"}
              onChange={onCodeChange}
            >
              <InputOTP.Group className="gap-1">
                {firstGroup.map((slot) => (
                  <InputOTP.Slot
                    className="size-8 text-sm sm:size-9"
                    key={slot.id}
                    index={slot.index}
                  />
                ))}
              </InputOTP.Group>

              {secondGroup.length > 0 ? (
                <>
                  <InputOTP.Separator className="hidden sm:block" />
                  <InputOTP.Group className="gap-1">
                    {secondGroup.map((slot) => (
                      <InputOTP.Slot
                        className="size-8 text-sm sm:size-9"
                        key={slot.id}
                        index={slot.index}
                      />
                    ))}
                  </InputOTP.Group>
                </>
              ) : null}
            </InputOTP>

            <span
              className="field-error"
              data-visible={Boolean(codeError)}
              id={errorId}
            >
              {codeError}
            </span>
          </div>

          <Button
            className="w-full"
            isDisabled={userCode.length !== userCodeLength || isSessionPending}
            isPending={isVerifying}
            type="submit"
          >
            {isVerifying ? <Spinner color="current" size="sm" /> : null}
            {localization.continue}
          </Button>
        </Form>
      </Card.Content>
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
  variant?: CardProps["variant"]
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
  variant,
  onApprove,
  onDeny
}: DeviceApprovalProps) {
  const isPending = isApproving || isDenying

  return (
    <Card className={className} variant={variant}>
      <Card.Header>
        <Card.Title className="text-xl font-semibold mb-1">
          {localization.approveDevice}
        </Card.Title>
        <Card.Description>
          {localization.approveDeviceDescription}
        </Card.Description>
      </Card.Header>

      <Card.Content>
        <dl className="flex flex-col gap-3 rounded-lg border border-border bg-surface-secondary p-4">
          <div className="flex flex-col gap-1">
            <dt className="text-xs text-muted">{localization.deviceCode}</dt>
            <dd className="font-mono text-sm font-medium tracking-wider">
              {userCode}
            </dd>
          </div>

          <div className="border-t border-border pt-3">
            <dt className="text-xs text-muted">{localization.signedInAs}</dt>
            <dd className="mt-1 flex flex-col text-sm">
              <span className="font-medium">{user.name || user.email}</span>
              {user.name ? (
                <span className="text-muted">{user.email}</span>
              ) : null}
            </dd>
          </div>
        </dl>
      </Card.Content>

      <Card.Footer className="grid grid-cols-2 gap-3">
        <Button
          className="w-full"
          isDisabled={isPending}
          isPending={isDenying}
          variant="secondary"
          onPress={onDeny}
        >
          {isDenying ? <Spinner color="current" size="sm" /> : <Xmark />}
          {localization.deny}
        </Button>

        <Button
          className="w-full"
          isDisabled={isPending}
          isPending={isApproving}
          onPress={onApprove}
        >
          {isApproving ? <Spinner color="current" size="sm" /> : <Check />}
          {localization.approve}
        </Button>
      </Card.Footer>
    </Card>
  )
}

type DeviceAuthorizationResultProps = {
  action: ReactNode
  className: string
  localization: DeviceAuthorizationLocalization
  status: "approved" | "denied"
  variant?: CardProps["variant"]
}

function DeviceAuthorizationResult({
  action,
  className,
  localization,
  status,
  variant
}: DeviceAuthorizationResultProps) {
  const approved = status === "approved"
  const Icon = approved ? CircleCheck : CircleXmark

  return (
    <Card className={className} variant={variant}>
      <Card.Header className="items-center text-center">
        <Icon
          aria-hidden="true"
          className={cn(
            "mb-2 size-10",
            approved ? "text-success" : "text-danger"
          )}
        />
        <Card.Title className="text-xl font-semibold">
          {approved ? localization.deviceApproved : localization.deviceDenied}
        </Card.Title>
        <Card.Description>
          {approved
            ? localization.deviceApprovedDescription
            : localization.deviceDeniedDescription}
        </Card.Description>
      </Card.Header>

      <Card.Footer>{action}</Card.Footer>
    </Card>
  )
}
