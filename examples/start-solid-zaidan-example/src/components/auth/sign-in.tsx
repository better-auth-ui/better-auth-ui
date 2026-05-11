import { signInEmailOptions, useAuth } from "@better-auth-ui/solid"
import { createMutation } from "@tanstack/solid-query"
import { createSignal, Show } from "solid-js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const authHref = (basePath: string, viewPath: string) =>
  `${basePath}/${viewPath}`

export function SignIn() {
  const auth = useAuth()
  const [email, setEmail] = createSignal("")
  const [password, setPassword] = createSignal("")
  const signIn = createMutation(() => signInEmailOptions(auth.authClient))

  const submitSignIn = (event: SubmitEvent) => {
    event.preventDefault()

    signIn.mutate({
      email: email(),
      password: password()
    })
  }

  return (
    <Card class="w-full max-w-sm">
      <CardHeader>
        <CardTitle class="text-xl font-semibold">
          {auth.localization.auth.signIn}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form aria-label="Sign in" onSubmit={submitSignIn}>
          <div class="flex flex-col gap-6">
            <div class="grid gap-3">
              <Label for="sign-in-email">{auth.localization.auth.email}</Label>
              <Input
                autocomplete="email"
                id="sign-in-email"
                name="email"
                onInput={(event) => setEmail(event.currentTarget.value)}
                placeholder={auth.localization.auth.emailPlaceholder}
                required
                type="email"
                value={email()}
              />
            </div>

            <div class="grid gap-3">
              <Label for="sign-in-password">
                {auth.localization.auth.password}
              </Label>
              <Input
                autocomplete="current-password"
                id="sign-in-password"
                maxLength={auth.emailAndPassword.maxPasswordLength}
                minLength={auth.emailAndPassword.minPasswordLength}
                name="password"
                onInput={(event) => setPassword(event.currentTarget.value)}
                placeholder={auth.localization.auth.passwordPlaceholder}
                required
                type="password"
                value={password()}
              />
            </div>

            <Button disabled={signIn.isPending} type="submit">
              {signIn.isPending
                ? `${auth.localization.auth.signIn}…`
                : auth.localization.auth.signIn}
            </Button>

            <Show when={signIn.isError}>
              <p role="alert">Unable to sign in. Try again.</p>
            </Show>
          </div>
        </form>

        <div class="mt-4 flex w-full flex-col items-center gap-3">
          <Show when={auth.emailAndPassword.forgotPassword}>
            <a
              class="text-sm underline-offset-4 hover:underline"
              href={authHref(
                auth.basePaths.auth,
                auth.viewPaths.auth.forgotPassword
              )}
            >
              {auth.localization.auth.forgotPasswordLink}
            </a>
          </Show>

          <p class="text-center text-sm text-muted-foreground">
            {auth.localization.auth.needToCreateAnAccount}{" "}
            <a
              class="underline underline-offset-4"
              href={authHref(auth.basePaths.auth, auth.viewPaths.auth.signUp)}
            >
              {auth.localization.auth.signUp}
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
