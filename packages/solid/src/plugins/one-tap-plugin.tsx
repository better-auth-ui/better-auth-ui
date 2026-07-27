import {
  type AuthView,
  authQueryKeys,
  createAuthPlugin
} from "@better-auth-ui/core"
import {
  isTwoFactorRedirect,
  storeTwoFactorMethods,
  twoFactorPlugin
} from "@better-auth-ui/core/plugins"
import { createMutation, useQueryClient } from "@tanstack/solid-query"
import type { GoogleOneTapActionOptions } from "better-auth/client/plugins"
import { onMount } from "solid-js"
import { useAuthPlugin } from "../hooks/use-auth-plugin"
import type { OneTapAuthClient } from "../lib/auth-client"
import type { AuthPromptProps } from "../lib/auth-plugin"
import { useAuth } from "../lib/auth-provider"
import { promptOneTapOptions } from "../mutations/one-tap/prompt-one-tap-mutation"

export type OneTapView = Extract<AuthView, "signIn" | "signUp">

export type OneTapPluginOptions = Omit<
  GoogleOneTapActionOptions,
  "button" | "callbackURL" | "context" | "fetchOptions"
> & {
  /**
   * Auth views that may open the prompt.
   *
   * @default ["signIn"]
   */
  views?: readonly OneTapView[]
}

function OneTapPrompt(props: AuthPromptProps) {
  const auth = useAuth()
  const plugin = useAuthPlugin(oneTapPlugin)
  const queryClient = useQueryClient()
  const promptOneTap = createMutation(() =>
    promptOneTapOptions(auth.authClient as OneTapAuthClient)
  )

  onMount(() => {
    if (!plugin.promptViews.includes(props.view as OneTapView)) return

    promptOneTap.mutate({
      ...plugin.actionOptions,
      context: props.view === "signUp" ? "signup" : "signin",
      fetchOptions: {
        onSuccess: async (context) => {
          const twoFactorPath = auth.plugins.find(
            (candidate) => candidate.id === twoFactorPlugin.id
          )?.viewPaths?.auth?.twoFactor

          if (twoFactorPath && isTwoFactorRedirect(context.data)) {
            storeTwoFactorMethods(context.data.twoFactorMethods)
            auth.navigate({
              to: `${auth.basePaths.auth}/${twoFactorPath}?redirectTo=${encodeURIComponent(auth.redirectTo)}`
            })
            return
          }

          await queryClient.invalidateQueries(
            { queryKey: authQueryKeys.session },
            { cancelRefetch: false }
          )
          auth.navigate({ to: auth.redirectTo })
        }
      }
    })
  })

  return null
}

/**
 * Automatically opens Google One Tap on selected authentication views.
 *
 * Configure Better Auth's `oneTapClient()` on the auth client before
 * registering this UI plugin.
 */
export const oneTapPlugin = createAuthPlugin(
  "oneTap",
  ({ views = ["signIn"], ...actionOptions }: OneTapPluginOptions = {}) => ({
    actionOptions,
    promptViews: views,
    authPrompts: [{ id: "google", component: OneTapPrompt }]
  })
)
