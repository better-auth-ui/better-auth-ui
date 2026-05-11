import { signUpEmailOptions, useAuth } from "@better-auth-ui/solid"
import { createMutation } from "@tanstack/solid-query"
import { createSignal, Show } from "solid-js"
import { Button } from "@/components/ui/button"
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
  const signUp = createMutation(() => signUpEmailOptions(auth.authClient))

  const submitSignUp = (event: SubmitEvent) => {
    event.preventDefault()

    signUp.mutate({
      callbackURL: props.callbackURL,
      email: email(),
      name: name(),
      password: password()
    })
  }

  return (
    <form aria-label="Sign up" onSubmit={submitSignUp}>
      <h1>Sign up</h1>
      <p>Create an account with email and password.</p>
      <Show when={auth.emailAndPassword.name}>
        <Label for="sign-up-name">Name</Label>
        <Input
          autocomplete="name"
          id="sign-up-name"
          name="name"
          onInput={(event) => setName(event.currentTarget.value)}
          required={auth.emailAndPassword.name}
          type="text"
          value={name()}
        />
      </Show>
      <Label for="sign-up-email">Email</Label>
      <Input
        autocomplete="email"
        id="sign-up-email"
        name="email"
        onInput={(event) => setEmail(event.currentTarget.value)}
        required
        type="email"
        value={email()}
      />
      <Label for="sign-up-password">Password</Label>
      <Input
        autocomplete="new-password"
        id="sign-up-password"
        maxLength={auth.emailAndPassword.maxPasswordLength}
        minLength={auth.emailAndPassword.minPasswordLength}
        name="password"
        onInput={(event) => setPassword(event.currentTarget.value)}
        required
        type="password"
        value={password()}
      />
      <Button disabled={signUp.isPending} type="submit">
        {signUp.isPending ? "Creating account…" : "Create account"}
      </Button>
      <Show when={signUp.isSuccess}>
        <p role="status">
          Account created. Check your email if verification is required.
        </p>
      </Show>
      <Show when={signUp.isError}>
        <p role="alert">Unable to create an account. Try again.</p>
      </Show>
    </form>
  )
}
