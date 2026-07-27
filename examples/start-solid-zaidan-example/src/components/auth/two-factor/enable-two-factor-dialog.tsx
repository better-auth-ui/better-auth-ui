import { createQrCodeSvgData } from "@better-auth-ui/core"
import {
  enableTwoFactorOptions,
  type TwoFactorAuthClient,
  useAuth,
  useAuthPlugin,
  verifyTotpOptions
} from "@better-auth-ui/solid"
import { createMutation } from "@tanstack/solid-query"
import { Check, Copy, ShieldCheck } from "lucide-solid"
import { createSignal, onCleanup, Show } from "solid-js"
import { toast } from "solid-sonner"
import { OtpField } from "@/components/auth/otp-field"
import { BackupCodes } from "@/components/auth/two-factor/backup-codes"
import { Button } from "@/components/ui/button"
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput
} from "@/components/ui/input-group"
import { Spinner } from "@/components/ui/spinner"
import { twoFactorPlugin } from "@/lib/auth/two-factor-plugin"
import { useTwoFactorPasswordRequirement } from "@/lib/auth/use-two-factor-password"

type EnrollmentStep = "password" | "verify" | "backupCodes"

/**
 * Three-step two-factor enrollment: confirm the password, scan the QR code
 * and verify a first code, then save the backup codes.
 *
 * Better Auth only marks two-factor as active once a TOTP code verifies, so
 * the dialog never closes on the enable call alone.
 */
export function EnableTwoFactorDialog(props: {
  onOpenChange: (open: boolean) => void
}) {
  const auth = useAuth()
  const { codeLength, localization: twoFactorLocalization } =
    useAuthPlugin(twoFactorPlugin)
  const { isPending: isResolvingPasswordRequirement, requiresPassword } =
    useTwoFactorPasswordRequirement()

  const [step, setStep] = createSignal<EnrollmentStep>("password")
  const [totpUri, setTotpUri] = createSignal("")
  const [backupCodes, setBackupCodes] = createSignal<string[]>([])
  const [code, setCode] = createSignal("")
  const [setupKeyCopied, setSetupKeyCopied] = createSignal(false)
  let copyResetTimeout: ReturnType<typeof setTimeout> | undefined

  const qrCode = () => (totpUri() ? createQrCodeSvgData(totpUri()) : null)

  // Manual entry fallback for authenticator apps that can't scan. The URI is
  // an `otpauth://` URL, so the secret is just a query parameter.
  const setupKey = () => {
    if (!totpUri()) return null

    try {
      return new URL(totpUri()).searchParams.get("secret")
    } catch {
      return null
    }
  }

  onCleanup(() => clearTimeout(copyResetTimeout))

  const copySetupKey = async (key: string) => {
    try {
      await navigator.clipboard.writeText(key)
      setSetupKeyCopied(true)
      clearTimeout(copyResetTimeout)

      copyResetTimeout = setTimeout(() => {
        setSetupKeyCopied(false)
        copyResetTimeout = undefined
      }, 2000)
    } catch {
      toast.error(twoFactorLocalization.setupKeyCopyFailed)
    }
  }

  const twoFactorClient = () => auth.authClient as TwoFactorAuthClient

  const enableTwoFactor = createMutation(() => ({
    ...enableTwoFactorOptions(twoFactorClient()),
    onSuccess: (data) => {
      setTotpUri(data.totpURI)
      setBackupCodes(data.backupCodes)
      setStep("verify")
    }
  }))

  const verifyTotp = createMutation(() => ({
    ...verifyTotpOptions(twoFactorClient()),
    onError: () => setCode(""),
    onSuccess: () => {
      toast.success(twoFactorLocalization.twoFactorEnabled)
      setStep("backupCodes")
    }
  }))

  const isPending = () =>
    enableTwoFactor.isPending ||
    verifyTotp.isPending ||
    isResolvingPasswordRequirement()

  const verifyCode = (completedCode: string) => {
    if (
      isPending() ||
      step() !== "verify" ||
      completedCode.length !== codeLength
    ) {
      return
    }

    verifyTotp.mutate({ code: completedCode } as Parameters<
      typeof verifyTotp.mutate
    >[0])
  }

  const submit = (event: SubmitEvent & { currentTarget: HTMLFormElement }) => {
    event.preventDefault()

    if (step() === "backupCodes") {
      props.onOpenChange(false)
      return
    }

    if (step() === "verify") {
      verifyCode(code())
      return
    }

    const formData = new FormData(event.currentTarget)
    const password = String(formData.get("password") ?? "")

    enableTwoFactor.mutate(
      (requiresPassword() ? { password } : {}) as Parameters<
        typeof enableTwoFactor.mutate
      >[0]
    )
  }

  const submitLabel = () => {
    if (step() === "backupCodes") return twoFactorLocalization.done
    if (step() === "verify") return twoFactorLocalization.verify

    return twoFactorLocalization.enableTwoFactor
  }

  const description = () => {
    if (step() === "verify") return twoFactorLocalization.scanQrCode
    if (step() === "password" && requiresPassword())
      return twoFactorLocalization.passwordConfirmation

    return twoFactorLocalization.twoFactorDescription
  }

  return (
    <DialogContent>
      <form class="flex flex-col gap-6" onSubmit={submit}>
        <DialogHeader>
          <div class="flex size-10 items-center justify-center rounded-md bg-muted">
            <ShieldCheck class="size-4.5" />
          </div>

          <DialogTitle>{twoFactorLocalization.twoFactor}</DialogTitle>
          <DialogDescription>{description()}</DialogDescription>
        </DialogHeader>

        <Show when={step() === "password" && requiresPassword()}>
          <Field>
            <FieldLabel for="enable-two-factor-password">
              {auth.localization.auth.password}
            </FieldLabel>

            <Input
              autocomplete="current-password"
              autofocus
              disabled={isPending()}
              id="enable-two-factor-password"
              name="password"
              placeholder={auth.localization.auth.passwordPlaceholder}
              required
              type="password"
            />
          </Field>
        </Show>

        <Show when={step() === "verify"}>
          <div class="flex flex-col items-center gap-4">
            <Show when={qrCode()}>
              {(data) => (
                <svg
                  aria-hidden="true"
                  class="size-44 rounded-md border"
                  viewBox={`0 0 ${data().size} ${data().size}`}
                >
                  <path
                    d={`M0 0h${data().size}v${data().size}H0z`}
                    fill="white"
                  />
                  <path
                    d={data().path}
                    fill="black"
                    shape-rendering="crispEdges"
                  />
                </svg>
              )}
            </Show>

            <Show when={setupKey()}>
              {(key) => (
                <Field class="w-full gap-1">
                  <FieldLabel
                    class="text-muted-foreground text-xs"
                    for="two-factor-setup-key"
                  >
                    {twoFactorLocalization.setupKey}
                  </FieldLabel>

                  <InputGroup>
                    <InputGroupInput
                      class="font-mono text-xs"
                      id="two-factor-setup-key"
                      readonly
                      value={key()}
                    />

                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        aria-label={
                          setupKeyCopied()
                            ? twoFactorLocalization.setupKeyCopied
                            : auth.localization.settings.copyToClipboard
                        }
                        onClick={() => copySetupKey(key())}
                        size="icon-xs"
                        type="button"
                      >
                        <Show fallback={<Copy />} when={setupKeyCopied()}>
                          <Check />
                        </Show>
                      </InputGroupButton>
                    </InputGroupAddon>
                  </InputGroup>
                </Field>
              )}
            </Show>

            <OtpField
              autofocus
              class="w-full"
              disabled={isPending()}
              id="enable-two-factor-code"
              label={twoFactorLocalization.authenticatorCode}
              length={codeLength}
              name="code"
              onInput={setCode}
              onComplete={verifyCode}
              value={code()}
            />
          </div>
        </Show>

        <Show when={step() === "backupCodes"}>
          <BackupCodes codes={backupCodes()} />
        </Show>

        <DialogFooter>
          <Show when={step() !== "backupCodes"}>
            <DialogClose
              as={Button}
              disabled={isPending()}
              type="button"
              variant="outline"
            >
              {auth.localization.settings.cancel}
            </DialogClose>
          </Show>

          <Button
            disabled={
              isPending() ||
              (step() === "verify" && code().length !== codeLength)
            }
            type="submit"
          >
            <Show when={isPending()}>
              <Spinner />
            </Show>

            {submitLabel()}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}
