"use client"

import {
  type OrganizationAuthClient,
  useAuth,
  useAuthPlugin,
  useCreateOrganization
} from "@better-auth-ui/react"
import { Briefcase } from "lucide-react"
import { type SyntheticEvent, useEffect, useState } from "react"
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
import { organizationPlugin } from "@/lib/auth/organization-plugin"
import { SlugField, sanitizeSlug } from "./slug-field"

/** Props for the `CreateOrganizationDialog` component. */
export type CreateOrganizationDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateOrganizationDialog({
  open,
  onOpenChange
}: CreateOrganizationDialogProps) {
  const { authClient, localization } = useAuth()
  const { localization: organizationLocalization } =
    useAuthPlugin(organizationPlugin)

  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [slugEdited, setSlugEdited] = useState(false)
  const [nameError, setNameError] = useState<string>()

  const { mutate: createOrganization, isPending: isCreating } =
    useCreateOrganization(authClient as OrganizationAuthClient, {
      onSuccess: () => onOpenChange(false)
    })

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    createOrganization({ name, slug })
  }

  useEffect(() => {
    if (!open) {
      setSlug("")
      setName("")
      setSlugEdited(false)
      setNameError(undefined)
    }
  }, [open])

  useEffect(() => {
    if (slugEdited) return
    setSlug(sanitizeSlug(name))
  }, [name, slugEdited])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <DialogHeader>
            <DialogTitle>
              <Briefcase />
              {organizationLocalization.createOrganization}
            </DialogTitle>

            <DialogDescription>
              {organizationLocalization.organizationsDescription}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <Field data-invalid={!!nameError}>
              <FieldLabel htmlFor="create-organization-name">
                {organizationLocalization.name}
              </FieldLabel>

              <Input
                id="create-organization-name"
                name="name"
                autoFocus
                required
                placeholder={organizationLocalization.namePlaceholder}
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  setNameError(undefined)
                }}
                onInvalid={(e) => {
                  e.preventDefault()
                  setNameError(localization.auth.fieldRequired)
                }}
                aria-invalid={!!nameError}
                disabled={isCreating}
              />

              <FieldError>{nameError}</FieldError>
            </Field>

            <SlugField
              id="create-organization-slug"
              value={slug}
              onChange={(value) => {
                setSlug(value)
                setSlugEdited(true)
              }}
              disabled={isCreating}
            />
          </div>

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

              {organizationLocalization.createOrganization}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
