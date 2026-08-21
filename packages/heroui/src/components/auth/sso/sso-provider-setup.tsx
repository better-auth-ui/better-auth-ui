"use client"

import type {
  RegisterSsoProviderData,
  RegisterSsoProviderParams,
  SsoAuthClient
} from "@better-auth-ui/core/plugins/sso"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useRegisterSsoProvider } from "@better-auth-ui/react/plugins/sso"
import {
  Alert,
  Button,
  Card,
  type CardProps,
  cn,
  FieldError,
  Form,
  Input,
  Label,
  Spinner,
  Tabs,
  TextArea,
  TextField
} from "@heroui/react"
import type { BetterFetchError } from "better-auth/client"
import { type FormEvent, useState } from "react"

import { ssoPlugin } from "../../../lib/auth/sso-plugin"

type SsoProtocol = "oidc" | "saml"

export type SsoProviderSetupProps = {
  defaultOrganizationId?: string
  onRegistered?: (provider: RegisterSsoProviderData) => void
} & Omit<CardProps, "children">

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
  onRegistered,
  variant,
  ...props
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
    const providerId = readString(formData, "providerId")
    const issuer = readString(formData, "issuer")
    const domain = readString(formData, "domain")
    const organizationId = readString(formData, "organizationId") || undefined
    const common = { providerId, issuer, domain, organizationId }
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
    <Card className={cn(className)} variant={variant} {...props}>
      <Card.Header>
        <Card.Title>{localization.providerSetup}</Card.Title>
        <Card.Description>
          {localization.providerSetupDescription}
        </Card.Description>
      </Card.Header>
      <Card.Content>
        <Form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <Tabs
            selectedKey={protocol}
            onSelectionChange={(key) => setProtocol(String(key) as SsoProtocol)}
            variant="secondary"
          >
            <Tabs.ListContainer>
              <Tabs.List aria-label={localization.providerSetup}>
                <Tabs.Tab id="oidc">
                  {localization.oidc}
                  <Tabs.Indicator />
                </Tabs.Tab>
                <Tabs.Tab id="saml">
                  {localization.saml}
                  <Tabs.Indicator />
                </Tabs.Tab>
              </Tabs.List>
            </Tabs.ListContainer>
          </Tabs>

          <div className="grid gap-4 sm:grid-cols-2">
            <TextField isRequired name="providerId">
              <Label>{localization.providerId}</Label>
              <Input variant="secondary" />
              <FieldError />
            </TextField>
            <TextField isRequired name="domain">
              <Label>{localization.domain}</Label>
              <Input placeholder="example.com" variant="secondary" />
              <FieldError />
            </TextField>
          </div>

          <TextField isRequired name="issuer">
            <Label>{localization.issuer}</Label>
            <Input
              placeholder="https://idp.example.com"
              type="url"
              variant="secondary"
            />
            <FieldError />
          </TextField>

          <TextField defaultValue={defaultOrganizationId} name="organizationId">
            <Label>{localization.organizationId}</Label>
            <Input variant="secondary" />
            <FieldError />
          </TextField>

          {protocol === "oidc" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField isRequired name="clientId">
                <Label>{localization.clientId}</Label>
                <Input autoComplete="off" variant="secondary" />
                <FieldError />
              </TextField>
              <TextField isRequired name="clientSecret">
                <Label>{localization.clientSecret}</Label>
                <Input
                  autoComplete="new-password"
                  type="password"
                  variant="secondary"
                />
                <FieldError />
              </TextField>
            </div>
          ) : (
            <>
              <TextField isRequired name="entryPoint">
                <Label>{localization.entryPoint}</Label>
                <Input type="url" variant="secondary" />
                <FieldError />
              </TextField>
              <TextField isRequired name="identityProviderMetadata">
                <Label>{localization.identityProviderMetadata}</Label>
                <TextArea
                  className="font-mono text-xs"
                  rows={8}
                  variant="secondary"
                />
                <FieldError />
              </TextField>
            </>
          )}

          {register.error ? (
            <Alert status="danger">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Description>
                  {getErrorMessage(register.error)}
                </Alert.Description>
              </Alert.Content>
            </Alert>
          ) : null}
          {created ? (
            <Alert status="success">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Description>
                  {localization.providerCreated}
                </Alert.Description>
              </Alert.Content>
            </Alert>
          ) : null}

          <Button
            className="self-end"
            isPending={register.isPending}
            type="submit"
          >
            {register.isPending ? <Spinner color="current" size="sm" /> : null}
            {localization.addProvider}
          </Button>
        </Form>
      </Card.Content>
    </Card>
  )
}
