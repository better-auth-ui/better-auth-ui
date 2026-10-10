import { validateStringLength } from "@better-auth-ui/core"
import {
  parseTwoFactorMethods,
  type TwoFactorAuthClient,
  type TwoFactorMethod
} from "@better-auth-ui/core/plugins/two-factor"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import {
  useSendTwoFactorOtp,
  useVerifyBackupCode,
  useVerifyTotp,
  useVerifyTwoFactorOtp
} from "@better-auth-ui/react/plugins/two-factor"
import { useState } from "react"
import { useSignInContinuation } from "../../../lib/auth/use-sign-in-continuation"
import { twoFactorPlugin } from "../../../lib/auth/two-factor-plugin"
import { useResendCooldown } from "../../../lib/auth/use-resend-cooldown"
import { useAuthNavigation } from "../../../navigation/navigation-context"
import { Button } from "../../../primitives/button"
import { Card } from "../../../primitives/card"
import { Checkbox } from "../../../primitives/checkbox"
import { Description } from "../../../primitives/description"
import { Link } from "../../../primitives/link"
import type { AuthViewProps } from "../../../lib/auth-plugin"
import { useAuthForm, clearAuthFormServerError } from "../auth-form"

export function TwoFactorChallenge(props: AuthViewProps) {
  const { authClient } = useAuth()
  const { localization, codeLength, backupCodes, trustDevice } =
    useAuthPlugin(twoFactorPlugin)
  const navigation = useAuthNavigation()
  const configured = parseTwoFactorMethods(
    navigation.getParam("methods")?.split(",")
  )
  const methods: TwoFactorMethod[] = configured.length
    ? configured
    : ["totp", "otp"]
  const [method, setMethod] = useState<TwoFactorMethod | "backup">(
    methods[0] ?? "totp"
  )
  const [requested, setRequested] = useState(false)
  const cooldown = useResendCooldown()
  const client = authClient as TwoFactorAuthClient
  const onSuccess = useSignInContinuation()
  const totp = useVerifyTotp(client, { onSuccess })
  const otp = useVerifyTwoFactorOtp(client, { onSuccess })
  const backup = useVerifyBackupCode(client, { onSuccess })
  const send = useSendTwoFactorOtp(client, {
    onSuccess: () => {
      setRequested(true)
      cooldown.startCooldown()
    }
  })
  const pending =
    totp.isPending || otp.isPending || backup.isPending || send.isPending
  const form = useAuthForm({
    defaultValues: { code: "", trustDevice: false },
    onSubmit: async ({ value }) => {
      const params = {
        code: value.code.trim(),
        ...(trustDevice ? { trustDevice: value.trustDevice } : {})
      }
      try {
        if (method === "backup") await backup.mutateAsync(params)
        else if (method === "otp") await otp.mutateAsync(params)
        else await totp.mutateAsync(params)
      } catch (error) {
        form.setFieldValue("code", "")
        throw error
      }
    }
  })
  return (
    <Card className={props.className} variant={props.variant}>
      <Card.Header>
        <Card.Title>{localization.twoFactor}</Card.Title>
      </Card.Header>
      <Card.Content className="gap-4">
        <Description>
          {method === "backup"
            ? localization.backupCodeDescription
            : method === "otp"
              ? localization.emailedCodeDescription
              : localization.authenticatorCodeDescription}
        </Description>
        <form.AppForm>
          <form.AuthFormRoot className="gap-4">
            <form.AppField
              name="code"
              validators={{
                onChange: ({ value }) =>
                  validateStringLength(value.trim(), {
                    requiredMessage: localization.codeLengthMismatch.replace(
                      "{{length}}",
                      String(codeLength)
                    ),
                    ...(method !== "backup"
                      ? {
                          minLength: codeLength,
                          maxLength: codeLength,
                          minLengthMessage:
                            localization.codeLengthMismatch.replace(
                              "{{length}}",
                              String(codeLength)
                            ),
                          maxLengthMessage:
                            localization.codeLengthMismatch.replace(
                              "{{length}}",
                              String(codeLength)
                            )
                        }
                      : {})
                  })
              }}
            >
              {(field) => (
                <field.AuthFormTextField
                  label={
                    method === "backup"
                      ? localization.backupCode
                      : method === "otp"
                        ? localization.emailedCode
                        : localization.authenticatorCode
                  }
                  isDisabled={pending}
                  inputProps={{
                    autoCapitalize: "none",
                    autoComplete: "one-time-code",
                    keyboardType: method === "backup" ? "default" : "number-pad"
                  }}
                />
              )}
            </form.AppField>
            {trustDevice ? (
              <form.AppField name="trustDevice">
                {(field) => (
                  <Checkbox
                    isSelected={field.state.value}
                    onChange={field.handleChange}
                    isDisabled={pending}
                  >
                    {localization.trustDevice}
                  </Checkbox>
                )}
              </form.AppField>
            ) : null}
            {method === "otp" ? (
              <Button
                isPending={send.isPending}
                isDisabled={pending || cooldown.isCoolingDown}
                onPress={() => send.mutate({})}
              >
                {localization.sendEmailCode}
                {cooldown.isCoolingDown ? ` (${cooldown.cooldown})` : ""}
              </Button>
            ) : null}
            <form.AuthFormSubmitButton
              isPending={pending}
              isDisabled={method === "otp" && !requested}
            >
              {localization.verify}
            </form.AuthFormSubmitButton>
          </form.AuthFormRoot>
        </form.AppForm>
        {[...methods, ...(backupCodes ? ["backup" as const] : [])]
          .filter((item) => item !== method)
          .map((item) => (
            <Button
              key={item}
              variant="ghost"
              isDisabled={pending}
              onPress={() => {
                form.reset()
                clearAuthFormServerError(form)
                setMethod(item)
              }}
            >
              {item === "backup"
                ? localization.useBackupCode
                : item === "otp"
                  ? localization.useEmailedCode
                  : localization.useAuthenticator}
            </Button>
          ))}
      </Card.Content>
      <Card.Footer>
        <Link view="signIn">{localization.backToSignIn}</Link>
      </Card.Footer>
    </Card>
  )
}
