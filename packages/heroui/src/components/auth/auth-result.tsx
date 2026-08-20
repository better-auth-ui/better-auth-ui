import {
  type AuthResult,
  getAuthResultMessage,
  parseAuthResult
} from "@better-auth-ui/core"
import { useAuth } from "@better-auth-ui/react"
import {
  CircleCheck,
  CircleXmark,
  TriangleExclamation
} from "@gravity-ui/icons"
import { Button, Card, type CardProps, cn } from "@heroui/react"
import { useEffect, useState } from "react"

type AuthResultProps = {
  className?: string
  fallbackIntent: "danger" | "success"
  variant?: CardProps["variant"]
}

function AuthResultView({
  className,
  fallbackIntent,
  variant
}: AuthResultProps) {
  const { basePaths, localization, navigate, viewPaths } = useAuth()
  const [result, setResult] = useState<AuthResult>(() =>
    parseAuthResult("", fallbackIntent)
  )

  useEffect(() => {
    setResult(parseAuthResult(window.location.search, fallbackIntent))
  }, [fallbackIntent])

  const message = getAuthResultMessage(result, localization)
  const action = (() => {
    switch (result.action) {
      case "accountSettings":
        return {
          label: localization.auth.callbackViewAccountSettings,
          to: `${basePaths.settings}/${viewPaths.settings.security}`
        }
      case "continue":
        return {
          label: localization.auth.callbackContinue,
          to: result.redirectTo ?? "/"
        }
      case "forgotPassword":
        return {
          label: localization.auth.forgotPassword,
          to: `${basePaths.auth}/${viewPaths.auth.forgotPassword}`
        }
      case "signUp":
        return {
          label: localization.auth.signUp,
          to: `${basePaths.auth}/${viewPaths.auth.signUp}`
        }
      case "verifyEmail":
        return {
          label: localization.auth.verifyEmail,
          to: `${basePaths.auth}/${viewPaths.auth.verifyEmail}`
        }
      default:
        return {
          label: localization.auth.signIn,
          to: `${basePaths.auth}/${viewPaths.auth.signIn}`
        }
    }
  })()
  const Icon =
    result.intent === "success"
      ? CircleCheck
      : result.intent === "warning"
        ? TriangleExclamation
        : CircleXmark

  return (
    <Card
      className={cn("w-full max-w-sm gap-4 md:p-6", className)}
      variant={variant}
    >
      <Card.Header className="items-center text-center">
        <Icon
          aria-hidden="true"
          className={cn(
            "mb-2 size-10",
            result.intent === "success"
              ? "text-success"
              : result.intent === "warning"
                ? "text-warning"
                : "text-danger"
          )}
        />
        <Card.Title className="text-xl font-semibold">
          {message.title}
        </Card.Title>
        <Card.Description>{message.description}</Card.Description>
      </Card.Header>
      <Card.Footer>
        <Button className="w-full" onPress={() => navigate({ to: action.to })}>
          {action.label}
        </Button>
      </Card.Footer>
    </Card>
  )
}

export function AuthCallback(props: Omit<AuthResultProps, "fallbackIntent">) {
  return <AuthResultView {...props} fallbackIntent="success" />
}

export function AuthError(props: Omit<AuthResultProps, "fallbackIntent">) {
  return <AuthResultView {...props} fallbackIntent="danger" />
}
