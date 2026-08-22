import type {
  RegisterSsoProviderData,
  RegisterSsoProviderParams,
  SsoAuthClient
} from "@better-auth-ui/core/plugins/sso"
import { useAuth, useAuthPlugin } from "@better-auth-ui/solid"
import { useRegisterSsoProvider } from "@better-auth-ui/solid/plugins/sso"
import type { BetterFetchError } from "better-auth/client"
import { createSignal, Show } from "solid-js"

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
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { ssoPlugin } from "@/lib/auth/sso-plugin"
import { cn } from "@/lib/utils"

type SsoProtocol = "oidc" | "saml"

export type SsoProviderSetupProps = {
  class?: string
  defaultOrganizationId?: string
  organizationId?: string
  onRegistered?: (provider: RegisterSsoProviderData) => void
}

const readString = (formData: FormData, name: string) =>
  String(formData.get(name) ?? "").trim()

const getErrorMessage = (error: Error | null | undefined) => {
  const authError = error as BetterFetchError | null | undefined
  return authError?.error?.message ?? authError?.message
}

export function SsoProviderSetup(props: SsoProviderSetupProps) {
  const auth = useAuth()
  const { localization } = useAuthPlugin(ssoPlugin)
  const [protocol, setProtocol] = createSignal<SsoProtocol>("oidc")
  const [created, setCreated] = createSignal(false)
  const register = useRegisterSsoProvider(auth.authClient as SsoAuthClient)

  const submit = (event: SubmitEvent) => {
    event.preventDefault()
    setCreated(false)
    const formData = new FormData(event.currentTarget as HTMLFormElement)
    const common = {
      providerId: readString(formData, "providerId"),
      issuer: readString(formData, "issuer"),
      domain: readString(formData, "domain"),
      organizationId:
        props.organizationId ||
        readString(formData, "organizationId") ||
        undefined
    }
    const params =
      protocol() === "oidc"
        ? {
            ...common,
            oidcConfig: {
              clientId: readString(formData, "clientId"),
              clientSecret: readString(formData, "clientSecret")
            }
          }
        : {
            ...common,
            samlConfig: {
              entryPoint: readString(formData, "entryPoint"),
              idpMetadata: {
                metadata: readString(formData, "identityProviderMetadata")
              }
            }
          }

    register.mutate(params as RegisterSsoProviderParams<SsoAuthClient>, {
      onSuccess: (provider) => {
        setCreated(true)
        props.onRegistered?.(provider)
      }
    })
  }

  return (
    <form class={cn("w-full max-w-xl", props.class)} onSubmit={submit}>
      <Card>
        <CardHeader>
          <CardTitle>{localization.providerSetup}</CardTitle>
          <CardDescription>
            {localization.providerSetupDescription}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <div class="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel for="solid-sso-provider-id">
                  {localization.providerId}
                </FieldLabel>
                <Input id="solid-sso-provider-id" name="providerId" required />
              </Field>
              <Field>
                <FieldLabel for="solid-sso-domain">
                  {localization.domain}
                </FieldLabel>
                <Input
                  id="solid-sso-domain"
                  name="domain"
                  placeholder="example.com"
                  required
                />
              </Field>
            </div>
            <Field>
              <FieldLabel for="solid-sso-issuer">
                {localization.issuer}
              </FieldLabel>
              <Input
                id="solid-sso-issuer"
                name="issuer"
                placeholder="https://idp.example.com"
                required
                type="url"
              />
            </Field>
            <Show when={!props.organizationId}>
              <Field>
                <FieldLabel for="solid-sso-organization-id">
                  {localization.organizationId}
                </FieldLabel>
                <Input
                  id="solid-sso-organization-id"
                  name="organizationId"
                  value={props.defaultOrganizationId ?? ""}
                />
              </Field>
            </Show>
            <Tabs
              value={protocol()}
              onChange={(value) => setProtocol(value as SsoProtocol)}
            >
              <TabsList aria-label={localization.providerSetup}>
                <TabsTrigger value="oidc">{localization.oidc}</TabsTrigger>
                <TabsTrigger value="saml">{localization.saml}</TabsTrigger>
              </TabsList>
              <TabsContent class="grid gap-4 sm:grid-cols-2" value="oidc">
                <Field>
                  <FieldLabel for="solid-sso-client-id">
                    {localization.clientId}
                  </FieldLabel>
                  <Input
                    autocomplete="off"
                    id="solid-sso-client-id"
                    name="clientId"
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel for="solid-sso-client-secret">
                    {localization.clientSecret}
                  </FieldLabel>
                  <Input
                    autocomplete="new-password"
                    id="solid-sso-client-secret"
                    name="clientSecret"
                    required
                    type="password"
                  />
                </Field>
              </TabsContent>
              <TabsContent class="flex flex-col gap-4" value="saml">
                <Field>
                  <FieldLabel for="solid-sso-entry-point">
                    {localization.entryPoint}
                  </FieldLabel>
                  <Input
                    id="solid-sso-entry-point"
                    name="entryPoint"
                    required
                    type="url"
                  />
                </Field>
                <Field>
                  <FieldLabel for="solid-sso-idp-metadata">
                    {localization.identityProviderMetadata}
                  </FieldLabel>
                  <Textarea
                    class="min-h-40 font-mono text-xs"
                    id="solid-sso-idp-metadata"
                    name="identityProviderMetadata"
                    required
                  />
                </Field>
              </TabsContent>
            </Tabs>
            <FieldError>{getErrorMessage(register.error)}</FieldError>
            <Show when={created()}>
              <FieldDescription role="status">
                {localization.providerCreated}
              </FieldDescription>
            </Show>
          </FieldGroup>
        </CardContent>
        <CardFooter class="justify-end">
          <Button disabled={register.isPending} type="submit">
            <Show when={register.isPending}>
              <Spinner />
            </Show>
            {localization.addProvider}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
