"use client"

import type {
  RegisterSsoProviderData,
  RegisterSsoProviderParams,
  SsoAuthClient
} from "@better-auth-ui/core/plugins/sso"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useRegisterSsoProvider } from "@better-auth-ui/react/plugins/sso"
import type { BetterFetchError } from "better-auth/client"
import { type FormEvent, useState } from "react"

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
  className?: string
  defaultOrganizationId?: string
  onRegistered?: (provider: RegisterSsoProviderData) => void
}

const readString = (formData: FormData, name: string) =>
  String(formData.get(name) ?? "").trim()

const getErrorMessage = (error: Error | null) => {
  const authError = error as BetterFetchError | null
  return authError?.error?.message ?? authError?.message
}

/** Self-service form for registering an OIDC or SAML SSO provider. */
export function SsoProviderSetup({
  className,
  defaultOrganizationId,
  onRegistered
}: SsoProviderSetupProps) {
  const { authClient } = useAuth()
  const { localization } = useAuthPlugin(ssoPlugin)
  const [protocol, setProtocol] = useState<SsoProtocol>("oidc")
  const [created, setCreated] = useState(false)
  const register = useRegisterSsoProvider(authClient as SsoAuthClient)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setCreated(false)

    const formData = new FormData(event.currentTarget)
    const common = {
      providerId: readString(formData, "providerId"),
      issuer: readString(formData, "issuer"),
      domain: readString(formData, "domain"),
      organizationId: readString(formData, "organizationId") || undefined
    }
    const params =
      protocol === "oidc"
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
        onRegistered?.(provider)
      }
    })
  }

  return (
    <form className={cn("w-full max-w-xl", className)} onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{localization.providerSetup}</CardTitle>
          <CardDescription>
            {localization.providerSetupDescription}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="sso-provider-id">
                  {localization.providerId}
                </FieldLabel>
                <Input id="sso-provider-id" name="providerId" required />
              </Field>
              <Field>
                <FieldLabel htmlFor="sso-domain">
                  {localization.domain}
                </FieldLabel>
                <Input
                  id="sso-domain"
                  name="domain"
                  placeholder="example.com"
                  required
                />
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="sso-issuer">
                {localization.issuer}
              </FieldLabel>
              <Input
                id="sso-issuer"
                name="issuer"
                placeholder="https://idp.example.com"
                type="url"
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="sso-organization-id">
                {localization.organizationId}
              </FieldLabel>
              <Input
                defaultValue={defaultOrganizationId}
                id="sso-organization-id"
                name="organizationId"
              />
            </Field>

            <Tabs
              value={protocol}
              onValueChange={(value) => setProtocol(value as SsoProtocol)}
            >
              <TabsList aria-label={localization.providerSetup}>
                <TabsTrigger value="oidc">{localization.oidc}</TabsTrigger>
                <TabsTrigger value="saml">{localization.saml}</TabsTrigger>
              </TabsList>
              <TabsContent className="grid gap-4 sm:grid-cols-2" value="oidc">
                <Field>
                  <FieldLabel htmlFor="sso-client-id">
                    {localization.clientId}
                  </FieldLabel>
                  <Input
                    autoComplete="off"
                    id="sso-client-id"
                    name="clientId"
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="sso-client-secret">
                    {localization.clientSecret}
                  </FieldLabel>
                  <Input
                    autoComplete="new-password"
                    id="sso-client-secret"
                    name="clientSecret"
                    type="password"
                    required
                  />
                </Field>
              </TabsContent>
              <TabsContent className="flex flex-col gap-4" value="saml">
                <Field>
                  <FieldLabel htmlFor="sso-entry-point">
                    {localization.entryPoint}
                  </FieldLabel>
                  <Input
                    id="sso-entry-point"
                    name="entryPoint"
                    type="url"
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="sso-idp-metadata">
                    {localization.identityProviderMetadata}
                  </FieldLabel>
                  <Textarea
                    className="min-h-40 font-mono text-xs"
                    id="sso-idp-metadata"
                    name="identityProviderMetadata"
                    required
                  />
                </Field>
              </TabsContent>
            </Tabs>

            {register.error ? (
              <FieldError>{getErrorMessage(register.error)}</FieldError>
            ) : null}
            {created ? (
              <FieldDescription role="status" className="text-foreground">
                {localization.providerCreated}
              </FieldDescription>
            ) : null}
          </FieldGroup>
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit" disabled={register.isPending}>
            {register.isPending ? <Spinner data-icon="inline-start" /> : null}
            {localization.addProvider}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
