import type { AuthView } from "@better-auth-ui/core"
import { useAuth } from "@better-auth-ui/solid"
import { Link } from "@tanstack/solid-router"
import { Lock, Mail } from "lucide-solid"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type MagicLinkButtonProps = {
  view?: AuthView
}

export function MagicLinkButton(props: MagicLinkButtonProps) {
  const auth = useAuth()
  const magicLinkView =
    (
      auth.plugins.find((plugin) => plugin.id === "magicLink")?.viewPaths as
        | { auth?: { magicLink?: string } }
        | undefined
    )?.auth?.magicLink ?? "magic-link"
  const isMagicLinkView = () => props.view === "magicLink"

  if (isMagicLinkView() && !auth.emailAndPassword?.enabled) return null

  return (
    <Link
      class={cn(buttonVariants({ variant: "outline" }), "w-full")}
      params={{
        path: isMagicLinkView() ? auth.viewPaths.auth.signIn : magicLinkView
      }}
      to="/auth/$path"
    >
      {isMagicLinkView() ? <Lock /> : <Mail />}
      {auth.localization.auth.continueWith.replace(
        "{{provider}}",
        isMagicLinkView() ? auth.localization.auth.password : "Magic Link"
      )}
    </Link>
  )
}
