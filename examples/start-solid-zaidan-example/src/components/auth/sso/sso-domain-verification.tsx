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
import {
  InputGroup,
  InputGroupButton,
  InputGroupInput
} from "@/components/ui/input-group"
import { Spinner } from "@/components/ui/spinner"
import { ssoPlugin } from "@/lib/auth/sso-plugin"
import { cn } from "@/lib/utils"
import { createAuthForm, setAuthFormServerError } from "../auth-form"

export type SsoDomainVerificationProps = {
  class?: string
  defaultProviderId?: string
  defaultToken?: string
  tokenPrefix?: string
}

export function SsoDomainVerification(props: SsoDomainVerificationProps) {
  const auth = useAuth()
  const { localization } = useAuthPlugin(ssoPlugin)
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
  const hostCopy = createCopyToClipboard({
    onError: (error) =>
      setCopyError(error instanceof Error ? error.message : String(error))
  })
  const tokenCopy = createCopyToClipboard({
    onError: (error) =>
      setCopyError(error instanceof Error ? error.message : String(error))
  })
  const form = createAuthForm(() => ({
    defaultValues: { providerId: props.defaultProviderId ?? "" },
    onSubmit: async ({ value }) => {
      setCopyError("")
      setVerified(false)
      await verify.mutateAsync({ providerId: value.providerId.trim() })
    }
  }))
  const providerId = form.useSelector((state) => state.values.providerId)
  const host = () =>
    providerId()
      ? `_${props.tokenPrefix ?? "better-auth-token"}-${providerId()}`
      : ""

  const requestNewToken = async () => {
    setCopyError("")
    setVerified(false)
    try {
      await requestToken.mutateAsync({
        providerId: providerId().trim()
      })
    } catch (error) {
      setAuthFormServerError(
        form,
        error,
        "Unable to request a domain verification token. Try again."
      )
    }
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
        <form.AppForm>
          <form.AuthFormRoot>
            <FieldGroup>
              <form.AppField
                listeners={{
                  onChange: () => {
                    setToken("")
                    setVerified(false)
                  }
                }}
                name="providerId"
                validators={{
                  onChange: ({ value }) =>
                    value.trim()
                      ? undefined
                      : auth.localization.auth.fieldRequired
                }}
              >
                {(field) => (
                  <field.AuthFormTextField
                    id="solid-sso-verification-provider-id"
                    label={localization.providerId}
                  />
                )}
              </form.AppField>
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
                  onClick={() => void requestNewToken()}
                  type="button"
                  variant="outline"
                >
                  <Show when={requestToken.isPending}>
                    <Spinner />
                  </Show>
                  {localization.requestNewToken}
                </Button>
                <form.AuthFormSubmitButton
                  disabled={!providerId() || verify.isPending}
                >
                  {localization.verifyDomain}
                </form.AuthFormSubmitButton>
              </div>
              <Show when={verified()}>
                <FieldDescription role="status">
                  {localization.domainVerified}
                </FieldDescription>
              </Show>
              <FieldError>{copyError()}</FieldError>
              <form.AuthFormServerError />
              <span aria-live="polite" class="sr-only">
                {token() && !verified()
                  ? localization.domainVerificationRequested
                  : ""}
              </span>
            </FieldGroup>
          </form.AuthFormRoot>
        </form.AppForm>
      </CardContent>
    </Card>
  )
}
