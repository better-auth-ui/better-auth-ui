import type { OrganizationAuthClient } from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useCreateOrganization } from "@better-auth-ui/react/plugins/organization"
import { Briefcase } from "@gravity-ui/icons"
import {
  AlertDialog,
  Button,
  FieldError,
  Form,
  Input,
  Label,
  Spinner,
  TextField
} from "@heroui/react"
import { type SyntheticEvent, useEffect, useState } from "react"

import { organizationPlugin } from "../../../lib/auth/organization-plugin"
import { SlugField, sanitizeSlug } from "./slug-field"

/** Props for the {@link CreateOrganizationDialog} component. */
export type CreateOrganizationDialogProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Render a dialog for creating a new organization.
 *
 * @param isOpen - Whether the dialog is open
 * @param onOpenChange - Callback for when the dialog open state changes
 * @returns The create organization dialog as a JSX element
 */
export function CreateOrganizationDialog({
  isOpen,
  onOpenChange
}: CreateOrganizationDialogProps) {
  const { authClient, localization } = useAuth()
  const { localization: organizationLocalization } =
    useAuthPlugin(organizationPlugin)

  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [slugEdited, setSlugEdited] = useState(false)

  const { mutate: createOrganization, isPending: isCreating } =
    useCreateOrganization(authClient as OrganizationAuthClient, {
      onSuccess: () => onOpenChange(false)
    })

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    createOrganization({ name, slug })
  }

  useEffect(() => {
    if (!isOpen) {
      setSlug("")
      setName("")
      setSlugEdited(false)
    }
  }, [isOpen])

  useEffect(() => {
    if (slugEdited) return
    setSlug(sanitizeSlug(name))
  }, [name, slugEdited])

  return (
    <AlertDialog.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <AlertDialog.Container>
        <AlertDialog.Dialog>
          <Form onSubmit={handleSubmit}>
            <AlertDialog.CloseTrigger />

            <AlertDialog.Header>
              <AlertDialog.Icon status="default">
                <Briefcase />
              </AlertDialog.Icon>

              <AlertDialog.Heading>
                {organizationLocalization.createOrganization}
              </AlertDialog.Heading>
            </AlertDialog.Header>

            <AlertDialog.Body className="flex flex-col gap-4 overflow-visible">
              <p className="text-muted text-sm">
                {organizationLocalization.organizationsDescription}
              </p>

              <TextField
                id="name"
                name="name"
                isDisabled={isCreating}
                value={name}
                onChange={setName}
                validate={(value) => {
                  if (!value) return localization.auth.fieldRequired
                }}
              >
                <Label>{organizationLocalization.name}</Label>

                <Input
                  required
                  autoFocus
                  placeholder={organizationLocalization.namePlaceholder}
                  variant="secondary"
                />

                <FieldError />
              </TextField>

              <SlugField
                value={slug}
                onChange={(value) => {
                  setSlug(value)
                  setSlugEdited(true)
                }}
                isDisabled={isCreating}
                variant="secondary"
              />
            </AlertDialog.Body>

            <AlertDialog.Footer>
              <Button slot="close" variant="tertiary" isDisabled={isCreating}>
                {localization.settings.cancel}
              </Button>

              <Button type="submit" isPending={isCreating}>
                {isCreating && <Spinner color="current" size="sm" />}

                {organizationLocalization.createOrganization}
              </Button>
            </AlertDialog.Footer>
          </Form>
        </AlertDialog.Dialog>
      </AlertDialog.Container>
    </AlertDialog.Backdrop>
  )
}
