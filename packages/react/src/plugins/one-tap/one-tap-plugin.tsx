"use client"

import {
  type AuthView,
  authQueryKeys,
  createAuthPlugin
} from "@better-auth-ui/core"
import type { OneTapAuthClient } from "@better-auth-ui/core/plugins/one-tap"
import {
  isTwoFactorRedirect,
  storeTwoFactorMethods,
  twoFactorPlugin
} from "@better-auth-ui/core/plugins/two-factor"
import { useQueryClient } from "@tanstack/react-query"
import type { GoogleOneTapActionOptions } from "better-auth/client/plugins"
import { useEffect, useRef } from "react"
import { useAuth } from "../../components/auth/auth-provider"
import { useAuthPlugin } from "../../hooks/use-auth-plugin"
import type { AuthPromptProps } from "../../lib/auth-plugin"
import { usePromptOneTap } from "./hooks/mutations/use-prompt-one-tap"

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

function OneTapPrompt({ view }: AuthPromptProps) {
  const { authClient, basePaths, navigate, plugins, redirectTo } = useAuth()
  const { actionOptions, promptViews } = useAuthPlugin(oneTapPlugin)
  const queryClient = useQueryClient()
  const started = useRef(false)
  const { mutate: promptOneTap } = usePromptOneTap(
    authClient as OneTapAuthClient,
    queryClient
  )

  useEffect(() => {
    if (started.current || !promptViews.includes(view as OneTapView)) {
      return
    }

    started.current = true

    promptOneTap({
      ...actionOptions,
      context: view === "signUp" ? "signup" : "signin",
      fetchOptions: {
        onSuccess: async (context) => {
          const twoFactorPath = plugins.find(
            (plugin) => plugin.id === twoFactorPlugin.id
          )?.viewPaths?.auth?.twoFactor

          if (twoFactorPath && isTwoFactorRedirect(context.data)) {
            storeTwoFactorMethods(context.data.twoFactorMethods)
            navigate({
              to: `${basePaths.auth}/${twoFactorPath}?redirectTo=${encodeURIComponent(redirectTo)}`
            })
            return
          }

          await queryClient.invalidateQueries(
            { queryKey: authQueryKeys.session },
            { cancelRefetch: false }
          )
          navigate({ to: redirectTo })
        }
      }
    })
  }, [
    actionOptions,
    basePaths.auth,
    navigate,
    plugins,
    promptOneTap,
    promptViews,
    queryClient,
    redirectTo,
    view
  ])

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
