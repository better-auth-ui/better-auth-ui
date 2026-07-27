"use client"

import {
  type ApiKeyAuthClient,
  useAuth,
  useAuthPlugin,
  useCreateApiKey
} from "@better-auth-ui/react"
import { Key } from "lucide-react"
import { type SyntheticEvent, useState } from "react"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { apiKeyPlugin } from "@/lib/auth/api-key-plugin"
import { NewApiKeyDialog } from "./new-api-key-dialog"

export type CreateApiKeyDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Create an organization-owned key by passing the organization id. */
  organizationId?: string
}

export function CreateApiKeyDialog({
  open,
  onOpenChange,
  organizationId
}: CreateApiKeyDialogProps) {
  const { authClient, localization } = useAuth()
  const { localization: apiKeyLocalization } = useAuthPlugin(apiKeyPlugin)

  const { mutate: createApiKey, isPending: isCreating } = useCreateApiKey(
    authClient as ApiKeyAuthClient
  )

  const [isNewKeyDialogOpen, setIsNewKeyDialogOpen] = useState(false)
  const [keyName, setKeyName] = useState<string | null>(null)
  const [secretKey, setSecretKey] = useState<string | null>(null)

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setKeyName(null)
      setSecretKey(null)
    }

    onOpenChange(nextOpen)
  }

  const handleNewKeyDialogOpenChange = (nextOpen: boolean) => {
    setIsNewKeyDialogOpen(nextOpen)

    if (!nextOpen) {
      setKeyName(null)
      setSecretKey(null)
    }
  }

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(e.target as HTMLFormElement)
    const name = (formData.get("name") as string).trim()

    const payload =
      name || organizationId
        ? {
            ...(name ? { name } : {}),
            ...(organizationId
              ? { organizationId, configId: "organization" }
              : {})
          }
        : undefined

    createApiKey(payload, {
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
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <DialogHeader>
              <DialogTitle>
                <Key />
                {apiKeyLocalization.createApiKey}
              </DialogTitle>

              <DialogDescription>
                {apiKeyLocalization.apiKeysDescription}
              </DialogDescription>
            </DialogHeader>

            <Field>
              <FieldLabel htmlFor="api-key-name">
                {apiKeyLocalization.name}
              </FieldLabel>

              <Input
                id="api-key-name"
                name="name"
                autoFocus
                placeholder={localization.settings.optional}
                disabled={isCreating}
              />

              <FieldError />
            </Field>

            <DialogFooter>
              <DialogClose
                className={buttonVariants({ variant: "outline" })}
                disabled={isCreating}
                type="button"
              >
                {localization.settings.cancel}
              </DialogClose>

              <Button type="submit" disabled={isCreating}>
                {isCreating && <Spinner />}

                {apiKeyLocalization.createApiKey}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <NewApiKeyDialog
        open={isNewKeyDialogOpen}
        onOpenChange={handleNewKeyDialogOpenChange}
        secretKey={secretKey}
        name={keyName}
      />
    </>
  )
}
