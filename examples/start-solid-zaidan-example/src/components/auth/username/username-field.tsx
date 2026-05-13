import {
  isUsernameAvailableOptions,
  type UsernameAuthClient,
  useAuth
} from "@better-auth-ui/solid"
import { createMutation } from "@tanstack/solid-query"
import { Check, X } from "lucide-solid"
import { createSignal, Show } from "solid-js"
import type { AdditionalFieldProps } from "@/components/auth/additional-field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function UsernameField(props: AdditionalFieldProps) {
  const auth = useAuth()
  const usernamePlugin = () =>
    auth.plugins.find((plugin) => plugin.id === "username") as
      | {
          isUsernameAvailable?: boolean
          localization?: {
            usernameAvailable?: string
            usernameTaken?: string
          }
          maxUsernameLength?: number
          minUsernameLength?: number
        }
      | undefined
  const currentUsername = String(props.field.defaultValue ?? "")
  const [value, setValue] = createSignal(currentUsername)
  const [error, setError] = createSignal<string>()
  const availability = createMutation(() => ({
    ...isUsernameAvailableOptions(auth.authClient as UsernameAuthClient),
    onError: () => undefined
  }))
  const shouldCheckAvailability = () =>
    Boolean(usernamePlugin()?.isUsernameAvailable) &&
    Boolean(value().trim()) &&
    value().trim() !== currentUsername

  const handleInput = (next: string) => {
    setValue(next)
    setError(undefined)

    if (shouldCheckAvailability()) {
      availability.mutate({ username: next.trim() })
    } else {
      availability.reset()
    }
  }

  return (
    <div class="grid gap-2">
      <Label for={props.name}>{props.field.label}</Label>
      <div class="relative">
        <Input
          aria-invalid={Boolean(error())}
          autocomplete="username"
          disabled={props.isPending}
          id={props.name}
          maxLength={usernamePlugin()?.maxUsernameLength}
          minLength={usernamePlugin()?.minUsernameLength}
          name={props.name}
          onInput={(event) => handleInput(event.currentTarget.value)}
          onInvalid={(event) => {
            event.preventDefault()
            setError(event.currentTarget.validationMessage)
          }}
          placeholder={props.field.placeholder}
          readonly={props.field.readOnly}
          required={props.field.required}
          type="text"
          value={value()}
        />
        <Show when={shouldCheckAvailability()}>
          <span
            aria-label={
              availability.data?.available
                ? usernamePlugin()?.localization?.usernameAvailable
                : availability.data?.available === false
                  ? usernamePlugin()?.localization?.usernameTaken
                  : undefined
            }
            class="absolute top-1/2 right-3 -translate-y-1/2"
            role="status"
          >
            {availability.data?.available ? (
              <Check class="size-4" />
            ) : availability.error || availability.data?.available === false ? (
              <X class="size-4 text-destructive" />
            ) : (
              <span class="text-muted-foreground text-xs">…</span>
            )}
          </span>
        </Show>
      </div>
      <Show when={error()}>{(message) => <p role="alert">{message()}</p>}</Show>
    </div>
  )
}
