import { authQueryKeys } from "@better-auth-ui/core"
import { deleteUserLocalization } from "@better-auth-ui/core/plugins"
import {
  deleteUserOptions,
  listAccountsOptions,
  useAuth,
  useSession
} from "@better-auth-ui/solid"
import {
  createMutation,
  createQuery,
  useQueryClient
} from "@tanstack/solid-query"
import { Eye, EyeOff, TriangleAlert } from "lucide-solid"
import { createSignal, Show } from "solid-js"
import { toast } from "solid-sonner"
import { shouldLoadAccounts } from "@/components/auth/settings/shared/helpers"
import type { DeleteUserPluginConfig } from "@/components/auth/settings/shared/types"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput
} from "@/components/ui/input-group"
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
  const [isPasswordVisible, setIsPasswordVisible] = createSignal(false)
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
  const accounts = createQuery(() => ({
    ...listAccountsOptions(auth.authClient, userId()),
    enabled: shouldLoadAccounts({
      isSsr: import.meta.env.SSR,
      userId: userId()
    })
  }))
  const hasCredentialAccount = () =>
    accounts.data?.some(
      (account: { providerId?: string }) => account.providerId === "credential"
    )
  const needsPassword = () =>
    !sendDeleteAccountVerification() && Boolean(hasCredentialAccount())
  const deleteUser = createMutation(() => ({
    ...deleteUserOptions(auth.authClient),
    onSuccess: () => {
      setConfirmOpen(false)
      setPassword("")
      setIsPasswordVisible(false)

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
  }))

  const handleDialogOpenChange = (open: boolean) => {
    setConfirmOpen(open)
    setPassword("")
    setIsPasswordVisible(false)
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

        <AlertDialog open={confirmOpen()} onOpenChange={handleDialogOpenChange}>
          <AlertDialogTrigger
            as={Button}
            disabled={!accounts.data || accounts.isPending}
            size="sm"
            variant="destructive"
          >
            {deleteUserLabels().deleteUser}
          </AlertDialogTrigger>

          <AlertDialogContent>
            <form class="flex flex-col gap-6" onSubmit={submitDeleteUser}>
              <AlertDialogHeader>
                <AlertDialogMedia class="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                  <TriangleAlert />
                </AlertDialogMedia>
                <AlertDialogTitle>
                  {deleteUserLabels().deleteUser}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {deleteUserLabels().deleteUserDescription}
                </AlertDialogDescription>
              </AlertDialogHeader>

              <Show when={needsPassword()}>
                <Field>
                  <FieldLabel for="delete-password">
                    {auth.localization.auth.password}
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      autocomplete="current-password"
                      disabled={deleteUser.isPending}
                      id="delete-password"
                      name="password"
                      onInput={(event) =>
                        setPassword(event.currentTarget.value)
                      }
                      placeholder={auth.localization.auth.passwordPlaceholder}
                      required
                      type={isPasswordVisible() ? "text" : "password"}
                      value={password()}
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        aria-label={
                          isPasswordVisible()
                            ? auth.localization.auth.hidePassword
                            : auth.localization.auth.showPassword
                        }
                        disabled={deleteUser.isPending}
                        onClick={() =>
                          setIsPasswordVisible((visible) => !visible)
                        }
                        size="icon-sm"
                        title={
                          isPasswordVisible()
                            ? auth.localization.auth.hidePassword
                            : auth.localization.auth.showPassword
                        }
                      >
                        <Show
                          when={isPasswordVisible()}
                          fallback={<Eye aria-hidden class="size-4" />}
                        >
                          <EyeOff aria-hidden class="size-4" />
                        </Show>
                      </InputGroupButton>
                    </InputGroupAddon>
                  </InputGroup>
                </Field>
              </Show>

              <AlertDialogFooter>
                <AlertDialogCancel
                  disabled={deleteUser.isPending}
                  type="button"
                >
                  {auth.localization.settings.cancel}
                </AlertDialogCancel>
                <Button
                  disabled={deleteUser.isPending}
                  type="submit"
                  variant="destructive"
                >
                  {deleteUser.isPending
                    ? `${deleteUserLabels().deleteUser}…`
                    : deleteUserLabels().deleteUser}
                </Button>
              </AlertDialogFooter>
            </form>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  )
}
