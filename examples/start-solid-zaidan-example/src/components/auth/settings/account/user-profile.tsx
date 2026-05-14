import { updateUserOptions, useAuth, useSession } from "@better-auth-ui/solid"
import { createMutation } from "@tanstack/solid-query"
import { createSignal } from "solid-js"
import { toast } from "solid-sonner"
import { ChangeAvatar } from "@/components/auth/settings/account/change-avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

const getUsername = (session: ReturnType<typeof useSession>) =>
  (session.data?.user as { username?: string | null } | undefined)?.username ??
  ""

export type UserProfileProps = {
  class?: string
}

export function UserProfile(props: UserProfileProps = {}) {
  const auth = useAuth()
  const session = useSession(auth.authClient)
  const [name, setName] = createSignal("")
  const updateUser = createMutation(() => ({
    ...updateUserOptions(auth.authClient),
    onSuccess: () =>
      toast.success(auth.localization.settings.profileUpdatedSuccess)
  }))
  const username = () => getUsername(session)
  const isProfilePending = () => updateUser.isPending

  const submitProfile = (event: SubmitEvent) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget as HTMLFormElement)
    const name = String(formData.get("name") ?? "")
    const usernameValue = String(formData.get("username") ?? "")

    updateUser.mutate({
      name,
      ...(username() ? { username: usernameValue } : {})
    } as Parameters<typeof updateUser.mutate>[0])
  }

  return (
    <div class={cn(props.class)}>
      <h2 class="mb-3 text-sm font-semibold">Profile</h2>
      <form aria-label="Profile" onSubmit={submitProfile}>
        <Card>
          <CardContent class="flex flex-col gap-6">
            <ChangeAvatar />

            <div class="grid gap-2">
              <Label for="settings-name">{auth.localization.auth.name}</Label>
              <Input
                autocomplete="name"
                disabled={isProfilePending()}
                id="settings-name"
                name="name"
                onInput={(event) => setName(event.currentTarget.value)}
                placeholder={auth.localization.auth.name}
                required
                value={name() || (session.data?.user.name ?? "")}
              />
            </div>

            <div class="grid gap-2">
              <Label for="settings-username">Username</Label>
              <Input
                autocomplete="username"
                disabled={isProfilePending() || !username()}
                id="settings-username"
                name="username"
                placeholder="Username"
                value={username()}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              aria-label="Save changes"
              disabled={isProfilePending() || !session.data}
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
