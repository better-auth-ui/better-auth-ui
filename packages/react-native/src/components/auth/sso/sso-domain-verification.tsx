import { validateStringLength } from "@better-auth-ui/core"
import type { SsoAuthClient } from "@better-auth-ui/core/plugins/sso"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import {
  useRequestSsoDomainVerification,
  useVerifySsoDomain
} from "@better-auth-ui/react/plugins/sso"
import { useState } from "react"
import { ssoPlugin } from "../../../lib/auth/sso-plugin"
import type { CardSlotProps } from "../../../lib/auth-plugin"
import { Button } from "../../../primitives/button"
import { Card } from "../../../primitives/card"
import { Description } from "../../../primitives/description"
import { useAuthForm, setAuthFormServerError } from "../auth-form"
import { CopyValue } from "../copy-value"

export function SsoDomainVerification({
  defaultProviderId = "",
  defaultToken = "",
  tokenPrefix = "better-auth-token",
  ...props
}: CardSlotProps & {
  defaultProviderId?: string
  defaultToken?: string
  tokenPrefix?: string
}) {
  const { authClient, localization: common } = useAuth()
  const { localization } = useAuthPlugin(ssoPlugin)
  const [token, setToken] = useState(defaultToken)
  const [verified, setVerified] = useState(false)
  const request = useRequestSsoDomainVerification(authClient as SsoAuthClient)
  const verify = useVerifySsoDomain(authClient as SsoAuthClient)
  const form = useAuthForm({
    defaultValues: { providerId: defaultProviderId },
    onSubmit: async ({ value }) => {
      await verify.mutateAsync({ providerId: value.providerId.trim() })
      setVerified(true)
    }
  })
  return (
    <Card className={props.className} variant={props.variant}>
      <Card.Header>
        <Card.Title>{localization.domainVerification}</Card.Title>
        <Description>{localization.domainVerificationDescription}</Description>
      </Card.Header>
      <Card.Content>
        <form.AppForm>
          <form.AuthFormRoot className="gap-4">
            <form.AppField
              name="providerId"
              validators={{
                onChange: ({ value }) =>
                  validateStringLength(value, {
                    trim: true,
                    requiredMessage: common.auth.fieldRequired
                  })
              }}
              listeners={{
                onChange: () => {
                  setToken("")
                  setVerified(false)
                }
              }}
            >
              {(field) => (
                <>
                  <field.AuthFormTextField
                    label={localization.providerId}
                    isDisabled={request.isPending || verify.isPending}
                  />
                  {token ? (
                    <>
                      <CopyValue
                        value={`_${tokenPrefix}-${field.state.value.trim()}`}
                        label={localization.copyDnsHost}
                      />
                      <CopyValue
                        value={token}
                        label={localization.copyDnsValue}
                      />
                    </>
                  ) : null}
                </>
              )}
            </form.AppField>
            <Button
              isPending={request.isPending}
              isDisabled={verify.isPending}
              onPress={() => {
                const providerId = form.state.values.providerId.trim()
                if (!providerId) {
                  setAuthFormServerError(
                    form,
                    common.auth.fieldRequired,
                    common.auth.fieldRequired
                  )
                  return
                }
                request.mutate(
                  { providerId },
                  {
                    onSuccess: (result) => {
                      setToken(result.domainVerificationToken)
                      setVerified(false)
                    },
                    onError: (error) =>
                      setAuthFormServerError(
                        form,
                        error,
                        localization.providerLoadError
                      )
                  }
                )
              }}
            >
              {localization.requestNewToken}
            </Button>
            <form.AuthFormSubmitButton
              isPending={verify.isPending}
              isDisabled={request.isPending}
            >
              {localization.verifyDomain}
            </form.AuthFormSubmitButton>
            {verified ? (
              <Description>{localization.domainVerified}</Description>
            ) : null}
          </form.AuthFormRoot>
        </form.AppForm>
      </Card.Content>
    </Card>
  )
}
