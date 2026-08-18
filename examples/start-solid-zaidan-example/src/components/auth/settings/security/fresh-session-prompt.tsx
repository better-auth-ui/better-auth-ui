import { isTwoFactorRedirect } from "@better-auth-ui/core/plugins/two-factor"
import { useAuth, useSession, useSignInEmail } from "@better-auth-ui/solid"
import { createSignal, Show } from "solid-js"
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

export function FreshSessionPrompt(props: FreshSessionPromptProps) {
  const auth = useAuth()
  const session = useSession(auth.authClient)
  const continueSignIn = useSignInContinuation()
  const [password, setPassword] = createSignal("")
  const signIn = useSignInEmail(auth.authClient, () => ({
    onError: () => setPassword(""),
    onSuccess: async (data) => {
      if (isTwoFactorRedirect(data)) {
        continueSignIn(data)
        return
      }
      setPassword("")
      await props.onFresh()
    }
  }))

  const submit = (event: SubmitEvent & { currentTarget: HTMLFormElement }) => {
    event.preventDefault()
    const email = session.data?.user.email
    if (!email) return
    signIn.mutate({ email, password: password() })
  }

  return (
    <div class="p-4">
      <FieldGroup class="gap-4">
        <div class="flex flex-col gap-1">
          <h3 class="text-sm font-medium">
            {auth.localization.settings.freshSessionTitle}
          </h3>
          <FieldDescription>
            {auth.localization.settings.freshSessionDescription}
          </FieldDescription>
        </div>
        <Show
          fallback={
            <Button
              onClick={() =>
                auth.navigate({
                  to: `${auth.basePaths.auth}/${auth.viewPaths.auth.signIn}`
                })
              }
            >
              {auth.localization.settings.freshSessionSignIn}
            </Button>
          }
          when={auth.emailAndPassword?.enabled}
        >
          <form class="flex flex-col gap-3" onSubmit={submit}>
            <Field data-invalid={signIn.isError}>
              <FieldLabel for="fresh-session-password">
                {auth.localization.auth.password}
              </FieldLabel>
              <Input
                id="fresh-session-password"
                autocomplete="current-password"
                disabled={signIn.isPending}
                value={password()}
                onInput={(event) => setPassword(event.currentTarget.value)}
                type="password"
                required
              />
              <Show when={signIn.error}>
                {(error) => (
                  <FieldError>
                    {error().error?.message ?? error().message}
                  </FieldError>
                )}
              </Show>
            </Field>
            <Button disabled={!password() || signIn.isPending} type="submit">
              <Show when={signIn.isPending}>
                <Spinner />
              </Show>
              {auth.localization.settings.freshSessionSubmit}
            </Button>
          </form>
        </Show>
      </FieldGroup>
    </div>
  )
}
