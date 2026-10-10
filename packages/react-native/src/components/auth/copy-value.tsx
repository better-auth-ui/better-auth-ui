import { useAuth } from "@better-auth-ui/react"
import { copyText } from "../../lib/clipboard"
import { Button } from "../../primitives/button"
import { Box, Txt } from "../../primitives/styled"
import { toast } from "../../primitives/toast"

export function CopyValue({ value, label }: { value: string; label: string }) {
  const { localization } = useAuth()
  return (
    <Box className="gap-2">
      <Txt selectable>{value}</Txt>
      <Button
        size="sm"
        onPress={() => {
          void copyText(value).catch(() =>
            toast.danger(localization.errors.copyFailed)
          )
        }}
      >
        {label}
      </Button>
    </Box>
  )
}
