import type { PhoneNumberAuthClient } from "@better-auth-ui/core/plugins/phone-number"
import {
  useAuth,
  useAuthPlugin,
  useSession,
  useUpdateUser
} from "@better-auth-ui/react"
import { useState } from "react"
import { phoneNumberPlugin } from "@better-auth-ui/core/plugins/phone-number"
import type { CardSlotProps } from "../../../lib/auth-plugin"
import { AlertDialog } from "../../../primitives/alert-dialog"
import { Button } from "../../../primitives/button"
import { Description } from "../../../primitives/description"
import { Box, Txt } from "../../../primitives/styled"
import { toast } from "../../../primitives/toast"
import { PhoneNumberFlow } from "./phone-number-flow"

export function ChangePhoneNumber(props: CardSlotProps) {
  const { authClient } = useAuth<PhoneNumberAuthClient>()
  const { localization } = useAuthPlugin(phoneNumberPlugin)
  const { data: session } = useSession(authClient)
  const user = session?.user
  const phone =
    user && "phoneNumber" in user && typeof user.phoneNumber === "string"
      ? user.phoneNumber
      : undefined
  const [removeOpen, setRemoveOpen] = useState(false)
  const remove = useUpdateUser(authClient, {
    onSuccess: () => {
      setRemoveOpen(false)
      toast.success(localization.phoneNumberRemoved)
    }
  })
  return (
    <Box className="gap-3">
      {phone ? <Txt>{phone}</Txt> : null}
      <PhoneNumberFlow {...props} flow="change" />
      {phone ? (
        <Button
          variant="danger"
          isDisabled={!session}
          onPress={() => setRemoveOpen(true)}
        >
          {localization.removePhoneNumber}
        </Button>
      ) : null}
      <AlertDialog
        isOpen={removeOpen}
        onOpenChange={(open) => {
          if (!remove.isPending) setRemoveOpen(open)
        }}
      >
        <AlertDialog.Header>
          <AlertDialog.Heading>
            {localization.removePhoneNumberTitle}
          </AlertDialog.Heading>
        </AlertDialog.Header>
        <Description>{localization.removePhoneNumberDescription}</Description>
        <AlertDialog.Footer>
          <Button
            isDisabled={remove.isPending}
            onPress={() => setRemoveOpen(false)}
          >
            {localization.cancel}
          </Button>
          <Button
            variant="danger"
            isPending={remove.isPending}
            onPress={() => remove.mutate({ phoneNumber: null })}
          >
            {localization.removePhoneNumber}
          </Button>
        </AlertDialog.Footer>
      </AlertDialog>
    </Box>
  )
}
