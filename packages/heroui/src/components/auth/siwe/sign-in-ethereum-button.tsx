"use client"

import { type AuthView, authMutationKeys } from "@better-auth-ui/core"
import {
  type SiweAuthClient,
  siweMutationKeys
} from "@better-auth-ui/core/plugins/siwe"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useSignInSiwe } from "@better-auth-ui/react/plugins/siwe"
import { Wallet } from "@gravity-ui/icons"
import {
  Button,
  FieldError,
  Form,
  Input,
  Label,
  Modal,
  Spinner,
  TextField
} from "@heroui/react"
import { useIsMutating } from "@tanstack/react-query"
import { type SyntheticEvent, useState } from "react"

import { siwePlugin } from "../../../lib/auth/siwe-plugin"

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

  if (view === "signUp") return null

  const completeSignIn = (email?: string) => {
    signIn.mutate(email ? { email } : undefined, {
      onSuccess: () => {
        setIsOpen(false)
        navigate({ to: redirectTo })
      }
    })
  }

  const handlePress = () => {
    if (plugin.email === "none") completeSignIn()
    else setIsOpen(true)
  }

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault()
    const email = String(
      new FormData(event.currentTarget).get("email") ?? ""
    ).trim()
    completeSignIn(email || undefined)
  }

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
            <Form onSubmit={handleSubmit}>
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
                <TextField
                  className="w-full"
                  name="email"
                  type="email"
                  isRequired={plugin.email === "required"}
                  isDisabled={signIn.isPending}
                  variant="secondary"
                >
                  <Label>
                    {plugin.email === "required"
                      ? plugin.localization.email
                      : plugin.localization.emailOptional}
                  </Label>
                  <Input autoFocus autoComplete="email" />
                  <FieldError />
                </TextField>
              </Modal.Body>
              <Modal.Footer>
                <Button
                  slot="close"
                  variant="tertiary"
                  isDisabled={signIn.isPending}
                >
                  {localization.settings.cancel}
                </Button>
                <Button type="submit" isPending={signIn.isPending}>
                  {signIn.isPending && <Spinner color="current" size="sm" />}
                  {plugin.localization.signMessage}
                </Button>
              </Modal.Footer>
            </Form>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </>
  )
}
