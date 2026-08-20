import {
  type AuthResult,
  getAuthResultMessage,
  parseAuthResult
} from "@better-auth-ui/core"
import { useAuth } from "@better-auth-ui/solid"
import { CircleCheck, CircleX, TriangleAlert } from "lucide-solid"
import { createSignal, onMount, Show } from "solid-js"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

type AuthResultProps = {
  class?: string
  fallbackIntent: "danger" | "success"
}

function AuthResultView(props: AuthResultProps) {
  const auth = useAuth()
  const [result, setResult] = createSignal<AuthResult>(
    parseAuthResult("", props.fallbackIntent)
  )

  onMount(() => {
    setResult(parseAuthResult(window.location.search, props.fallbackIntent))
  })

  const message = () => getAuthResultMessage(result(), auth.localization)
  const action = () => {
    switch (result().action) {
      case "accountSettings":
        return {
          label: auth.localization.auth.callbackViewAccountSettings,
          to: `${auth.basePaths.settings}/${auth.viewPaths.settings.security}`
        }
      case "continue":
        return {
          label: auth.localization.auth.callbackContinue,
          to: result().redirectTo ?? "/"
        }
      case "forgotPassword":
        return {
          label: auth.localization.auth.forgotPassword,
          to: `${auth.basePaths.auth}/${auth.viewPaths.auth.forgotPassword}`
        }
      case "signUp":
        return {
          label: auth.localization.auth.signUp,
          to: `${auth.basePaths.auth}/${auth.viewPaths.auth.signUp}`
        }
      case "verifyEmail":
        return {
          label: auth.localization.auth.verifyEmail,
          to: `${auth.basePaths.auth}/${auth.viewPaths.auth.verifyEmail}`
        }
      default:
        return {
          label: auth.localization.auth.signIn,
          to: `${auth.basePaths.auth}/${auth.viewPaths.auth.signIn}`
        }
    }
  }

  return (
    <Card class={cn("w-full max-w-sm", props.class)}>
      <CardHeader class="justify-items-center text-center">
        <Show
          when={result().intent === "success"}
          fallback={
            <Show
              when={result().intent === "warning"}
              fallback={
                <CircleX
                  aria-hidden="true"
                  class="mb-1 size-10 text-destructive"
                />
              }
            >
              <TriangleAlert
                aria-hidden="true"
                class="mb-1 size-10 text-warning"
              />
            </Show>
          }
        >
          <CircleCheck aria-hidden="true" class="mb-1 size-10 text-primary" />
        </Show>
        <CardTitle class="text-xl">{message().title}</CardTitle>
        <CardDescription>{message().description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          class="w-full"
          onClick={() => auth.navigate({ to: action().to })}
        >
          {action().label}
        </Button>
      </CardContent>
    </Card>
  )
}

export function AuthCallback(props: Omit<AuthResultProps, "fallbackIntent">) {
  return <AuthResultView {...props} fallbackIntent="success" />
}

export function AuthError(props: Omit<AuthResultProps, "fallbackIntent">) {
  return <AuthResultView {...props} fallbackIntent="danger" />
}
