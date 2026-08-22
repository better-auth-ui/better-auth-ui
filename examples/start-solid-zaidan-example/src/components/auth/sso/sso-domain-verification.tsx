import type { SsoAuthClient } from "@better-auth-ui/core/plugins/sso"
import {
  createCopyToClipboard,
  useAuth,
  useAuthPlugin
} from "@better-auth-ui/solid"
import {
  useRequestSsoDomainVerification,
  useVerifySsoDomain
} from "@better-auth-ui/solid/plugins/sso"
import type { BetterFetchError } from "better-auth/client"
import { Check, Copy } from "lucide-solid"
import { createSignal, Show } from "solid-js"

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
  InputGroupButton,
  InputGroupInput
} from "@/components/ui/input-group"
import { Spinner } from "@/components/ui/spinner"
import { ssoPlugin } from "@/lib/auth/sso-plugin"
import { cn } from "@/lib/utils"

export type SsoDomainVerificationProps = {
  class?: string
  defaultProviderId?: string
  defaultToken?: string
  tokenPrefix?: string
}

const getErrorMessage = (error: Error | null | undefined) => {
  const authError = error as BetterFetchError | null | undefined
  return authError?.error?.message ?? authError?.message
}

export function SsoDomainVerification(props: SsoDomainVerificationProps) {
  const auth = useAuth()
  const { localization } = useAuthPlugin(ssoPlugin)
  const [providerId, setProviderId] = createSignal(
    props.defaultProviderId ?? ""
  )
  const [token, setToken] = createSignal(props.defaultToken ?? "")
  const [verified, setVerified] = createSignal(false)
  const [copyError, setCopyError] = createSignal("")
  const requestToken = useRequestSsoDomainVerification(
    auth.authClient as SsoAuthClient,
    () => ({
      onSuccess: (data) => setToken(data.domainVerificationToken)
    })
  )
  const verify = useVerifySsoDomain(auth.authClient as SsoAuthClient, () => ({
    onSuccess: () => setVerified(true)
  }))
  const host = () =>
    providerId()
      ? `_${props.tokenPrefix ?? "better-auth-token"}-${providerId()}`
      : ""
  const hostCopy = createCopyToClipboard({
    onError: (error) =>
      setCopyError(error instanceof Error ? error.message : String(error))
  })
  const tokenCopy = createCopyToClipboard({
    onError: (error) =>
      setCopyError(error instanceof Error ? error.message : String(error))
  })
  const error = () =>
    requestToken.submittedAt > verify.submittedAt
      ? requestToken.error
      : verify.error

  const submit = (event: SubmitEvent) => {
    event.preventDefault()
    setCopyError("")
    setVerified(false)
    verify.mutate({ providerId: providerId() })
  }

  return (
    <Card class={cn("w-full max-w-xl", props.class)}>
      <CardHeader>
        <CardTitle>{localization.domainVerification}</CardTitle>
        <CardDescription>
          {localization.domainVerificationDescription}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit}>
          <FieldGroup>
            <Field>
              <FieldLabel for="solid-sso-verification-provider-id">
                {localization.providerId}
              </FieldLabel>
              <Input
                id="solid-sso-verification-provider-id"
                name="providerId"
                onInput={(event) => {
                  setProviderId(event.currentTarget.value.trim())
                  setToken("")
                  setVerified(false)
                }}
                required
                value={providerId()}
              />
            </Field>
            <Show when={token()}>
              <div class="grid gap-3 rounded-lg border p-3">
                <Field>
                  <FieldLabel for="solid-sso-dns-host">
                    {localization.txtRecordHost}
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      id="solid-sso-dns-host"
                      readonly
                      value={host()}
                    />
                    <InputGroupButton
                      aria-label={localization.copyDnsHost}
                      onClick={() => {
                        setCopyError("")
                        void hostCopy.copy(host())
                      }}
                      type="button"
                    >
                      <Show fallback={<Copy />} when={hostCopy.copied()}>
                        <Check />
                      </Show>
                    </InputGroupButton>
                  </InputGroup>
                </Field>
                <Field>
                  <FieldLabel for="solid-sso-dns-value">
                    {localization.txtRecordValue}
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      id="solid-sso-dns-value"
                      readonly
                      value={token()}
                    />
                    <InputGroupButton
                      aria-label={localization.copyDnsValue}
                      onClick={() => {
                        setCopyError("")
                        void tokenCopy.copy(token())
                      }}
                      type="button"
                    >
                      <Show fallback={<Copy />} when={tokenCopy.copied()}>
                        <Check />
                      </Show>
                    </InputGroupButton>
                  </InputGroup>
                </Field>
              </div>
            </Show>
            <div class="flex flex-wrap gap-2">
              <Button
                disabled={!providerId() || requestToken.isPending}
                onClick={() => {
                  setCopyError("")
                  setVerified(false)
                  requestToken.mutate({ providerId: providerId() })
                }}
                type="button"
                variant="outline"
              >
                <Show when={requestToken.isPending}>
                  <Spinner />
                </Show>
                {localization.requestNewToken}
              </Button>
              <Button
                disabled={!providerId() || verify.isPending}
                type="submit"
              >
                <Show when={verify.isPending}>
                  <Spinner />
                </Show>
                {localization.verifyDomain}
              </Button>
            </div>
            <Show when={verified()}>
              <FieldDescription role="status">
                {localization.domainVerified}
              </FieldDescription>
            </Show>
            <FieldError>{copyError() || getErrorMessage(error())}</FieldError>
            <span aria-live="polite" class="sr-only">
              {token() && !verified()
                ? localization.domainVerificationRequested
                : ""}
            </span>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
