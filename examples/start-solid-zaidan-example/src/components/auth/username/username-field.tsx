import { getFormFieldErrors } from "@better-auth-ui/core"
import type { UsernameAuthClient } from "@better-auth-ui/core/plugins/username"
import { useAuth } from "@better-auth-ui/solid"
import { useIsUsernameAvailable } from "@better-auth-ui/solid/plugins/username"
import { Check, X } from "lucide-solid"
import { createSignal, Show } from "solid-js"
import type { AdditionalFieldProps } from "@/components/auth/additional-field"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput
} from "@/components/ui/input-group"
import { Spinner } from "@/components/ui/spinner"

export function UsernameField(props: AdditionalFieldProps) {
  const auth = useAuth<UsernameAuthClient>()
  const usernamePlugin = () =>
    auth.plugins.find((plugin) => plugin.id === "username") as
      | {
          isUsernameAvailable?: boolean
          localization?: {
            usernameAvailable?: string
            usernameTaken?: string
          }
          usernamePrefix?: string
          maxUsernameLength?: number
          minUsernameLength?: number
        }
      | undefined
  const currentUsername = String(props.field.defaultValue ?? "")
  const username = () => (typeof props.value === "string" ? props.value : "")
  const [nativeError, setNativeError] = createSignal<string>()
  const fieldErrors = () => getFormFieldErrors(props.errors ?? [])
  const availability = useIsUsernameAvailable(auth.authClient, () => ({
    onError: () => undefined
  }))
  const shouldCheckAvailability = () =>
    Boolean(usernamePlugin()?.isUsernameAvailable) &&
    Boolean(username().trim()) &&
    username().trim() !== currentUsername

  const handleInput = (next: string) => {
    props.onChange(next || null)
    setNativeError(undefined)

    if (shouldCheckAvailability()) {
      availability.mutate({ username: next.trim() })
    } else {
      availability.reset()
    }
  }

  return (
    <Field data-invalid={props.isInvalid || Boolean(nativeError())}>
      <FieldLabel for={props.name}>{props.field.label}</FieldLabel>
      <InputGroup>
        <InputGroupInput
          aria-invalid={props.isInvalid || Boolean(nativeError())}
          autocomplete="username"
          disabled={props.isPending}
          id={props.name}
          maxLength={usernamePlugin()?.maxUsernameLength}
          minLength={usernamePlugin()?.minUsernameLength}
          name={props.name}
          onBlur={props.onBlur}
          onInput={(event) => handleInput(event.currentTarget.value)}
          onInvalid={(event) => {
            event.preventDefault()
            setNativeError(event.currentTarget.validationMessage)
          }}
          placeholder={props.field.placeholder}
          readonly={props.field.readOnly}
          required={props.field.required}
          type="text"
          value={username()}
        />
        <Show when={usernamePlugin()?.usernamePrefix}>
          {(usernamePrefix) => (
            <InputGroupAddon align="inline-start">
              {usernamePrefix()}
            </InputGroupAddon>
          )}
        </Show>
        <Show when={shouldCheckAvailability()}>
          <InputGroupAddon
            align="inline-end"
            aria-label={
              availability.data?.available
                ? usernamePlugin()?.localization?.usernameAvailable
                : availability.data?.available === false
                  ? usernamePlugin()?.localization?.usernameTaken
                  : undefined
            }
            role="status"
          >
            {availability.data?.available ? (
              <Check class="size-4" />
            ) : availability.error || availability.data?.available === false ? (
              <X class="size-4 text-destructive" />
            ) : (
              <Spinner />
            )}
          </InputGroupAddon>
        </Show>
      </InputGroup>
      <FieldError errors={fieldErrors()}>{nativeError()}</FieldError>
    </Field>
  )
}
