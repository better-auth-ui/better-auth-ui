import {
  getReauthenticationSignInURL,
  isReauthenticationSignInURL
} from "@better-auth-ui/core"
import { useAuth, useSignOut } from "@better-auth-ui/solid"
import { createSignal, onMount, Show } from "solid-js"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

export type ReauthenticationActionProps = {
  class?: string
  showTitle?: boolean
}

export function ReauthenticationAction(props: ReauthenticationActionProps) {
  const auth = useAuth()
  const signOut = useSignOut(auth.authClient)

  const handleReauthentication = () => {
    const signInURL = getReauthenticationSignInURL(
      new URL(window.location.href),
      `${auth.basePaths.auth}/${auth.viewPaths.auth.signIn}`
    )

    signOut.mutate(undefined, {
      onSuccess: () => auth.navigate({ to: signInURL })
    })
  }

  return (
    <div class={cn("flex flex-col items-start gap-3 p-4", props.class)}>
      <div class="flex flex-col gap-1">
        <Show when={props.showTitle !== false}>
          <h3 class="font-medium text-sm">
            {auth.localization.settings.reauthenticationTitle}
          </h3>
        </Show>
        <p class="text-muted-foreground text-sm">
          {auth.localization.settings.reauthenticationDescription}
        </p>
      </div>

      <Button
        disabled={signOut.isPending}
        onClick={handleReauthentication}
        size="sm"
      >
        <Show when={signOut.isPending}>
          <Spinner data-icon="inline-start" />
        </Show>
        {auth.localization.settings.reauthenticationAction}
      </Button>
    </div>
  )
}

export function ReauthenticationNotice() {
  const auth = useAuth()
  const [isReauthenticationSignIn, setIsReauthenticationSignIn] =
    createSignal(false)

  onMount(() => {
    setIsReauthenticationSignIn(
      isReauthenticationSignInURL(new URL(window.location.href))
    )
  })

  return (
    <Show when={isReauthenticationSignIn()}>
      <Alert class="mx-4 w-auto group-data-[size=sm]/card:mx-3">
        <AlertTitle>
          {auth.localization.settings.reauthenticationTitle}
        </AlertTitle>
        <AlertDescription>
          {auth.localization.settings.reauthenticationDescription}
        </AlertDescription>
      </Alert>
    </Show>
  )
}
