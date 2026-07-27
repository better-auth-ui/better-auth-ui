import type { AuthView } from "@better-auth-ui/core"
import { createMemo, For } from "solid-js"
import type { AuthPlugin } from "../../lib/auth-plugin"
import { useAuth } from "../../lib/auth-provider"

export type AuthPromptsProps = {
  view: AuthView
}

/**
 * Mount every headless prompt contributed by the registered UI plugins.
 *
 * Solid's keyed `<For>` preserves each descriptor's component instance.
 */
export function AuthPrompts(props: AuthPromptsProps) {
  const auth = useAuth()
  const prompts = createMemo(() =>
    (auth.plugins as AuthPlugin[]).flatMap((plugin) => plugin.authPrompts ?? [])
  )

  return (
    <For each={prompts()}>
      {(prompt) => {
        const Prompt = prompt.component
        return <Prompt view={props.view} />
      }}
    </For>
  )
}
