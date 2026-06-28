import {
  type AdditionalFieldValue,
  parseAdditionalFieldValue
} from "@better-auth-ui/core"
import { useAuth, useSession, useUpdateUser } from "@better-auth-ui/solid"
import { createSignal, For } from "solid-js"
import { toast } from "solid-sonner"
import { AdditionalField } from "@/components/auth/additional-field"
import { ChangeAvatar } from "@/components/auth/settings/account/change-avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export type UserProfileProps = {
  class?: string
}

export function UserProfile(props: UserProfileProps = {}) {
  const auth = useAuth()
  const session = useSession(auth.authClient)
  const [name, setName] = createSignal("")
  const { mutate: updateUser, isPending: updateUserPending } = useUpdateUser(
    auth.authClient,
    () => ({
      onSuccess: () =>
        toast.success(auth.localization.settings.profileUpdatedSuccess)
    })
  )

  const profileFields = () =>
    auth.additionalFields?.filter((field) => field.profile !== false) ?? []

  const submitProfile = async (event: SubmitEvent) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget as HTMLFormElement)
    const name = String(formData.get("name") ?? "")
    const additionalFieldValues: Record<string, unknown> = {}

    for (const field of auth.additionalFields ?? []) {
      if (field.profile === false || field.readOnly) continue

      const value = parseAdditionalFieldValue(
        field,
        formData.get(field.name) as string | null
      )

      if (field.validate) {
        try {
          await field.validate(value)
        } catch (error) {
          toast.error(error instanceof Error ? error.message : String(error))
          return
        }
      }

      if (value !== undefined) {
        additionalFieldValues[field.name] = value
      }
    }

    updateUser({
      name,
      ...additionalFieldValues
    })
  }

  return (
    <div class={cn(props.class)}>
      <h2 class="mb-3 text-sm font-semibold">
        {auth.localization.settings.userProfile}
      </h2>
      <form aria-label="Profile" onSubmit={submitProfile}>
        <Card>
          <CardContent class="flex flex-col gap-6">
            <ChangeAvatar />

            <div class="grid gap-2">
              <Label for="settings-name">{auth.localization.auth.name}</Label>
              <Input
                autocomplete="name"
                disabled={updateUserPending}
                id="settings-name"
                name="name"
                onInput={(event) => setName(event.currentTarget.value)}
                placeholder={auth.localization.auth.name}
                required
                value={name() || (session.data?.user.name ?? "")}
              />
            </div>

            <For each={profileFields()}>
              {(field) => {
                const value = () =>
                  (session.data?.user as Record<string, unknown> | undefined)?.[
                    field.name
                  ]

                return (
                  <AdditionalField
                    field={{
                      ...field,
                      defaultValue: value() as AdditionalFieldValue | null
                    }}
                    isPending={updateUserPending || !session.data}
                    name={field.name}
                  />
                )
              }}
            </For>
          </CardContent>
          <CardFooter>
            <Button
              aria-label="Save changes"
              disabled={updateUserPending || !session.data}
              size="sm"
              type="submit"
            >
              {auth.localization.settings.saveChanges}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
