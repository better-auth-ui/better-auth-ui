import { apiKeyExpirationDaysToSeconds } from "@better-auth-ui/core/plugins"
import {
  type ApiKeyAuthClient,
  useAuth,
  useAuthPlugin,
  useCreateApiKey
} from "@better-auth-ui/react"
import { Key } from "@gravity-ui/icons"
import {
  AlertDialog,
  Button,
  FieldError,
  Form,
  Input,
  Label,
  ListBox,
  Select,
  Spinner,
  TextField
} from "@heroui/react"
import { type SyntheticEvent, useState } from "react"

import { apiKeyPlugin } from "../../../lib/auth/api-key-plugin"

import { NewApiKeyDialog } from "./new-api-key-dialog"

export type CreateApiKeyDialogProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  /** Create an organization-owned key by passing the organization id. */
  organizationId?: string
}

export function CreateApiKeyDialog({
  isOpen,
  onOpenChange,
  organizationId
}: CreateApiKeyDialogProps) {
  const { authClient, localization } = useAuth()
  const { keyExpiration, localization: apiKeyLocalization } =
    useAuthPlugin(apiKeyPlugin)

  const { mutate: createApiKey, isPending: isCreating } = useCreateApiKey(
    authClient as ApiKeyAuthClient
  )

  const [isNewKeyDialogOpen, setIsNewKeyDialogOpen] = useState(false)
  const [keyName, setKeyName] = useState<string | null>(null)
  const [secretKey, setSecretKey] = useState<string | null>(null)

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setKeyName(null)
      setSecretKey(null)
    }

    onOpenChange(open)
  }

  const handleNewKeyDialogOpenChange = (open: boolean) => {
    setIsNewKeyDialogOpen(open)

    if (!open) {
      setKeyName(null)
      setSecretKey(null)
    }
  }

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(e.target as HTMLFormElement)
    const name = (formData.get("name") as string)?.trim()
    const expiration = formData.get("expiration")
    const expirationDays =
      typeof expiration === "string" && expiration !== "never"
        ? Number(expiration)
        : undefined
    const expiresIn = expirationDays
      ? apiKeyExpirationDaysToSeconds(expirationDays)
      : undefined

    const payload = {
      ...(name ? { name } : {}),
      ...(expiresIn ? { expiresIn } : {}),
      ...(organizationId ? { organizationId, configId: "organization" } : {})
    }

    createApiKey(Object.keys(payload).length > 0 ? payload : undefined, {
      onSuccess: (result) => {
        handleOpenChange(false)
        setKeyName(name)
        setSecretKey(result.key)
        setIsNewKeyDialogOpen(true)
      }
    })
  }

  return (
    <>
      <AlertDialog.Backdrop isOpen={isOpen} onOpenChange={handleOpenChange}>
        <AlertDialog.Container>
          <AlertDialog.Dialog>
            <Form onSubmit={handleSubmit}>
              <AlertDialog.CloseTrigger />

              <AlertDialog.Header>
                <AlertDialog.Icon status="default">
                  <Key />
                </AlertDialog.Icon>

                <AlertDialog.Heading>
                  {apiKeyLocalization.createApiKey}
                </AlertDialog.Heading>
              </AlertDialog.Header>

              <AlertDialog.Body className="overflow-visible">
                <p className="text-muted text-sm">
                  {apiKeyLocalization.apiKeysDescription}
                </p>

                <div className="mt-4 flex flex-col gap-4">
                  <TextField id="name" name="name" isDisabled={isCreating}>
                    <Label>{apiKeyLocalization.name}</Label>

                    <Input
                      autoFocus
                      placeholder={localization.settings.optional}
                      variant="secondary"
                    />

                    <FieldError />
                  </TextField>

                  {keyExpiration ? (
                    <Select
                      defaultValue={
                        keyExpiration.defaultInterval === null
                          ? "never"
                          : String(keyExpiration.defaultInterval)
                      }
                      fullWidth
                      isDisabled={isCreating}
                      name="expiration"
                      variant="secondary"
                    >
                      <Label>{apiKeyLocalization.expiration}</Label>

                      <Select.Trigger>
                        <Select.Value />
                        <Select.Indicator />
                      </Select.Trigger>

                      <Select.Popover>
                        <ListBox>
                          {keyExpiration.intervals.map((days) => (
                            <ListBox.Item
                              id={String(days)}
                              key={days}
                              textValue={`${days.toLocaleString()} ${
                                days === 1
                                  ? apiKeyLocalization.day
                                  : apiKeyLocalization.days
                              }`}
                            >
                              {days.toLocaleString()}{" "}
                              {days === 1
                                ? apiKeyLocalization.day
                                : apiKeyLocalization.days}
                              <ListBox.ItemIndicator />
                            </ListBox.Item>
                          ))}

                          {keyExpiration.allowNever ? (
                            <ListBox.Item
                              id="never"
                              textValue={apiKeyLocalization.never}
                            >
                              {apiKeyLocalization.never}
                              <ListBox.ItemIndicator />
                            </ListBox.Item>
                          ) : null}
                        </ListBox>
                      </Select.Popover>
                    </Select>
                  ) : null}
                </div>
              </AlertDialog.Body>

              <AlertDialog.Footer>
                <Button slot="close" variant="tertiary" isDisabled={isCreating}>
                  {localization.settings.cancel}
                </Button>

                <Button type="submit" isPending={isCreating}>
                  {isCreating && <Spinner color="current" size="sm" />}

                  {apiKeyLocalization.createApiKey}
                </Button>
              </AlertDialog.Footer>
            </Form>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>

      <NewApiKeyDialog
        isOpen={isNewKeyDialogOpen}
        onOpenChange={handleNewKeyDialogOpenChange}
        secretKey={secretKey}
        name={keyName}
      />
    </>
  )
}
