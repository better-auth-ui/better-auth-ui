"use client"

import {
  type AuthView,
  authMutationKeys,
  validateEmailAddress
} from "@better-auth-ui/core"
import {
  type SiweAuthClient,
  siweMutationKeys
} from "@better-auth-ui/core/plugins/siwe"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useSignInSiwe } from "@better-auth-ui/react/plugins/siwe"
import { Wallet } from "@gravity-ui/icons"
import { Button, Input, Label, Modal, Spinner, TextField } from "@heroui/react"
import { useIsMutating } from "@tanstack/react-query"
import { useState } from "react"

import { siwePlugin } from "../../../lib/auth/siwe-plugin"
import { isAuthFormFieldInvalid, useAuthForm } from "../auth-form"

export type SignInEthereumButtonProps = {
  view?: AuthView
}

export function SignInEthereumButton({ view }: SignInEthereumButtonProps) {
  const { authClient, localization, navigate, redirectTo } = useAuth()
  const plugin = useAuthPlugin(siwePlugin)
  const [isOpen, setIsOpen] = useState(false)
  const signIn = useSignInSiwe(authClient as SiweAuthClient, {
    connector: plugin.connector,
    domain: plugin.domain,
    uri: plugin.uri,
    statement: plugin.statement
  })
  const authPending =
    useIsMutating({ mutationKey: authMutationKeys.signIn.all }) +
      useIsMutating({ mutationKey: authMutationKeys.signUp.all }) +
      useIsMutating({ mutationKey: siweMutationKeys.all }) >
    0

  const completeSignIn = async (email?: string) => {
    await signIn.mutateAsync(email ? { email } : undefined, {
      onSuccess: () => {
        setIsOpen(false)
        navigate({ to: redirectTo })
      }
    })
  }

  const handlePress = () => {
    if (plugin.email === "none") {
      void completeSignIn().catch(() => undefined)
    } else setIsOpen(true)
  }

  const form = useAuthForm({
    defaultValues: { email: "" },
    onSubmit: async ({ value }) => {
      const email = value.email.trim()
      await completeSignIn(email || undefined)
    }
  })

  if (view === "signUp") return null

  return (
    <>
      <Button
        className="w-full"
        variant="tertiary"
        isDisabled={authPending}
        isPending={signIn.isPending}
        onPress={handlePress}
      >
        {signIn.isPending ? <Spinner color="current" size="sm" /> : <Wallet />}
        {plugin.localization.continueWithEthereum}
      </Button>

      <Modal.Backdrop isOpen={isOpen} onOpenChange={setIsOpen}>
        <Modal.Container>
          <Modal.Dialog className="sm:max-w-md">
            <form.AppForm>
              <form.AuthFormRoot>
                <Modal.CloseTrigger />
                <Modal.Header>
                  <Modal.Icon className="bg-accent-soft text-accent-soft-foreground">
                    <Wallet />
                  </Modal.Icon>
                  <Modal.Heading>
                    {plugin.localization.continueWithEthereum}
                  </Modal.Heading>
                  <p className="mt-1.5 text-muted text-sm">
                    {plugin.localization.emailDescription}
                  </p>
                </Modal.Header>
                <Modal.Body className="overflow-visible">
                  <form.AppField
                    name="email"
                    validators={
                      plugin.email === "required"
                        ? {
                            onChange: ({ value }) =>
                              validateEmailAddress(value, {
                                invalidMessage: localization.auth.invalidEmail,
                                requiredMessage: localization.auth.fieldRequired
                              })
                          }
                        : undefined
                    }
                  >
                    {(field) => (
                      <TextField
                        className="w-full"
                        isInvalid={isAuthFormFieldInvalid(field.state.meta)}
                        name={field.name}
                        type="email"
                        isRequired={plugin.email === "required"}
                        isDisabled={signIn.isPending}
                        variant="secondary"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={field.handleChange}
                      >
                        <Label>
                          {plugin.email === "required"
                            ? plugin.localization.email
                            : plugin.localization.emailOptional}
                        </Label>
                        <Input autoFocus autoComplete="email" />
                        <field.AuthFormFieldError />
                      </TextField>
                    )}
                  </form.AppField>
                  <form.AuthFormServerError />
                </Modal.Body>
                <Modal.Footer>
                  <Button
                    slot="close"
                    variant="tertiary"
                    isDisabled={signIn.isPending}
                  >
                    {localization.settings.cancel}
                  </Button>
                  <form.AuthFormSubmitButton
                    isPending={signIn.isPending}
                    isDisabled={signIn.isPending}
                  >
                    {plugin.localization.signMessage}
                  </form.AuthFormSubmitButton>
                </Modal.Footer>
              </form.AuthFormRoot>
            </form.AppForm>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </>
  )
}
