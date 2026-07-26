import {
  disableTwoFactorOptions,
  type TwoFactorAuthClient,
  useAuth,
  useAuthPlugin
} from "@better-auth-ui/solid"
import { createMutation } from "@tanstack/solid-query"
import { ShieldAlert } from "lucide-solid"
import { Show } from "solid-js"
import { toast } from "solid-sonner"

import { Button } from "@/components/ui/button"
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { twoFactorPlugin } from "@/lib/auth/two-factor-plugin"
import { useTwoFactorPasswordRequirement } from "@/lib/auth/use-two-factor-password"

/** Confirm turning two-factor off. */
export function DisableTwoFactorDialog(props: {
  onOpenChange: (open: boolean) => void
}) {
  const auth = useAuth()
  const { localization: twoFactorLocalization } = useAuthPlugin(twoFactorPlugin)
  const { isPending: isResolvingPasswordRequirement, requiresPassword } =
    useTwoFactorPasswordRequirement()

  const disableTwoFactor = createMutation(() => ({
    ...disableTwoFactorOptions(auth.authClient as TwoFactorAuthClient),
    onSuccess: () => {
      toast.success(twoFactorLocalization.twoFactorDisabled)
      props.onOpenChange(false)
    }
  }))

  const isPending = () =>
    disableTwoFactor.isPending || isResolvingPasswordRequirement()

  const submit = (event: SubmitEvent & { currentTarget: HTMLFormElement }) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const password = String(formData.get("password") ?? "")

    disableTwoFactor.mutate(
      (requiresPassword() ? { password } : {}) as Parameters<
        typeof disableTwoFactor.mutate
      >[0]
    )
  }

  return (
    <DialogContent>
      <form class="flex flex-col gap-6" onSubmit={submit}>
        <DialogHeader>
          <div class="flex size-10 items-center justify-center rounded-md bg-destructive/10 text-destructive">
            <ShieldAlert class="size-4.5" />
          </div>

          <DialogTitle>{twoFactorLocalization.disableTwoFactor}</DialogTitle>

          <DialogDescription>
            {requiresPassword()
              ? twoFactorLocalization.passwordConfirmation
              : twoFactorLocalization.twoFactorDescription}
          </DialogDescription>
        </DialogHeader>

        <Show when={requiresPassword()}>
          <div class="grid gap-2">
            <Label for="disable-two-factor-password">
              {auth.localization.auth.password}
            </Label>

            <Input
              autocomplete="current-password"
              autofocus
              disabled={isPending()}
              id="disable-two-factor-password"
              name="password"
              placeholder={auth.localization.auth.passwordPlaceholder}
              required
              type="password"
            />
          </div>
        </Show>

        <DialogFooter>
          <DialogClose
            as={Button}
            disabled={isPending()}
            type="button"
            variant="outline"
          >
            {auth.localization.settings.cancel}
          </DialogClose>

          <Button disabled={isPending()} type="submit" variant="destructive">
            <Show when={isPending()}>
              <Spinner />
            </Show>

            {twoFactorLocalization.disableTwoFactor}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}
