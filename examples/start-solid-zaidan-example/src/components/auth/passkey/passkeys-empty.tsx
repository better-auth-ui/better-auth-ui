import { useAuth } from "@better-auth-ui/solid"
import { Fingerprint } from "lucide-solid"
import { passkeyLabels } from "@/components/auth/passkey/passkey-localization"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty"

export function PasskeysEmpty(props: { onAddPress: () => void }) {
  const auth = useAuth()
  const labels = () => passkeyLabels(auth)

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Fingerprint />
        </EmptyMedia>
        <EmptyTitle>{labels().noPasskeys}</EmptyTitle>
        <EmptyDescription>{labels().passkeysDescription}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button onClick={props.onAddPress} size="sm" type="button">
          {labels().addPasskey}
        </Button>
      </EmptyContent>
    </Empty>
  )
}
