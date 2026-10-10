import { validateAbsoluteUrl, validateStringLength } from "@better-auth-ui/core"
import type {
  SsoAuthClient,
  SsoProvider,
  RegisterSsoProviderParams,
  RegisterSsoProviderData,
  UpdateSsoProviderParams
} from "@better-auth-ui/core/plugins/sso"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import {
  useRegisterSsoProvider,
  useUpdateSsoProvider
} from "@better-auth-ui/react/plugins/sso"
import { useState } from "react"
import { ssoPlugin } from "../../../lib/auth/sso-plugin"
import type { CardSlotProps } from "../../../lib/auth-plugin"
import { Card } from "../../../primitives/card"
import { Select } from "../../../primitives/menu"
import { useAuthForm } from "../auth-form"

export type SsoProviderSetupProps = CardSlotProps & {
  organizationId?: string
  defaultOrganizationId?: string
  provider?: SsoProvider
  onRegistered?: (provider: RegisterSsoProviderData) => void
  onSaved?: () => void
}
export function SsoProviderSetup({
  provider,
  organizationId,
  defaultOrganizationId = "",
  onRegistered,
  onSaved,
  ...props
}: SsoProviderSetupProps) {
  const { authClient, localization: common } = useAuth()
  const { localization } = useAuthPlugin(ssoPlugin)
  const register = useRegisterSsoProvider(authClient as SsoAuthClient)
  const update = useUpdateSsoProvider(authClient as SsoAuthClient)
  const [protocol, setProtocol] = useState<"oidc" | "saml">(
    provider?.type === "saml" ? "saml" : "oidc"
  )
  const pending = register.isPending || update.isPending
  const form = useAuthForm({
    defaultValues: {
      providerId: provider?.providerId ?? "",
      domain: provider?.domain ?? "",
      issuer: provider?.issuer ?? "",
      organizationId: organizationId ?? defaultOrganizationId,
      clientId: "",
      clientSecret: "",
      discoveryEndpoint: provider?.oidcConfig?.discoveryEndpoint ?? "",
      entryPoint: provider?.samlConfig?.entryPoint ?? "",
      identityProviderMetadata: ""
    },
    onSubmit: async ({ value }) => {
      const issuer = value.issuer.trim(),
        domain = value.domain.trim()
      const config =
        protocol === "oidc"
          ? {
              oidcConfig: {
                ...(value.clientId.trim() && {
                  clientId: value.clientId.trim()
                }),
                ...(value.clientSecret.trim() && {
                  clientSecret: value.clientSecret.trim()
                }),
                ...(value.discoveryEndpoint.trim() && {
                  discoveryEndpoint: value.discoveryEndpoint.trim()
                })
              }
            }
          : {
              samlConfig: {
                entryPoint: value.entryPoint.trim(),
                ...(value.identityProviderMetadata.trim() && {
                  idpMetadata: {
                    metadata: value.identityProviderMetadata.trim()
                  }
                })
              }
            }
      try {
        if (provider)
          await update.mutateAsync({
            providerId: provider.providerId,
            issuer,
            domain,
            ...config
          } as UpdateSsoProviderParams)
        else {
          const created = await register.mutateAsync({
            providerId: value.providerId.trim(),
            organizationId:
              organizationId ?? (value.organizationId.trim() || undefined),
            issuer,
            domain,
            ...config
          } as RegisterSsoProviderParams<SsoAuthClient>)
          onRegistered?.(created)
        }
        onSaved?.()
      } finally {
        form.setFieldValue("clientSecret", "")
        register.reset()
        update.reset()
      }
    }
  })
  const fields = [
    "providerId",
    "domain",
    "issuer",
    ...(!organizationId && !provider ? ["organizationId"] : []),
    ...(protocol === "oidc"
      ? ["clientId", "clientSecret", "discoveryEndpoint"]
      : ["entryPoint", "identityProviderMetadata"])
  ] as (keyof typeof form.state.values)[]
  const urls = new Set(["issuer", "entryPoint", "discoveryEndpoint"])
  return (
    <Card className={props.className} variant={props.variant}>
      <Card.Header>
        <Card.Title>
          {provider ? localization.editProvider : localization.providerSetup}
        </Card.Title>
      </Card.Header>
      <Card.Content>
        <form.AppForm>
          <form.AuthFormRoot className="gap-4">
            <Select
              label={localization.providerSetup}
              selectedKey={protocol}
              options={[
                { key: "oidc", label: localization.oidc },
                { key: "saml", label: localization.saml }
              ]}
              isDisabled={!!provider || pending}
              onSelectionChange={(key) => setProtocol(key as typeof protocol)}
            />
            {fields.map((name) => (
              <form.AppField
                key={name}
                name={name}
                validators={{
                  onChange: ({ value }) => {
                    const required =
                      name === "providerId" ||
                      name === "domain" ||
                      name === "issuer" ||
                      name === "entryPoint" ||
                      (!provider &&
                        [
                          "clientId",
                          "clientSecret",
                          "identityProviderMetadata"
                        ].includes(name))
                    return urls.has(name)
                      ? validateAbsoluteUrl(value, {
                          requiredMessage: required
                            ? common.auth.fieldRequired
                            : undefined,
                          invalidMessage: localization.invalidUrl
                        })
                      : required
                        ? validateStringLength(value, {
                            trim: true,
                            requiredMessage: common.auth.fieldRequired
                          })
                        : undefined
                  }
                }}
              >
                {(field) =>
                  name === "clientSecret" ? (
                    <field.AuthFormPasswordField
                      label={localization.clientSecret}
                      isPending={pending}
                    />
                  ) : (
                    <field.AuthFormTextField
                      label={localization[name]}
                      type={urls.has(name) ? "url" : "text"}
                      isDisabled={
                        pending || (name === "providerId" && !!provider)
                      }
                      inputProps={{
                        multiline: name === "identityProviderMetadata"
                      }}
                    />
                  )
                }
              </form.AppField>
            ))}
            <form.AuthFormSubmitButton isPending={pending}>
              {localization.saveProvider}
            </form.AuthFormSubmitButton>
          </form.AuthFormRoot>
        </form.AppForm>
      </Card.Content>
    </Card>
  )
}
