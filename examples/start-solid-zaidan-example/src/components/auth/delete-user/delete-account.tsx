import { authQueryKeys } from "@better-auth-ui/core"
import { deleteUserLocalization } from "@better-auth-ui/core/plugins/delete-user"
import {
  useAuth,
  useDeleteUser,
  useListAccounts,
  useSession
} from "@better-auth-ui/solid"
import { useQueryClient } from "@tanstack/solid-query"
import { TriangleAlert } from "lucide-solid"
import { createSignal, Show } from "solid-js"
import { toast } from "solid-sonner"
import { shouldLoadAccounts } from "@/components/auth/settings/shared/helpers"
import type { DeleteUserPluginConfig } from "@/components/auth/settings/shared/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

const defaultDeleteAccountLabel = "Delete account"

export type DeleteAccountProps = {
  class?: string
}

export function DeleteAccount(props: DeleteAccountProps = {}) {
  const auth = useAuth()
  const session = useSession(auth.authClient)
  const queryClient = useQueryClient()
  const userId = () => session.data?.user.id
  const [confirmOpen, setConfirmOpen] = createSignal(false)
  const [password, setPassword] = createSignal("")
  const deleteUserPluginConfig = () =>
    auth.plugins.find((plugin) => plugin.id === "deleteUser") as
      | DeleteUserPluginConfig
      | undefined
  const deleteUserLabels = () => {
    const pluginLocalization = deleteUserPluginConfig()?.localization

    return {
      deleteUser:
        pluginLocalization?.deleteAccount ??
        deleteUserLocalization.deleteAccount ??
        defaultDeleteAccountLabel,
      deleteUserDescription:
        pluginLocalization?.deleteAccountDescription ??
        deleteUserLocalization.deleteAccountDescription,
      deleteUserSuccess:
        pluginLocalization?.deleteUserSuccess ??
        deleteUserLocalization.deleteUserSuccess,
      deleteUserVerificationSent:
        pluginLocalization?.deleteUserVerificationSent ??
        deleteUserLocalization.deleteUserVerificationSent
    }
  }
  const sendDeleteAccountVerification = () =>
    Boolean(deleteUserPluginConfig()?.sendDeleteAccountVerification)
  const accounts = useListAccounts(auth.authClient, {
    enabled: shouldLoadAccounts({
      isSsr: import.meta.env.SSR,
      userId: userId()
    })
  })
  const hasCredentialAccount = () =>
    accounts.data?.some(
      (account: { providerId?: string }) => account.providerId === "credential"
    )
  const needsPassword = () =>
    !sendDeleteAccountVerification() && Boolean(hasCredentialAccount())
  const deleteUser = useDeleteUser(auth.authClient, {
    onSuccess: () => {
      setConfirmOpen(false)
      setPassword("")

      if (sendDeleteAccountVerification()) {
        toast.success(deleteUserLabels().deleteUserVerificationSent)
        return
      }

      toast.success(deleteUserLabels().deleteUserSuccess)
      queryClient.removeQueries({ queryKey: authQueryKeys.all })
      auth.navigate({
        replace: true,
        to: `${auth.basePaths.auth}/${auth.viewPaths.auth.signIn}`
      })
    }
  })

  const handleDialogOpenChange = (open: boolean) => {
    setConfirmOpen(open)
    setPassword("")
  }

  const submitDeleteUser = (event: SubmitEvent) => {
    event.preventDefault()

    deleteUser.mutate(
      (needsPassword() ? { password: password() } : {}) as Parameters<
        typeof deleteUser.mutate
      >[0]
    )
  }

  return (
    <Card class={cn("z-card-padding-none border-destructive", props.class)}>
      <CardContent class="flex flex-col gap-6 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="font-medium text-sm leading-tight">
            {deleteUserLabels().deleteUser}
          </p>
          <p class="mt-0.5 text-muted-foreground text-xs">
            {deleteUserLabels().deleteUserDescription}
          </p>
        </div>

        <Dialog open={confirmOpen()} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger
            as={Button}
            disabled={!accounts.data || accounts.isPending}
            size="sm"
            variant="destructive"
          >
            {deleteUserLabels().deleteUser}
          </DialogTrigger>

          <DialogContent>
            <form class="flex flex-col gap-6" onSubmit={submitDeleteUser}>
              <DialogHeader>
                <div class="flex size-10 items-center justify-center rounded-md bg-destructive/10 text-destructive dark:bg-destructive/20">
                  <TriangleAlert class="size-4.5" />
                </div>
                <DialogTitle>{deleteUserLabels().deleteUser}</DialogTitle>
                <DialogDescription>
                  {deleteUserLabels().deleteUserDescription}
                </DialogDescription>
              </DialogHeader>

              <Show when={needsPassword()}>
                <div class="grid gap-2">
                  <Label for="delete-password">
                    {auth.localization.auth.password}
                  </Label>
                  <Input
                    autocomplete="current-password"
                    disabled={deleteUser.isPending}
                    id="delete-password"
                    name="password"
                    onInput={(event) => setPassword(event.currentTarget.value)}
                    placeholder={auth.localization.auth.passwordPlaceholder}
                    required
                    type="password"
                    value={password()}
                  />
                </div>
              </Show>

              <DialogFooter>
                <DialogClose
                  as={Button}
                  disabled={deleteUser.isPending}
                  type="button"
                  variant="outline"
                >
                  {auth.localization.settings.cancel}
                </DialogClose>
                <Button
                  disabled={deleteUser.isPending}
                  type="submit"
                  variant="destructive"
                >
                  {deleteUser.isPending
                    ? `${deleteUserLabels().deleteUser}…`
                    : deleteUserLabels().deleteUser}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
