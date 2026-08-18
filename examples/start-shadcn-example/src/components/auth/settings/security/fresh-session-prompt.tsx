"use client"

import { isTwoFactorRedirect } from "@better-auth-ui/core/plugins/two-factor"
import { useAuth, useSession, useSignInEmail } from "@better-auth-ui/react"
import { type FormEvent, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { useSignInContinuation } from "@/lib/auth/use-sign-in-continuation"

export interface FreshSessionPromptProps {
  onFresh: () => unknown | Promise<unknown>
}

export function FreshSessionPrompt({ onFresh }: FreshSessionPromptProps) {
  const auth = useAuth()
  const session = useSession(auth.authClient)
  const continueSignIn = useSignInContinuation()
  const [password, setPassword] = useState("")
  const signIn = useSignInEmail(auth.authClient, {
    onError: () => setPassword(""),
    onSuccess: async (data) => {
      if (isTwoFactorRedirect(data)) {
        continueSignIn(data)
        return
      }
      setPassword("")
      await onFresh()
    }
  })

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const email = session.data?.user.email
    if (!email) return
    signIn.mutate({ email, password })
  }

  return (
    <div className="p-4">
      <FieldGroup className="gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-medium">
            {auth.localization.settings.freshSessionTitle}
          </h3>
          <FieldDescription>
            {auth.localization.settings.freshSessionDescription}
          </FieldDescription>
        </div>
        {auth.emailAndPassword?.enabled ? (
          <form className="flex flex-col gap-3" onSubmit={submit}>
            <Field data-invalid={signIn.isError}>
              <FieldLabel htmlFor="fresh-session-password">
                {auth.localization.auth.password}
              </FieldLabel>
              <Input
                id="fresh-session-password"
                autoComplete="current-password"
                disabled={signIn.isPending}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                required
              />
              {signIn.error && (
                <FieldError>
                  {signIn.error.error?.message ?? signIn.error.message}
                </FieldError>
              )}
            </Field>
            <Button disabled={!password || signIn.isPending} type="submit">
              {signIn.isPending && <Spinner />}
              {auth.localization.settings.freshSessionSubmit}
            </Button>
          </form>
        ) : (
          <Button
            onClick={() =>
              auth.navigate({
                to: `${auth.basePaths.auth}/${auth.viewPaths.auth.signIn}`
              })
            }
          >
            {auth.localization.settings.freshSessionSignIn}
          </Button>
        )}
      </FieldGroup>
    </div>
  )
}
