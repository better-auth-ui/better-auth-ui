import { createQrCodeSvgData, validateStringLength } from "@better-auth-ui/core"
import type {
  TwoFactorAuthClient,
  TwoFactorMethod
} from "@better-auth-ui/core/plugins/two-factor"
import { useAuth, useAuthPlugin, useSession } from "@better-auth-ui/react"
import {
  useDisableTwoFactor,
  useEnableTwoFactor,
  useGenerateBackupCodes,
  useVerifyTotp
} from "@better-auth-ui/react/plugins/two-factor"
import { useMemo, useState } from "react"
import { Share } from "react-native"
import Svg, { Path, Rect } from "react-native-svg"
import { twoFactorPlugin } from "../../../lib/auth/two-factor-plugin"
import { useTwoFactorPasswordRequirement } from "../../../lib/auth/use-two-factor-password"
import type { CardSlotProps } from "../../../lib/auth-plugin"
import { copyText } from "../../../lib/clipboard"
import { AlertDialog } from "../../../primitives/alert-dialog"
import { Button } from "../../../primitives/button"
import { Card } from "../../../primitives/card"
import { Description } from "../../../primitives/description"
import { Skeleton } from "../../../primitives/skeleton"
import { Box, Txt } from "../../../primitives/styled"
import { toast } from "../../../primitives/toast"
import { useAuthForm } from "../auth-form"

type ManagementAction = "enable" | "disable" | "regenerate"

export function TwoFactorSettings(props: CardSlotProps) {
  const { authClient } = useAuth()
  const { localization, backupCodes } = useAuthPlugin(twoFactorPlugin)
  const { data: session, isPending } = useSession(authClient)
  const enabled = Boolean(
    (session?.user as { twoFactorEnabled?: boolean })?.twoFactorEnabled
  )
  const [action, setAction] = useState<ManagementAction | null>(null)
  return (
    <Box className={props.className}>
      <Txt className="text-sm font-semibold mb-3">{localization.twoFactor}</Txt>
      <Card variant={props.variant}>
        <Card.Content className="gap-4">
          {isPending ? (
            <Skeleton className="h-5 w-48" />
          ) : (
            <Txt>
              {enabled
                ? localization.twoFactorEnabled
                : localization.twoFactorDisabled}
            </Txt>
          )}
          <Description>{localization.twoFactorDescription}</Description>
          <Button
            variant={enabled ? "danger" : "primary"}
            isDisabled={isPending || !session}
            onPress={() => setAction(enabled ? "disable" : "enable")}
          >
            {enabled
              ? localization.disableTwoFactor
              : localization.enableTwoFactor}
          </Button>
          {enabled && backupCodes ? (
            <Button onPress={() => setAction("regenerate")}>
              {localization.regenerateBackupCodes}
            </Button>
          ) : null}
        </Card.Content>
      </Card>
      {action ? (
        <TwoFactorManagement
          key={action}
          action={action}
          onClose={() => setAction(null)}
        />
      ) : null}
    </Box>
  )
}

function TwoFactorManagement({
  action,
  onClose
}: {
  action: ManagementAction
  onClose: () => void
}) {
  const { authClient, localization: authLocalization } = useAuth()
  const {
    localization,
    enrollmentMethods,
    codeLength,
    backupCodes: backupCodesEnabled
  } = useAuthPlugin(twoFactorPlugin)
  const requirement = useTwoFactorPasswordRequirement()
  const client = authClient as TwoFactorAuthClient
  const [method, setMethod] = useState<TwoFactorMethod>(
    enrollmentMethods[0] ?? "totp"
  )
  const [step, setStep] = useState<"password" | "verify" | "codes">("password")
  const [uri, setUri] = useState("")
  const [codes, setCodes] = useState<string[]>([])
  const qr = useMemo(() => (uri ? createQrCodeSvgData(uri) : null), [uri])
  const setupKey = useMemo(() => {
    try {
      return uri ? new URL(uri).searchParams.get("secret") : null
    } catch {
      return null
    }
  }, [uri])
  const enable = useEnableTwoFactor(client, { gcTime: 0 })
  const disable = useDisableTwoFactor(client)
  const regenerate = useGenerateBackupCodes(client, { gcTime: 0 })
  const verify = useVerifyTotp(client)
  const pending =
    enable.isPending ||
    disable.isPending ||
    regenerate.isPending ||
    verify.isPending ||
    requirement.isPending
  const form = useAuthForm({
    defaultValues: { password: "", code: "" },
    onSubmit: async ({ value }) => {
      const password = requirement.requiresPassword
        ? { password: value.password }
        : {}
      if (step === "codes") {
        onClose()
        return
      }
      if (step === "verify") {
        await verify.mutateAsync({ code: value.code })
        toast.success(localization.twoFactorEnabled)
        if (backupCodesEnabled && codes.length) setStep("codes")
        else onClose()
        return
      }
      if (action === "disable") {
        await disable.mutateAsync(password)
        toast.success(localization.twoFactorDisabled)
        onClose()
      } else if (action === "regenerate") {
        const result = await regenerate.mutateAsync(password)
        setCodes(result.backupCodes)
        regenerate.reset()
        toast.success(localization.backupCodesRegenerated)
        form.reset()
        setStep("codes")
      } else {
        const result = await enable.mutateAsync({ ...password, method })
        if (result.method === "otp") {
          enable.reset()
          toast.success(localization.twoFactorEnabled)
          onClose()
          return
        }
        setUri(result.totpURI)
        setCodes(result.backupCodes)
        enable.reset()
        form.reset()
        setStep("verify")
      }
    }
  })
  const title =
    action === "disable"
      ? localization.disableTwoFactor
      : action === "regenerate"
        ? localization.regenerateBackupCodes
        : localization.enableTwoFactor
  async function copy(value: string, success: string, failure: string) {
    try {
      await copyText(value)
      toast.success(success)
    } catch {
      toast.danger(failure)
    }
  }
  return (
    <AlertDialog
      isOpen
      onOpenChange={(open) => {
        if (!open && !pending) onClose()
      }}
    >
      <AlertDialog.Header>
        <AlertDialog.Heading>{title}</AlertDialog.Heading>
      </AlertDialog.Header>
      <form.AppForm>
        <form.AuthFormRoot className="gap-4">
          <AlertDialog.Body>
            {step === "password" ? (
              <>
                <Description>
                  {requirement.requiresPassword
                    ? localization.passwordConfirmation
                    : localization.twoFactorDescription}
                </Description>
                {action === "enable" && enrollmentMethods.length > 1 ? (
                  <Box className="gap-2">
                    <Txt>{localization.chooseEnrollmentMethod}</Txt>
                    {enrollmentMethods.map((item) => (
                      <Button
                        key={item}
                        variant={item === method ? "primary" : "secondary"}
                        isDisabled={pending}
                        onPress={() => setMethod(item)}
                      >
                        {item === "otp"
                          ? localization.deliveredCode
                          : localization.authenticatorApp}
                      </Button>
                    ))}
                  </Box>
                ) : null}
                {requirement.requiresPassword ? (
                  <form.AppField
                    name="password"
                    validators={{
                      onChange: ({ value }) =>
                        validateStringLength(value, {
                          requiredMessage: authLocalization.auth.fieldRequired
                        })
                    }}
                  >
                    {(field) => (
                      <field.AuthFormPasswordField
                        label={authLocalization.auth.password}
                        autoComplete="current-password"
                        isPending={pending}
                      />
                    )}
                  </form.AppField>
                ) : null}
              </>
            ) : null}
            {step === "verify" ? (
              <>
                <Description>{localization.scanQrCode}</Description>
                {qr ? (
                  <Svg
                    width={220}
                    height={220}
                    viewBox={`0 0 ${qr.size} ${qr.size}`}
                    accessibilityLabel={localization.scanQrCode}
                  >
                    <Rect width={qr.size} height={qr.size} fill="#fff" />
                    <Path d={qr.path} fill="#000" />
                  </Svg>
                ) : null}
                {setupKey ? (
                  <>
                    <Description>{localization.setupKey}</Description>
                    <Txt selectable>{setupKey}</Txt>
                    <Button
                      onPress={() =>
                        void copy(
                          setupKey,
                          localization.setupKeyCopied,
                          localization.setupKeyCopyFailed
                        )
                      }
                    >
                      {authLocalization.settings.copyToClipboard}
                    </Button>
                  </>
                ) : null}
                <form.AppField
                  name="code"
                  validators={{
                    onChange: ({ value }) =>
                      validateStringLength(value, {
                        requiredMessage: authLocalization.auth.fieldRequired,
                        minLength: codeLength,
                        maxLength: codeLength,
                        minLengthMessage:
                          localization.codeLengthMismatch.replace(
                            "{{length}}",
                            String(codeLength)
                          ),
                        maxLengthMessage:
                          localization.codeLengthMismatch.replace(
                            "{{length}}",
                            String(codeLength)
                          )
                      })
                  }}
                >
                  {(field) => (
                    <field.AuthFormTextField
                      label={localization.authenticatorCode}
                      isDisabled={pending}
                      inputProps={{
                        keyboardType: "number-pad",
                        autoComplete: "one-time-code"
                      }}
                    />
                  )}
                </form.AppField>
              </>
            ) : null}
            {step === "codes" ? (
              <>
                <Txt className="font-semibold">{localization.backupCodes}</Txt>
                <Description>{localization.backupCodesDescription}</Description>
                {codes.map((code) => (
                  <Txt key={code} selectable>
                    {code}
                  </Txt>
                ))}
                <Button
                  onPress={() =>
                    void copy(
                      codes.join("\n"),
                      localization.backupCodesCopied,
                      localization.backupCodesCopyFailed
                    )
                  }
                >
                  {authLocalization.settings.copyToClipboard}
                </Button>
                <Button
                  onPress={() =>
                    void Share.share({
                      title: localization.backupCodes,
                      message: codes.join("\n")
                    })
                  }
                >
                  {localization.downloadBackupCodes}
                </Button>
              </>
            ) : null}
          </AlertDialog.Body>
          <AlertDialog.Footer>
            <Button isDisabled={pending} onPress={onClose}>
              {authLocalization.settings.cancel}
            </Button>
            <form.AuthFormSubmitButton
              variant={action === "disable" ? "danger" : "primary"}
              isPending={pending}
            >
              {step === "codes"
                ? localization.done
                : step === "verify"
                  ? localization.verify
                  : title}
            </form.AuthFormSubmitButton>
          </AlertDialog.Footer>
        </form.AuthFormRoot>
      </form.AppForm>
    </AlertDialog>
  )
}
