import { validateStringLength } from "@better-auth-ui/core"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import {
  useAddPasskey,
  useDeletePasskey,
  useListPasskeys,
  useUpdatePasskey
} from "@better-auth-ui/react/plugins/passkey"
import { useState } from "react"
import { passkeyPlugin } from "../../../lib/auth/passkey-plugin"
import type { CardSlotProps } from "../../../lib/auth-plugin"
import { AlertDialog } from "../../../primitives/alert-dialog"
import { Button } from "../../../primitives/button"
import { Card } from "../../../primitives/card"
import { Description } from "../../../primitives/description"
import { Skeleton } from "../../../primitives/skeleton"
import { Box, Txt } from "../../../primitives/styled"
import { toast } from "../../../primitives/toast"
import { useAuthForm } from "../auth-form"

type PasskeyAction =
  | { type: "add" }
  | { type: "rename" | "delete"; id: string; name: string }

export function Passkeys(props: CardSlotProps) {
  const { client, localization } = useAuthPlugin(passkeyPlugin)
  const list = useListPasskeys(client)
  const [action, setAction] = useState<PasskeyAction | null>(null)
  return (
    <Box className={props.className}>
      <Txt className="text-sm font-semibold mb-3">{localization.passkeys}</Txt>
      <Card variant={props.variant}>
        <Card.Content className="gap-4">
          <Description>{localization.passkeysDescription}</Description>
          <Button onPress={() => setAction({ type: "add" })}>
            {localization.addPasskey}
          </Button>
          {list.isPending ? <Skeleton className="h-10 w-full" /> : null}
          {list.error ? (
            <Txt accessibilityRole="alert">{list.error.message}</Txt>
          ) : null}
          {list.data?.length === 0 ? (
            <Description>{localization.noPasskeys}</Description>
          ) : null}
          {list.data?.map((item) => (
            <Box key={item.id} className="gap-2">
              <Txt className="font-medium">
                {item.name || localization.passkey}
              </Txt>
              <Button
                onPress={() =>
                  setAction({
                    type: "rename",
                    id: item.id,
                    name: item.name ?? ""
                  })
                }
              >
                {localization.renamePasskey}
              </Button>
              <Button
                variant="danger"
                onPress={() =>
                  setAction({
                    type: "delete",
                    id: item.id,
                    name: item.name ?? localization.passkey
                  })
                }
              >
                {localization.deletePasskey.replace(
                  "{{name}}",
                  item.name ?? localization.passkey
                )}
              </Button>
            </Box>
          ))}
        </Card.Content>
      </Card>
      {action ? (
        <PasskeyDialog
          key={action.type === "add" ? "add" : action.id + action.type}
          action={action}
          onClose={() => setAction(null)}
        />
      ) : null}
    </Box>
  )
}

function PasskeyDialog({
  action,
  onClose
}: {
  action: PasskeyAction
  onClose: () => void
}) {
  const { localization: common } = useAuth()
  const { client, localization, authenticatorAttachment } =
    useAuthPlugin(passkeyPlugin)
  const add = useAddPasskey(client)
  const update = useUpdatePasskey(client)
  const remove = useDeletePasskey(client)
  const pending = add.isPending || update.isPending || remove.isPending
  const form = useAuthForm({
    defaultValues: { name: action.type === "add" ? "" : action.name },
    onSubmit: async ({ value }) => {
      if (action.type === "add") {
        const result = await add.mutateAsync({
          name: value.name.trim(),
          authenticatorAttachment
        })
        if (result.error) throw result.error
      } else if (action.type === "rename") {
        await update.mutateAsync({ id: action.id, name: value.name.trim() })
        toast.success(localization.renamePasskeySuccess)
      } else await remove.mutateAsync({ id: action.id })
      onClose()
    }
  })
  const title =
    action.type === "add"
      ? localization.addPasskey
      : action.type === "rename"
        ? localization.renamePasskey
        : localization.deletePasskeyTitle
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
          {action.type === "delete" ? (
            <Description>{localization.deletePasskeyWarning}</Description>
          ) : (
            <form.AppField
              name="name"
              validators={{
                onChange: ({ value }) =>
                  action.type === "rename"
                    ? validateStringLength(value, {
                        requiredMessage: common.auth.fieldRequired,
                        trim: true
                      })
                    : undefined
              }}
            >
              {(field) => (
                <field.AuthFormTextField
                  label={localization.name}
                  isDisabled={pending}
                />
              )}
            </form.AppField>
          )}
          <AlertDialog.Footer>
            <Button isDisabled={pending} onPress={onClose}>
              {common.settings.cancel}
            </Button>
            <form.AuthFormSubmitButton
              isPending={pending}
              variant={action.type === "delete" ? "danger" : "primary"}
            >
              {title}
            </form.AuthFormSubmitButton>
          </AlertDialog.Footer>
        </form.AuthFormRoot>
      </form.AppForm>
    </AlertDialog>
  )
}
