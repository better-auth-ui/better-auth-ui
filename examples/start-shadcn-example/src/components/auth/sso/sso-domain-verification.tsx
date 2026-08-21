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
import type { BetterFetchError } from "better-auth/client"
import { CheckIcon, CopyIcon } from "lucide-react"
import { type FormEvent, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput
} from "@/components/ui/input-group"
import { Spinner } from "@/components/ui/spinner"
import { ssoPlugin } from "@/lib/auth/sso-plugin"
import { cn } from "@/lib/utils"

export type SsoDomainVerificationProps = {
  className?: string
  defaultProviderId?: string
  defaultToken?: string
  tokenPrefix?: string
}

const getErrorMessage = (error: Error | null) => {
  const authError = error as BetterFetchError | null
  return authError?.error?.message ?? authError?.message
}

/** DNS token renewal and verification for an existing SSO provider. */
export function SsoDomainVerification({
  className,
  defaultProviderId = "",
  defaultToken = "",
  tokenPrefix = "better-auth-token"
}: SsoDomainVerificationProps) {
  const { authClient } = useAuth()
  const { localization } = useAuthPlugin(ssoPlugin)
  const [providerId, setProviderId] = useState(defaultProviderId)
  const [token, setToken] = useState(defaultToken)
  const [verified, setVerified] = useState(false)
  const [copyError, setCopyError] = useState("")
  const requestToken = useRequestSsoDomainVerification(
    authClient as SsoAuthClient,
    {
      onSuccess: (data) => setToken(data.domainVerificationToken)
    }
  )
  const verify = useVerifySsoDomain(authClient as SsoAuthClient, {
    onSuccess: () => setVerified(true)
  })
  const host = providerId ? `_${tokenPrefix}-${providerId}` : ""
  const hostCopy = useCopyToClipboard({
    onError: (error) =>
      setCopyError(error instanceof Error ? error.message : String(error))
  })
  const tokenCopy = useCopyToClipboard({
    onError: (error) =>
      setCopyError(error instanceof Error ? error.message : String(error))
  })
  const error = requestToken.error ?? verify.error

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setVerified(false)
    verify.mutate({ providerId })
  }

  return (
    <Card className={cn("w-full max-w-xl", className)}>
      <CardHeader>
        <CardTitle>{localization.domainVerification}</CardTitle>
        <CardDescription>
          {localization.domainVerificationDescription}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="sso-verification-provider-id">
                {localization.providerId}
              </FieldLabel>
              <Input
                id="sso-verification-provider-id"
                name="providerId"
                value={providerId}
                onChange={(event) => {
                  setProviderId(event.target.value.trim())
                  setVerified(false)
                }}
                required
              />
            </Field>

            {token ? (
              <div className="grid gap-3 rounded-lg border p-3">
                <Field>
                  <FieldLabel htmlFor="sso-dns-host">
                    {localization.txtRecordHost}
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      className="font-mono text-xs"
                      id="sso-dns-host"
                      readOnly
                      value={host}
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        aria-label={localization.copyDnsHost}
                        size="icon-xs"
                        onClick={() => {
                          setCopyError("")
                          void hostCopy.copy(host)
                        }}
                      >
                        {hostCopy.copied ? <CheckIcon /> : <CopyIcon />}
                      </InputGroupButton>
                    </InputGroupAddon>
                  </InputGroup>
                </Field>
                <Field>
                  <FieldLabel htmlFor="sso-dns-value">
                    {localization.txtRecordValue}
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      className="font-mono text-xs"
                      id="sso-dns-value"
                      readOnly
                      value={token}
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        aria-label={localization.copyDnsValue}
                        size="icon-xs"
                        onClick={() => {
                          setCopyError("")
                          void tokenCopy.copy(token)
                        }}
                      >
                        {tokenCopy.copied ? <CheckIcon /> : <CopyIcon />}
                      </InputGroupButton>
                    </InputGroupAddon>
                  </InputGroup>
                </Field>
              </div>
            ) : null}

            {error ? <FieldError>{getErrorMessage(error)}</FieldError> : null}
            {copyError ? <FieldError>{copyError}</FieldError> : null}
            {verified ? (
              <FieldDescription role="status" className="text-foreground">
                {localization.domainVerified}
              </FieldDescription>
            ) : null}

            <div className="flex flex-wrap justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={!providerId || verify.isPending}
                onClick={() => {
                  setVerified(false)
                  requestToken.mutate({ providerId })
                }}
              >
                {requestToken.isPending ? (
                  <Spinner data-icon="inline-start" />
                ) : null}
                {localization.requestNewToken}
              </Button>
              <Button
                type="submit"
                disabled={!providerId || requestToken.isPending}
              >
                {verify.isPending ? <Spinner data-icon="inline-start" /> : null}
                {localization.verifyDomain}
              </Button>
            </div>

            {token && !verified ? (
              <span className="sr-only" aria-live="polite">
                {localization.domainVerificationRequested}
              </span>
            ) : null}
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
