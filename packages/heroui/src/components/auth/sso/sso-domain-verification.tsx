"use client"

import type { SsoAuthClient } from "@better-auth-ui/core/plugins/sso"
import {
  useAuth,
  useAuthPlugin,
  useCopyToClipboard
} from "@better-auth-ui/react"
import {
  useRequestSsoDomainVerification,
  useVerifySsoDomain
} from "@better-auth-ui/react/plugins/sso"
import { Check, Copy } from "@gravity-ui/icons"
import {
  Alert,
  Button,
  Card,
  type CardProps,
  cn,
  FieldError,
  Input,
  InputGroup,
  Label,
  Spinner,
  TextField,
  toast
} from "@heroui/react"
import type { BetterFetchError } from "better-auth/client"
import { useState } from "react"

import { ssoPlugin } from "../../../lib/auth/sso-plugin"
import { useAuthForm } from "../auth-form"

export type SsoDomainVerificationProps = {
  defaultProviderId?: string
  defaultToken?: string
  tokenPrefix?: string
} & Omit<CardProps, "children">

const getErrorMessage = (error: Error | null) => {
  const authError = error as BetterFetchError | null
  return authError?.error?.message ?? authError?.message
}

/** DNS token renewal and verification for an existing SSO provider. */
export function SsoDomainVerification({
  className,
  defaultProviderId = "",
  defaultToken = "",
  tokenPrefix = "better-auth-token",
  variant,
  ...props
}: SsoDomainVerificationProps) {
  const { authClient } = useAuth()
  const { localization } = useAuthPlugin(ssoPlugin)
  const [token, setToken] = useState(defaultToken)
  const [verified, setVerified] = useState(false)
  const requestToken = useRequestSsoDomainVerification(
    authClient as SsoAuthClient,
    {
      onSuccess: (data) => setToken(data.domainVerificationToken)
    }
  )
  const verify = useVerifySsoDomain(authClient as SsoAuthClient, {
    onSuccess: () => setVerified(true)
  })
  const form = useAuthForm({
    defaultValues: { providerId: defaultProviderId },
    onSubmit: ({ value }) => {
      setVerified(false)
      verify.mutate({ providerId: value.providerId })
    }
  })
  const providerId = form.state.values.providerId
  const host = providerId ? `_${tokenPrefix}-${providerId}` : ""
  const hostCopy = useCopyToClipboard({
    onError: (error) =>
      toast.danger(error instanceof Error ? error.message : String(error))
  })
  const tokenCopy = useCopyToClipboard({
    onError: (error) =>
      toast.danger(error instanceof Error ? error.message : String(error))
  })
  const error =
    requestToken.submittedAt > verify.submittedAt
      ? requestToken.error
      : verify.error

  return (
    <Card className={cn(className)} variant={variant} {...props}>
      <Card.Header>
        <Card.Title>{localization.domainVerification}</Card.Title>
        <Card.Description>
          {localization.domainVerificationDescription}
        </Card.Description>
      </Card.Header>
      <Card.Content>
        <form.AppForm>
          <form.AuthFormRoot className="flex flex-col gap-4">
            <form.AppField name="providerId">
              {(field) => (
                <TextField
                  isRequired
                  name={field.name}
                  onChange={(value) => {
                    field.handleChange(value.trim())
                    setToken("")
                    setVerified(false)
                  }}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                >
                  <Label>{localization.providerId}</Label>
                  <Input variant="secondary" />
                  <FieldError />
                </TextField>
              )}
            </form.AppField>

            {token ? (
              <div className="grid gap-3 rounded-lg border p-3">
                <TextField isReadOnly value={host}>
                  <Label>{localization.txtRecordHost}</Label>
                  <InputGroup variant="secondary">
                    <InputGroup.Input className="font-mono text-xs" />
                    <InputGroup.Suffix className="px-0">
                      <Button
                        aria-label={localization.copyDnsHost}
                        isIconOnly
                        size="sm"
                        variant="ghost"
                        onPress={() => hostCopy.copy(host)}
                      >
                        {hostCopy.copied ? <Check /> : <Copy />}
                      </Button>
                    </InputGroup.Suffix>
                  </InputGroup>
                </TextField>
                <TextField isReadOnly value={token}>
                  <Label>{localization.txtRecordValue}</Label>
                  <InputGroup variant="secondary">
                    <InputGroup.Input className="font-mono text-xs" />
                    <InputGroup.Suffix className="px-0">
                      <Button
                        aria-label={localization.copyDnsValue}
                        isIconOnly
                        size="sm"
                        variant="ghost"
                        onPress={() => tokenCopy.copy(token)}
                      >
                        {tokenCopy.copied ? <Check /> : <Copy />}
                      </Button>
                    </InputGroup.Suffix>
                  </InputGroup>
                </TextField>
              </div>
            ) : null}

            {error ? (
              <Alert status="danger">
                <Alert.Indicator />
                <Alert.Content>
                  <Alert.Description>
                    {getErrorMessage(error)}
                  </Alert.Description>
                </Alert.Content>
              </Alert>
            ) : null}
            {verified ? (
              <Alert status="success">
                <Alert.Indicator />
                <Alert.Content>
                  <Alert.Description>
                    {localization.domainVerified}
                  </Alert.Description>
                </Alert.Content>
              </Alert>
            ) : null}

            <div className="flex flex-wrap justify-end gap-2">
              <Button
                isDisabled={!providerId || verify.isPending}
                isPending={requestToken.isPending}
                type="button"
                variant="outline"
                onPress={() => {
                  setVerified(false)
                  requestToken.mutate({ providerId })
                }}
              >
                {requestToken.isPending ? (
                  <Spinner color="current" size="sm" />
                ) : null}
                {localization.requestNewToken}
              </Button>
              <form.AuthFormSubmitButton
                isDisabled={
                  !providerId || requestToken.isPending || verify.isPending
                }
              >
                {verify.isPending ? (
                  <Spinner color="current" size="sm" />
                ) : null}
                {localization.verifyDomain}
              </form.AuthFormSubmitButton>
            </div>

            <span className="sr-only" aria-live="polite">
              {token && !verified
                ? localization.domainVerificationRequested
                : ""}
            </span>
          </form.AuthFormRoot>
        </form.AppForm>
      </Card.Content>
    </Card>
  )
}
