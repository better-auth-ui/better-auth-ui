import { isTwoFactorRedirect } from "@better-auth-ui/core/plugins/two-factor"
import { useAuth, useSession, useSignInEmail } from "@better-auth-ui/react"
import { Button, Form, Input, Label, Spinner, TextField } from "@heroui/react"
import { type FormEvent, useState } from "react"
import { useSignInContinuation } from "../../../../lib/auth/use-sign-in-continuation"

export interface FreshSessionPromptProps {
  onFresh: () => unknown | Promise<unknown>
}

/** Inline step-up authentication for settings protected by `freshSessionMiddleware`. */
export function FreshSessionPrompt({ onFresh }: FreshSessionPromptProps) {
  const {
    authClient,
    basePaths,
    emailAndPassword,
    localization,
    navigate,
    viewPaths
  } = useAuth()
  const session = useSession(authClient)
  const continueSignIn = useSignInContinuation()
  const [password, setPassword] = useState("")
  const signIn = useSignInEmail(authClient, {
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
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-semibold">
          {localization.settings.freshSessionTitle}
        </h3>
        <p className="text-sm text-muted">
          {localization.settings.freshSessionDescription}
        </p>
      </div>

      {emailAndPassword?.enabled ? (
        <Form className="flex flex-col gap-3" onSubmit={submit}>
          <TextField
            isDisabled={signIn.isPending}
            isInvalid={signIn.isError}
            value={password}
            onChange={setPassword}
          >
            <Label>{localization.auth.password}</Label>
            <Input
              autoComplete="current-password"
              name="password"
              placeholder={localization.auth.passwordPlaceholder}
              type="password"
              required
            />
          </TextField>
          {signIn.error && (
            <p className="text-sm text-danger" role="alert">
              {signIn.error.error?.message ?? signIn.error.message}
            </p>
          )}
          <Button isDisabled={!password} type="submit" variant="primary">
            {signIn.isPending && <Spinner color="current" size="sm" />}
            {localization.settings.freshSessionSubmit}
          </Button>
        </Form>
      ) : (
        <Button
          onPress={() =>
            navigate({ to: `${basePaths.auth}/${viewPaths.auth.signIn}` })
          }
          variant="primary"
        >
          {localization.settings.freshSessionSignIn}
        </Button>
      )}
    </div>
  )
}
