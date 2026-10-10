import { getAuthResultMessage, parseAuthResult } from "@better-auth-ui/core"
import { useAuth } from "@better-auth-ui/react"
import { useAuthNavigation } from "../../navigation/navigation-context"
import { Button } from "../../primitives/button"
import { Description } from "../../primitives/description"
import { Card } from "../../primitives/card"
import type { AuthViewProps } from "../../lib/auth-plugin"
import { cn } from "../../lib/cn"

function AuthResultView({
  fallbackIntent,
  className,
  variant
}: AuthViewProps & { fallbackIntent: "success" | "danger" }) {
  const { localization } = useAuth()
  const navigation = useAuthNavigation()
  const params = new URLSearchParams()
  for (const key of [
    "error",
    "code",
    "result",
    "status",
    "flow",
    "source",
    "redirectTo",
    "returnTo"
  ]) {
    const value = navigation.getParam(key)
    if (value) params.set(key, value)
  }
  const result = parseAuthResult(params, fallbackIntent)
  const message = getAuthResultMessage(result, localization)
  const label =
    result.action === "accountSettings"
      ? localization.auth.callbackViewAccountSettings
      : result.action === "continue"
        ? localization.auth.callbackContinue
        : localization.auth[result.action]
  return (
    <Card className={cn("w-full max-w-sm gap-4", className)} variant={variant}>
      <Card.Header>
        <Card.Title>{message.title}</Card.Title>
        <Description>{message.description}</Description>
      </Card.Header>
      <Card.Footer>
        <Button
          variant={result.intent === "danger" ? "danger" : "primary"}
          onPress={() => {
            if (result.action === "continue")
              navigation.navigate({ to: result.redirectTo ?? "/" })
            else if (result.action === "accountSettings")
              navigation.push({ section: "settings", view: "security" })
            else navigation.push(result.action)
          }}
        >
          {label}
        </Button>
      </Card.Footer>
    </Card>
  )
}

export function AuthCallback(props: AuthViewProps) {
  return <AuthResultView {...props} fallbackIntent="success" />
}
export function AuthError(props: AuthViewProps) {
  return <AuthResultView {...props} fallbackIntent="danger" />
}
