"use client"

import { validateAbsoluteUrl, validateStringLength } from "@better-auth-ui/core"
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
import { useState } from "react"
import { ssoPlugin } from "../../../lib/auth/sso-plugin"
import { isAuthFormFieldInvalid, useAuthForm } from "../auth-form"

type SsoProtocol = "oidc" | "saml"

type SsoProviderFormValues = {
  clientId: string
  clientSecret: string
  domain: string
  entryPoint: string
  identityProviderMetadata: string
  issuer: string
  organizationId: string
  protocol: SsoProtocol
  providerId: string
}

export type SsoProviderSetupProps = {
  defaultOrganizationId?: string
  organizationId?: string
  onRegistered?: (provider: RegisterSsoProviderData) => void
} & Omit<CardProps, "children">

const getErrorMessage = (error: Error | null) => {
  const authError = error as BetterFetchError | null
  return authError?.error?.message ?? authError?.message
}

/** Self-service form for registering an OIDC or SAML SSO provider. */
export function SsoProviderSetup({
  className,
  defaultOrganizationId,
  organizationId: fixedOrganizationId,
  onRegistered,
  variant,
  ...props
}: SsoProviderSetupProps) {
  const { authClient, localization: authLocalization } = useAuth()
  const { localization } = useAuthPlugin(ssoPlugin)
  const [created, setCreated] = useState(false)
  const register = useRegisterSsoProvider(authClient as SsoAuthClient)
  const form = useAuthForm({
    defaultValues: {
      clientId: "",
      clientSecret: "",
      domain: "",
      entryPoint: "",
      identityProviderMetadata: "",
      issuer: "",
      organizationId: defaultOrganizationId ?? "",
      protocol: "oidc" as SsoProtocol,
      providerId: ""
    } satisfies SsoProviderFormValues,
    onSubmit: async ({ value }) => {
      setCreated(false)
      const common = {
        providerId: value.providerId.trim(),
        issuer: value.issuer.trim(),
        domain: value.domain.trim(),
        organizationId:
          fixedOrganizationId || value.organizationId.trim() || undefined
      }
      const params =
        value.protocol === "oidc"
          ? {
              ...common,
              oidcConfig: {
                clientId: value.clientId.trim(),
                clientSecret: value.clientSecret.trim()
              }
            }
          : {
              ...common,
              samlConfig: {
                entryPoint: value.entryPoint.trim(),
                idpMetadata: {
                  metadata: value.identityProviderMetadata.trim()
                }
              }
            }

      try {
        const provider = await register.mutateAsync(
          params as RegisterSsoProviderParams<SsoAuthClient>
        )
        setCreated(true)
        onRegistered?.(provider)
      } catch {
        // The mutation exposes its error below the fields.
      }
    }
  })

  return (
    <Card className={cn(className)} variant={variant} {...props}>
      <Card.Header>
        <Card.Title>{localization.providerSetup}</Card.Title>
        <Card.Description>
          {localization.providerSetupDescription}
        </Card.Description>
      </Card.Header>
      <Card.Content>
        <Form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault()
            void form.handleSubmit()
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <form.AppField
              name="providerId"
              validators={{
                onChange: ({ value }) =>
                  validateStringLength(value, {
                    requiredMessage: authLocalization.auth.fieldRequired,
                    trim: true
                  })
              }}
            >
              {(field) => (
                <TextField
                  isInvalid={
                    isAuthFormFieldInvalid(field.state.meta) || undefined
                  }
                  isRequired
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={field.handleChange}
                  value={field.state.value}
                  validationBehavior="aria"
                >
                  <Label>{localization.providerId}</Label>
                  <Input variant="secondary" />
                  <field.AuthFormFieldError />
                </TextField>
              )}
            </form.AppField>
            <form.AppField
              name="domain"
              validators={{
                onChange: ({ value }) =>
                  validateStringLength(value, {
                    requiredMessage: authLocalization.auth.fieldRequired,
                    trim: true
                  })
              }}
            >
              {(field) => (
                <TextField
                  isInvalid={
                    isAuthFormFieldInvalid(field.state.meta) || undefined
                  }
                  isRequired
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={field.handleChange}
                  value={field.state.value}
                  validationBehavior="aria"
                >
                  <Label>{localization.domain}</Label>
                  <Input placeholder="example.com" variant="secondary" />
                  <field.AuthFormFieldError />
                </TextField>
              )}
            </form.AppField>
          </div>

          <form.AppField
            name="issuer"
            validators={{
              onChange: ({ value }) =>
                validateAbsoluteUrl(value, {
                  invalidMessage: localization.invalidUrl,
                  requiredMessage: authLocalization.auth.fieldRequired
                })
            }}
          >
            {(field) => (
              <TextField
                isInvalid={
                  isAuthFormFieldInvalid(field.state.meta) || undefined
                }
                isRequired
                name={field.name}
                onBlur={field.handleBlur}
                onChange={field.handleChange}
                value={field.state.value}
                validationBehavior="aria"
              >
                <Label>{localization.issuer}</Label>
                <Input
                  placeholder="https://idp.example.com"
                  type="url"
                  variant="secondary"
                />
                <field.AuthFormFieldError />
              </TextField>
            )}
          </form.AppField>

          {!fixedOrganizationId ? (
            <form.Field name="organizationId">
              {(field) => (
                <TextField
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={field.handleChange}
                  value={field.state.value}
                >
                  <Label>{localization.organizationId}</Label>
                  <Input variant="secondary" />
                  <FieldError />
                </TextField>
              )}
            </form.Field>
          ) : null}

          <form.Field name="protocol">
            {(protocolField) => (
              <Tabs
                selectedKey={protocolField.state.value}
                onSelectionChange={(key) =>
                  protocolField.handleChange(String(key) as SsoProtocol)
                }
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
                <Tabs.Panel className="pt-4" id="oidc">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <form.AppField
                      name="clientId"
                      validators={{
                        onChange: ({ value }) =>
                          validateStringLength(value, {
                            requiredMessage:
                              authLocalization.auth.fieldRequired,
                            trim: true
                          })
                      }}
                    >
                      {(field) => (
                        <TextField
                          isInvalid={
                            isAuthFormFieldInvalid(field.state.meta) ||
                            undefined
                          }
                          isRequired
                          name={field.name}
                          onBlur={field.handleBlur}
                          onChange={field.handleChange}
                          value={field.state.value}
                          validationBehavior="aria"
                        >
                          <Label>{localization.clientId}</Label>
                          <Input autoComplete="off" variant="secondary" />
                          <field.AuthFormFieldError />
                        </TextField>
                      )}
                    </form.AppField>
                    <form.AppField
                      name="clientSecret"
                      validators={{
                        onChange: ({ value }) =>
                          validateStringLength(value, {
                            requiredMessage:
                              authLocalization.auth.fieldRequired,
                            trim: true
                          })
                      }}
                    >
                      {(field) => (
                        <TextField
                          isInvalid={
                            isAuthFormFieldInvalid(field.state.meta) ||
                            undefined
                          }
                          isRequired
                          name={field.name}
                          onBlur={field.handleBlur}
                          onChange={field.handleChange}
                          value={field.state.value}
                          validationBehavior="aria"
                        >
                          <Label>{localization.clientSecret}</Label>
                          <Input
                            autoComplete="new-password"
                            type="password"
                            variant="secondary"
                          />
                          <field.AuthFormFieldError />
                        </TextField>
                      )}
                    </form.AppField>
                  </div>
                </Tabs.Panel>
                <Tabs.Panel className="flex flex-col gap-4 pt-4" id="saml">
                  <form.AppField
                    name="entryPoint"
                    validators={{
                      onChange: ({ value }) =>
                        validateAbsoluteUrl(value, {
                          invalidMessage: localization.invalidUrl,
                          requiredMessage: authLocalization.auth.fieldRequired
                        })
                    }}
                  >
                    {(field) => (
                      <TextField
                        isInvalid={
                          isAuthFormFieldInvalid(field.state.meta) || undefined
                        }
                        isRequired
                        name={field.name}
                        onBlur={field.handleBlur}
                        onChange={field.handleChange}
                        value={field.state.value}
                        validationBehavior="aria"
                      >
                        <Label>{localization.entryPoint}</Label>
                        <Input type="url" variant="secondary" />
                        <field.AuthFormFieldError />
                      </TextField>
                    )}
                  </form.AppField>
                  <form.AppField
                    name="identityProviderMetadata"
                    validators={{
                      onChange: ({ value }) =>
                        validateStringLength(value, {
                          requiredMessage: authLocalization.auth.fieldRequired,
                          trim: true
                        })
                    }}
                  >
                    {(field) => (
                      <TextField
                        isInvalid={
                          isAuthFormFieldInvalid(field.state.meta) || undefined
                        }
                        isRequired
                        name={field.name}
                        onBlur={field.handleBlur}
                        onChange={field.handleChange}
                        value={field.state.value}
                        validationBehavior="aria"
                      >
                        <Label>{localization.identityProviderMetadata}</Label>
                        <TextArea
                          className="font-mono text-xs"
                          rows={8}
                          variant="secondary"
                        />
                        <field.AuthFormFieldError />
                      </TextField>
                    )}
                  </form.AppField>
                </Tabs.Panel>
              </Tabs>
            )}
          </form.Field>

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

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting] as const}
          >
            {([canSubmit, isSubmitting]) => (
              <Button
                className="self-end"
                isDisabled={!canSubmit}
                isPending={isSubmitting || register.isPending}
                type="submit"
              >
                {isSubmitting || register.isPending ? (
                  <Spinner color="current" size="sm" />
                ) : null}
                {localization.addProvider}
              </Button>
            )}
          </form.Subscribe>
        </Form>
      </Card.Content>
    </Card>
  )
}
