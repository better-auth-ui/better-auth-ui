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
import { Button } from "../../../primitives/button"
import { Card } from "../../../primitives/card"
import { Description } from "../../../primitives/description"
import { Txt } from "../../../primitives/styled"
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
              : step === "approval"
                ? localization.approveDeviceDescription
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
        {step === "approval" ? (
          <>
            <Txt>
              {localization.signedInAs}: {session?.user.email}
            </Txt>
            <Button
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
            <Button
              variant="danger"
              isPending={deny.isPending}
              isDisabled={pending}
              onPress={() =>
                deny.mutate({ userCode: normalizeCode(form.state.values.code) })
              }
            >
              {localization.deny}
            </Button>
          </>
        ) : null}
        {final ? (
          <Button onPress={() => navigation.navigate({ to: redirectTo })}>
            {localization.returnToApplication}
          </Button>
        ) : null}
        {!final && step !== "approval" ? (
          <Description>{authLocalization.auth.signIn}</Description>
        ) : null}
      </Card.Content>
    </Card>
  )
}
