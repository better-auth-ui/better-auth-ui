"use client"

import { validateAbsoluteUrl, validateStringLength } from "@better-auth-ui/core"
import type {
  RegisterSsoProviderData,
  RegisterSsoProviderParams,
  SsoAuthClient
} from "@better-auth-ui/core/plugins/sso"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useRegisterSsoProvider } from "@better-auth-ui/react/plugins/sso"
import type { BetterFetchError } from "better-auth/client"
import { useState } from "react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { ssoPlugin } from "@/lib/auth/sso-plugin"
import { cn } from "@/lib/utils"
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
  className?: string
  defaultOrganizationId?: string
  organizationId?: string
  onRegistered?: (provider: RegisterSsoProviderData) => void
}

const getErrorMessage = (error: Error | null) => {
  const authError = error as BetterFetchError | null
  return authError?.error?.message ?? authError?.message
}

/** Self-service form for registering an OIDC or SAML SSO provider. */
export function SsoProviderSetup({
  className,
  defaultOrganizationId,
  organizationId: fixedOrganizationId,
  onRegistered
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
    <form.AppForm>
      <form.AuthFormRoot className={cn("w-full max-w-xl", className)}>
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
                    <Field
                      data-invalid={isAuthFormFieldInvalid(field.state.meta)}
                    >
                      <FieldLabel htmlFor="sso-provider-id">
                        {localization.providerId}
                      </FieldLabel>
                      <Input
                        id="sso-provider-id"
                        name={field.name}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        required
                        value={field.state.value}
                        aria-invalid={isAuthFormFieldInvalid(field.state.meta)}
                      />
                      <field.AuthFormFieldError />
                    </Field>
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
                    <Field
                      data-invalid={isAuthFormFieldInvalid(field.state.meta)}
                    >
                      <FieldLabel htmlFor="sso-domain">
                        {localization.domain}
                      </FieldLabel>
                      <Input
                        id="sso-domain"
                        name={field.name}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        placeholder="example.com"
                        required
                        value={field.state.value}
                        aria-invalid={isAuthFormFieldInvalid(field.state.meta)}
                      />
                      <field.AuthFormFieldError />
                    </Field>
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
                  <Field
                    data-invalid={isAuthFormFieldInvalid(field.state.meta)}
                  >
                    <FieldLabel htmlFor="sso-issuer">
                      {localization.issuer}
                    </FieldLabel>
                    <Input
                      id="sso-issuer"
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      placeholder="https://idp.example.com"
                      required
                      type="url"
                      value={field.state.value}
                      aria-invalid={isAuthFormFieldInvalid(field.state.meta)}
                    />
                    <field.AuthFormFieldError />
                  </Field>
                )}
              </form.AppField>

              {!fixedOrganizationId ? (
                <form.Field name="organizationId">
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor="sso-organization-id">
                        {localization.organizationId}
                      </FieldLabel>
                      <Input
                        id="sso-organization-id"
                        name={field.name}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        value={field.state.value}
                      />
                    </Field>
                  )}
                </form.Field>
              ) : null}

              <form.Field name="protocol">
                {(protocolField) => (
                  <Tabs
                    value={protocolField.state.value}
                    onValueChange={(value) =>
                      protocolField.handleChange(value as SsoProtocol)
                    }
                  >
                    <TabsList aria-label={localization.providerSetup}>
                      <TabsTrigger value="oidc">
                        {localization.oidc}
                      </TabsTrigger>
                      <TabsTrigger value="saml">
                        {localization.saml}
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent
                      className="grid gap-4 sm:grid-cols-2"
                      value="oidc"
                    >
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
                          <Field
                            data-invalid={isAuthFormFieldInvalid(
                              field.state.meta
                            )}
                          >
                            <FieldLabel htmlFor="sso-client-id">
                              {localization.clientId}
                            </FieldLabel>
                            <Input
                              autoComplete="off"
                              id="sso-client-id"
                              name={field.name}
                              onBlur={field.handleBlur}
                              onChange={(event) =>
                                field.handleChange(event.target.value)
                              }
                              required
                              value={field.state.value}
                              aria-invalid={isAuthFormFieldInvalid(
                                field.state.meta
                              )}
                            />
                            <field.AuthFormFieldError />
                          </Field>
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
                          <Field
                            data-invalid={isAuthFormFieldInvalid(
                              field.state.meta
                            )}
                          >
                            <FieldLabel htmlFor="sso-client-secret">
                              {localization.clientSecret}
                            </FieldLabel>
                            <Input
                              autoComplete="new-password"
                              id="sso-client-secret"
                              name={field.name}
                              onBlur={field.handleBlur}
                              onChange={(event) =>
                                field.handleChange(event.target.value)
                              }
                              required
                              type="password"
                              value={field.state.value}
                              aria-invalid={isAuthFormFieldInvalid(
                                field.state.meta
                              )}
                            />
                            <field.AuthFormFieldError />
                          </Field>
                        )}
                      </form.AppField>
                    </TabsContent>
                    <TabsContent className="flex flex-col gap-4" value="saml">
                      <form.AppField
                        name="entryPoint"
                        validators={{
                          onChange: ({ value }) =>
                            validateAbsoluteUrl(value, {
                              invalidMessage: localization.invalidUrl,
                              requiredMessage:
                                authLocalization.auth.fieldRequired
                            })
                        }}
                      >
                        {(field) => (
                          <Field
                            data-invalid={isAuthFormFieldInvalid(
                              field.state.meta
                            )}
                          >
                            <FieldLabel htmlFor="sso-entry-point">
                              {localization.entryPoint}
                            </FieldLabel>
                            <Input
                              id="sso-entry-point"
                              name={field.name}
                              onBlur={field.handleBlur}
                              onChange={(event) =>
                                field.handleChange(event.target.value)
                              }
                              required
                              type="url"
                              value={field.state.value}
                              aria-invalid={isAuthFormFieldInvalid(
                                field.state.meta
                              )}
                            />
                            <field.AuthFormFieldError />
                          </Field>
                        )}
                      </form.AppField>
                      <form.AppField
                        name="identityProviderMetadata"
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
                          <Field
                            data-invalid={isAuthFormFieldInvalid(
                              field.state.meta
                            )}
                          >
                            <FieldLabel htmlFor="sso-idp-metadata">
                              {localization.identityProviderMetadata}
                            </FieldLabel>
                            <Textarea
                              className="min-h-40 font-mono text-xs"
                              id="sso-idp-metadata"
                              name={field.name}
                              onBlur={field.handleBlur}
                              onChange={(event) =>
                                field.handleChange(event.target.value)
                              }
                              required
                              value={field.state.value}
                              aria-invalid={isAuthFormFieldInvalid(
                                field.state.meta
                              )}
                            />
                            <field.AuthFormFieldError />
                          </Field>
                        )}
                      </form.AppField>
                    </TabsContent>
                  </Tabs>
                )}
              </form.Field>

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
            <form.AuthFormSubmitButton disabled={register.isPending}>
              {localization.addProvider}
            </form.AuthFormSubmitButton>
          </CardFooter>
        </Card>
      </form.AuthFormRoot>
    </form.AppForm>
  )
}
