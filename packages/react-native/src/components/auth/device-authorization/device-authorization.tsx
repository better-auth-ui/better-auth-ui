import {
  getAuthLinkURL,
  getViewURL,
  validateStringLength
} from "@better-auth-ui/core"
import type { DeviceAuthorizationAuthClient } from "@better-auth-ui/core/plugins/device-authorization"
import { useAuth, useAuthPlugin, useSession } from "@better-auth-ui/react"
import {
  useApproveDevice,
  useDenyDevice,
  useVerifyDeviceCode
} from "@better-auth-ui/react/plugins/device-authorization"
import { useEffect, useRef, useState } from "react"
import { deviceAuthorizationPlugin } from "../../../lib/auth/device-authorization-plugin"
import type { AuthViewProps } from "../../../lib/auth-plugin"
import { useAuthNavigation } from "../../../navigation/navigation-context"
import { cn } from "../../../lib/cn"
import { Separator } from "../../../primitives/separator"
import { UserAvatar } from "../user/user-avatar"
import { Button } from "../../../primitives/button"
import { Card } from "../../../primitives/card"
import { Description } from "../../../primitives/description"
import { Box, Txt } from "../../../primitives/styled"
import { useAuthForm, submitAuthForm } from "../auth-form"

const normalizeCode = (value: string) =>
  value.replace(/[^a-z0-9]/gi, "").toUpperCase()

export function DeviceAuthorization(props: AuthViewProps) {
  const {
    authClient,
    basePaths,
    redirectTo,
    localization: authLocalization
  } = useAuth()
  const { localization, userCodeLength, viewPaths } = useAuthPlugin(
    deviceAuthorizationPlugin
  )
  const navigation = useAuthNavigation()
  const { data: session, isPending: sessionPending } = useSession(authClient)
  const [step, setStep] = useState<"code" | "approval" | "approved" | "denied">(
    "code"
  )
  const client = authClient as DeviceAuthorizationAuthClient
  const verify = useVerifyDeviceCode(client, {
    onSuccess: ({ status }) =>
      setStep(
        status === "approved"
          ? "approved"
          : status === "denied"
            ? "denied"
            : "approval"
      )
  })
  const failed = () => {
    setStep("code")
    autoSubmitted.current = false
  }
  const approve = useApproveDevice(client, {
    onSuccess: () => setStep("approved"),
    onError: failed
  })
  const deny = useDenyDevice(client, {
    onSuccess: () => setStep("denied"),
    onError: failed
  })
  const pending = verify.isPending || approve.isPending || deny.isPending
  const initialCode = normalizeCode(
    navigation.getParam("user_code") ?? ""
  ).slice(0, userCodeLength)
  const autoSubmitted = useRef(false)
  const form = useAuthForm({
    defaultValues: { code: initialCode },
    onSubmit: async ({ value }) => {
      const code = normalizeCode(value.code)
      if (!session) {
        navigation.push("signIn", {
          params: {
            redirectTo:
              getAuthLinkURL(
                getViewURL(
                  "",
                  basePaths.auth,
                  viewPaths.auth.deviceAuthorization
                ),
                redirectTo
              ) + `&user_code=${encodeURIComponent(code)}`
          }
        })
        return
      }
      await verify.mutateAsync({ query: { user_code: code } })
    }
  })
  useEffect(() => {
    if (
      initialCode.length !== userCodeLength ||
      sessionPending ||
      autoSubmitted.current
    )
      return
    autoSubmitted.current = true
    void submitAuthForm(form, localization.invalidDeviceCode)
  }, [
    form,
    initialCode,
    userCodeLength,
    sessionPending,
    localization.invalidDeviceCode
  ])
  const final = step === "approved" || step === "denied"
  const title =
    step === "approved"
      ? localization.deviceApproved
      : step === "denied"
        ? localization.deviceDenied
        : step === "approval"
          ? localization.approveDevice
          : localization.deviceAuthorization
  if (step === "approval") {
    return (
      <Card
        className={cn("overflow-hidden p-0", props.className)}
        variant={props.variant}
      >
        <Card.Header className="items-center gap-5 p-6">
          <UserAvatar
            className="size-16"
            user={session?.user}
            isPending={sessionPending}
          />
          <Box className="items-center gap-1">
            <Card.Title className="text-center">
              {localization.approveDevice}
            </Card.Title>
            <Description className="text-center">
              {localization.approveDeviceDescription}
            </Description>
          </Box>
          <Box className="items-center gap-1">
            <Description>{localization.signedInAs}</Description>
            <Txt className="text-sm font-medium text-foreground">
              {session?.user.name || session?.user.email}
            </Txt>
            {session?.user.name ? (
              <Description>{session.user.email}</Description>
            ) : null}
          </Box>
        </Card.Header>
        <Card.Content className="px-4 pb-6">
          <Box className="items-center gap-2 rounded-lg bg-surface-secondary p-5">
            <Description>{localization.deviceCode}</Description>
            <Txt className="font-mono text-2xl font-semibold text-foreground">
              {normalizeCode(form.state.values.code)}
            </Txt>
          </Box>
        </Card.Content>
        <Separator />
        <Card.Footer className="flex-row gap-3 p-4">
          <Button
            className="flex-1"
            variant="secondary"
            isPending={deny.isPending}
            isDisabled={pending}
            onPress={() =>
              deny.mutate({ userCode: normalizeCode(form.state.values.code) })
            }
          >
            {localization.deny}
          </Button>
          <Button
            className="flex-1"
            variant="primary"
            isPending={approve.isPending}
            isDisabled={pending}
            onPress={() =>
              approve.mutate({
                userCode: normalizeCode(form.state.values.code)
              })
            }
          >
            {localization.approve}
          </Button>
        </Card.Footer>
      </Card>
    )
  }
  return (
    <Card className={props.className} variant={props.variant}>
      <Card.Header>
        <Card.Title>{title}</Card.Title>
      </Card.Header>
      <Card.Content className="gap-4">
        <Description>
          {step === "approved"
            ? localization.deviceApprovedDescription
            : step === "denied"
              ? localization.deviceDeniedDescription
              : localization.deviceAuthorizationDescription}
        </Description>
        {step === "code" ? (
          <form.AppForm>
            <form.AuthFormRoot
              className="gap-4"
              serverErrorMessage={localization.invalidDeviceCode}
            >
              <form.AppField
                name="code"
                validators={{
                  onChange: ({ value }) =>
                    validateStringLength(normalizeCode(value), {
                      requiredMessage: localization.invalidDeviceCode,
                      minLength: userCodeLength,
                      maxLength: userCodeLength,
                      minLengthMessage: localization.invalidDeviceCode,
                      maxLengthMessage: localization.invalidDeviceCode
                    })
                }}
              >
                {(field) => (
                  <field.AuthFormTextField
                    label={localization.deviceCode}
                    isDisabled={pending || sessionPending}
                    inputProps={{ autoCapitalize: "characters" }}
                  />
                )}
              </form.AppField>
              <form.AuthFormSubmitButton
                isPending={pending}
                isDisabled={sessionPending}
              >
                {localization.continue}
              </form.AuthFormSubmitButton>
            </form.AuthFormRoot>
          </form.AppForm>
        ) : null}
        {final ? (
          <Button onPress={() => navigation.navigate({ to: redirectTo })}>
            {localization.returnToApplication}
          </Button>
        ) : null}
        {!final ? (
          <Description>{authLocalization.auth.signIn}</Description>
        ) : null}
      </Card.Content>
    </Card>
  )
}
