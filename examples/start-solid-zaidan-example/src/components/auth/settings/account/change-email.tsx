import { changeEmailOptions, useAuth, useSession } from "@better-auth-ui/solid"
import { createMutation } from "@tanstack/solid-query"
import { createSignal, Show } from "solid-js"
import { toast } from "solid-sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export type ChangeEmailProps = {
  class?: string
}

export function ChangeEmail(props: ChangeEmailProps = {}) {
  const auth = useAuth()
  const session = useSession(auth.authClient)
  const [emailFieldError, setEmailFieldError] = createSignal<string>()
  const changeEmail = createMutation(() => ({
    ...changeEmailOptions(auth.authClient),
    onSuccess: () => toast.success("Email updated successfully")
  }))

  const submitChangeEmail = (event: SubmitEvent) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget as HTMLFormElement)

    changeEmail.mutate({
      callbackURL: `${auth.baseURL}/${auth.viewPaths.settings.account}`,
      newEmail: String(formData.get("email") ?? "")
    } as Parameters<typeof changeEmail.mutate>[0])
  }

  return (
    <div class={cn(props.class)}>
      <h2 class="mb-3 text-sm font-semibold">
        {auth.localization.settings.changeEmail}
      </h2>
      <form onSubmit={submitChangeEmail}>
        <Card>
          <CardContent class="flex flex-col gap-6">
            <div class="grid gap-2">
              <Label for="settings-email">{auth.localization.auth.email}</Label>
              <Input
                aria-invalid={!!emailFieldError()}
                autocomplete="email"
                disabled={changeEmail.isPending || !session.data}
                id="settings-email"
                name="email"
                onInput={() => setEmailFieldError(undefined)}
                onInvalid={(event) => {
                  event.preventDefault()
                  setEmailFieldError(event.currentTarget.validationMessage)
                }}
                placeholder={auth.localization.auth.emailPlaceholder}
                required
                type="email"
                value={session.data?.user.email ?? ""}
              />
              <Show when={emailFieldError()}>
                {(message) => (
                  <p class="text-destructive text-sm">{message()}</p>
                )}
              </Show>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              disabled={changeEmail.isPending || !session.data}
              size="sm"
              type="submit"
            >
              {auth.localization.settings.updateEmail}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
