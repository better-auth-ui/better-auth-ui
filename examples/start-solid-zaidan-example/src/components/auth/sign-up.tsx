import { signUpEmailOptions, useAuth } from "@better-auth-ui/solid"
import { createMutation } from "@tanstack/solid-query"
import { createSignal, Show } from "solid-js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export type SignUpProps = {
  callbackURL?: string
}

export function SignUp(props: SignUpProps) {
  const auth = useAuth()
  const [email, setEmail] = createSignal("")
  const [name, setName] = createSignal("")
  const [password, setPassword] = createSignal("")
  const [confirmPassword, setConfirmPassword] = createSignal("")
  const [passwordsDoNotMatch, setPasswordsDoNotMatch] = createSignal(false)
  const signUp = createMutation(() => signUpEmailOptions(auth.authClient))

  const submitSignUp = (event: SubmitEvent) => {
    event.preventDefault()

    setPasswordsDoNotMatch(false)

    if (
      auth.emailAndPassword.confirmPassword &&
      password() !== confirmPassword()
    ) {
      setPasswordsDoNotMatch(true)
      return
    }

    signUp.mutate({
      callbackURL: props.callbackURL,
      email: email(),
      name: name(),
      password: password()
    })
  }

  return (
    <Card class="w-full max-w-sm">
      <CardHeader>
        <CardTitle class="text-xl font-semibold">
          {auth.localization.auth.signUp}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form aria-label="Sign up" onSubmit={submitSignUp}>
          <div class="flex flex-col gap-6">
            <Show when={auth.emailAndPassword.name}>
              <div class="grid gap-3">
                <Label for="sign-up-name">{auth.localization.auth.name}</Label>
                <Input
                  autocomplete="name"
                  id="sign-up-name"
                  name="name"
                  onInput={(event) => setName(event.currentTarget.value)}
                  placeholder={auth.localization.auth.namePlaceholder}
                  required={auth.emailAndPassword.name}
                  type="text"
                  value={name()}
                />
              </div>
            </Show>
            <div class="grid gap-3">
              <Label for="sign-up-email">{auth.localization.auth.email}</Label>
              <Input
                autocomplete="email"
                id="sign-up-email"
                name="email"
                onInput={(event) => setEmail(event.currentTarget.value)}
                placeholder={auth.localization.auth.emailPlaceholder}
                required
                type="email"
                value={email()}
              />
            </div>
            <div class="grid gap-3">
              <Label for="sign-up-password">
                {auth.localization.auth.password}
              </Label>
              <Input
                autocomplete="new-password"
                id="sign-up-password"
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
            <Show when={auth.emailAndPassword.confirmPassword}>
              <div class="grid gap-3">
                <Label for="sign-up-confirm-password">
                  {auth.localization.auth.confirmPassword}
                </Label>
                <Input
                  autocomplete="new-password"
                  id="sign-up-confirm-password"
                  maxLength={auth.emailAndPassword.maxPasswordLength}
                  minLength={auth.emailAndPassword.minPasswordLength}
                  name="confirmPassword"
                  onInput={(event) =>
                    setConfirmPassword(event.currentTarget.value)
                  }
                  placeholder={
                    auth.localization.auth.confirmPasswordPlaceholder
                  }
                  required
                  type="password"
                  value={confirmPassword()}
                />
              </div>
            </Show>
            <Button disabled={signUp.isPending} type="submit">
              {signUp.isPending
                ? `${auth.localization.auth.signUp}…`
                : auth.localization.auth.signUp}
            </Button>
            <Show when={passwordsDoNotMatch()}>
              <p role="alert">Passwords do not match.</p>
            </Show>
            <Show when={signUp.isSuccess}>
              <p role="status">
                Account created. Check your email if verification is required.
              </p>
            </Show>
            <Show when={signUp.isError}>
              <p role="alert">Unable to create an account. Try again.</p>
            </Show>
          </div>
        </form>

        <div class="mt-4 flex w-full flex-col items-center gap-3">
          <p class="text-center text-sm text-muted-foreground">
            {auth.localization.auth.alreadyHaveAnAccount}{" "}
            <a
              class="underline underline-offset-4"
              href={`${auth.basePaths.auth}/${auth.viewPaths.auth.signIn}`}
            >
              {auth.localization.auth.signIn}
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
