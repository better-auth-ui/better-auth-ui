"use client"

import { apiKeyExpirationDaysToSeconds } from "@better-auth-ui/core/plugins"
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
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
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
  const { keyExpiration, localization: apiKeyLocalization } =
    useAuthPlugin(apiKeyPlugin)

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

            <FieldGroup>
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

              {keyExpiration ? (
                <Field>
                  <FieldLabel htmlFor="api-key-expiration">
                    {apiKeyLocalization.expiration}
                  </FieldLabel>

                  <Select
                    name="expiration"
                    defaultValue={
                      keyExpiration.defaultInterval === null
                        ? "never"
                        : String(keyExpiration.defaultInterval)
                    }
                    disabled={isCreating}
                  >
                    <SelectTrigger id="api-key-expiration" className="w-full">
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectGroup>
                        {keyExpiration.intervals.map((days) => (
                          <SelectItem key={days} value={String(days)}>
                            {days.toLocaleString()}{" "}
                            {days === 1
                              ? apiKeyLocalization.day
                              : apiKeyLocalization.days}
                          </SelectItem>
                        ))}

                        {keyExpiration.allowNever ? (
                          <SelectItem value="never">
                            {apiKeyLocalization.never}
                          </SelectItem>
                        ) : null}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
              ) : null}
            </FieldGroup>

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
