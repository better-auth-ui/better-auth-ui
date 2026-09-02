import { validateAbsoluteUrl, validateStringLength } from "@better-auth-ui/core"
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
import { createAuthForm, isAuthFormFieldInvalid } from "../auth-form"

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
  class?: string
  defaultOrganizationId?: string
  organizationId?: string
  onRegistered?: (provider: RegisterSsoProviderData) => void
}

const getErrorMessage = (error: Error | null | undefined) => {
  const authError = error as BetterFetchError | null | undefined
  return authError?.error?.message ?? authError?.message
}

export function SsoProviderSetup(props: SsoProviderSetupProps) {
  const auth = useAuth()
  const { localization } = useAuthPlugin(ssoPlugin)
  const [created, setCreated] = createSignal(false)
  const register = useRegisterSsoProvider(auth.authClient as SsoAuthClient)
  const form = createAuthForm(() => ({
    defaultValues: {
      clientId: "",
      clientSecret: "",
      domain: "",
      entryPoint: "",
      identityProviderMetadata: "",
      issuer: "",
      organizationId: props.defaultOrganizationId ?? "",
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
          props.organizationId || value.organizationId.trim() || undefined
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
        props.onRegistered?.(provider)
      } catch {
        // The mutation exposes its error below the fields.
      }
    }
  }))

  return (
    <form
      class={cn("w-full max-w-xl", props.class)}
      onSubmit={(event) => {
        event.preventDefault()
        void form.handleSubmit()
      }}
    >
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
              <form.AppField
                name="providerId"
                validators={{
                  onChange: ({ value }) =>
                    validateStringLength(value, {
                      requiredMessage: auth.localization.auth.fieldRequired,
                      trim: true
                    })
                }}
              >
                {(field) => {
                  const isInvalid = () =>
                    isAuthFormFieldInvalid(field().state.meta)

                  return (
                    <Field data-invalid={isInvalid()}>
                      <FieldLabel for="solid-sso-provider-id">
                        {localization.providerId}
                      </FieldLabel>
                      <Input
                        id="solid-sso-provider-id"
                        name={field().name}
                        onBlur={field().handleBlur}
                        onInput={(event) =>
                          field().handleChange(event.currentTarget.value)
                        }
                        required
                        value={field().state.value}
                        aria-invalid={isInvalid()}
                      />
                      <field.AuthFormFieldError />
                    </Field>
                  )
                }}
              </form.AppField>
              <form.AppField
                name="domain"
                validators={{
                  onChange: ({ value }) =>
                    validateStringLength(value, {
                      requiredMessage: auth.localization.auth.fieldRequired,
                      trim: true
                    })
                }}
              >
                {(field) => {
                  const isInvalid = () =>
                    isAuthFormFieldInvalid(field().state.meta)

                  return (
                    <Field data-invalid={isInvalid()}>
                      <FieldLabel for="solid-sso-domain">
                        {localization.domain}
                      </FieldLabel>
                      <Input
                        id="solid-sso-domain"
                        name={field().name}
                        onBlur={field().handleBlur}
                        onInput={(event) =>
                          field().handleChange(event.currentTarget.value)
                        }
                        placeholder="example.com"
                        required
                        value={field().state.value}
                        aria-invalid={isInvalid()}
                      />
                      <field.AuthFormFieldError />
                    </Field>
                  )
                }}
              </form.AppField>
            </div>
            <form.AppField
              name="issuer"
              validators={{
                onChange: ({ value }) =>
                  validateAbsoluteUrl(value, {
                    invalidMessage: localization.invalidUrl,
                    requiredMessage: auth.localization.auth.fieldRequired
                  })
              }}
            >
              {(field) => {
                const isInvalid = () =>
                  isAuthFormFieldInvalid(field().state.meta)

                return (
                  <Field data-invalid={isInvalid()}>
                    <FieldLabel for="solid-sso-issuer">
                      {localization.issuer}
                    </FieldLabel>
                    <Input
                      id="solid-sso-issuer"
                      name={field().name}
                      onBlur={field().handleBlur}
                      onInput={(event) =>
                        field().handleChange(event.currentTarget.value)
                      }
                      placeholder="https://idp.example.com"
                      required
                      type="url"
                      value={field().state.value}
                      aria-invalid={isInvalid()}
                    />
                    <field.AuthFormFieldError />
                  </Field>
                )
              }}
            </form.AppField>
            <Show when={!props.organizationId}>
              <form.Field name="organizationId">
                {(field) => (
                  <Field>
                    <FieldLabel for="solid-sso-organization-id">
                      {localization.organizationId}
                    </FieldLabel>
                    <Input
                      id="solid-sso-organization-id"
                      name={field().name}
                      onBlur={field().handleBlur}
                      onInput={(event) =>
                        field().handleChange(event.currentTarget.value)
                      }
                      value={field().state.value}
                    />
                  </Field>
                )}
              </form.Field>
            </Show>
            <form.Field name="protocol">
              {(protocolField) => (
                <Tabs
                  value={protocolField().state.value}
                  onChange={(value) =>
                    protocolField().handleChange(value as SsoProtocol)
                  }
                >
                  <TabsList aria-label={localization.providerSetup}>
                    <TabsTrigger value="oidc">{localization.oidc}</TabsTrigger>
                    <TabsTrigger value="saml">{localization.saml}</TabsTrigger>
                  </TabsList>
                  <TabsContent class="grid gap-4 sm:grid-cols-2" value="oidc">
                    <form.AppField
                      name="clientId"
                      validators={{
                        onChange: ({ value }) =>
                          validateStringLength(value, {
                            requiredMessage:
                              auth.localization.auth.fieldRequired,
                            trim: true
                          })
                      }}
                    >
                      {(field) => {
                        const isInvalid = () =>
                          isAuthFormFieldInvalid(field().state.meta)

                        return (
                          <Field data-invalid={isInvalid()}>
                            <FieldLabel for="solid-sso-client-id">
                              {localization.clientId}
                            </FieldLabel>
                            <Input
                              autocomplete="off"
                              id="solid-sso-client-id"
                              name={field().name}
                              onBlur={field().handleBlur}
                              onInput={(event) =>
                                field().handleChange(event.currentTarget.value)
                              }
                              required
                              value={field().state.value}
                              aria-invalid={isInvalid()}
                            />
                            <field.AuthFormFieldError />
                          </Field>
                        )
                      }}
                    </form.AppField>
                    <form.AppField
                      name="clientSecret"
                      validators={{
                        onChange: ({ value }) =>
                          validateStringLength(value, {
                            requiredMessage:
                              auth.localization.auth.fieldRequired,
                            trim: true
                          })
                      }}
                    >
                      {(field) => {
                        const isInvalid = () =>
                          isAuthFormFieldInvalid(field().state.meta)

                        return (
                          <Field data-invalid={isInvalid()}>
                            <FieldLabel for="solid-sso-client-secret">
                              {localization.clientSecret}
                            </FieldLabel>
                            <Input
                              autocomplete="new-password"
                              id="solid-sso-client-secret"
                              name={field().name}
                              onBlur={field().handleBlur}
                              onInput={(event) =>
                                field().handleChange(event.currentTarget.value)
                              }
                              required
                              type="password"
                              value={field().state.value}
                              aria-invalid={isInvalid()}
                            />
                            <field.AuthFormFieldError />
                          </Field>
                        )
                      }}
                    </form.AppField>
                  </TabsContent>
                  <TabsContent class="flex flex-col gap-4" value="saml">
                    <form.AppField
                      name="entryPoint"
                      validators={{
                        onChange: ({ value }) =>
                          validateAbsoluteUrl(value, {
                            invalidMessage: localization.invalidUrl,
                            requiredMessage:
                              auth.localization.auth.fieldRequired
                          })
                      }}
                    >
                      {(field) => {
                        const isInvalid = () =>
                          isAuthFormFieldInvalid(field().state.meta)

                        return (
                          <Field data-invalid={isInvalid()}>
                            <FieldLabel for="solid-sso-entry-point">
                              {localization.entryPoint}
                            </FieldLabel>
                            <Input
                              id="solid-sso-entry-point"
                              name={field().name}
                              onBlur={field().handleBlur}
                              onInput={(event) =>
                                field().handleChange(event.currentTarget.value)
                              }
                              required
                              type="url"
                              value={field().state.value}
                              aria-invalid={isInvalid()}
                            />
                            <field.AuthFormFieldError />
                          </Field>
                        )
                      }}
                    </form.AppField>
                    <form.AppField
                      name="identityProviderMetadata"
                      validators={{
                        onChange: ({ value }) =>
                          validateStringLength(value, {
                            requiredMessage:
                              auth.localization.auth.fieldRequired,
                            trim: true
                          })
                      }}
                    >
                      {(field) => {
                        const isInvalid = () =>
                          isAuthFormFieldInvalid(field().state.meta)

                        return (
                          <Field data-invalid={isInvalid()}>
                            <FieldLabel for="solid-sso-idp-metadata">
                              {localization.identityProviderMetadata}
                            </FieldLabel>
                            <Textarea
                              class="min-h-40 font-mono text-xs"
                              id="solid-sso-idp-metadata"
                              name={field().name}
                              onBlur={field().handleBlur}
                              onInput={(event) =>
                                field().handleChange(event.currentTarget.value)
                              }
                              required
                              value={field().state.value}
                              aria-invalid={isInvalid()}
                            />
                            <field.AuthFormFieldError />
                          </Field>
                        )
                      }}
                    </form.AppField>
                  </TabsContent>
                </Tabs>
              )}
            </form.Field>
            <FieldError>{getErrorMessage(register.error)}</FieldError>
            <Show when={created()}>
              <FieldDescription role="status">
                {localization.providerCreated}
              </FieldDescription>
            </Show>
          </FieldGroup>
        </CardContent>
        <CardFooter class="justify-end">
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting] as const}
          >
            {(formState) => (
              <Button
                disabled={
                  !formState()[0] || formState()[1] || register.isPending
                }
                type="submit"
              >
                <Show when={formState()[1] || register.isPending}>
                  <Spinner />
                </Show>
                {localization.addProvider}
              </Button>
            )}
          </form.Subscribe>
        </CardFooter>
      </Card>
    </form>
  )
}
