import { parseAdditionalFieldValue } from "@better-auth-ui/core"
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
  TextField,
  toast
} from "@heroui/react"
import { type SyntheticEvent, useEffect, useRef, useState } from "react"

import { organizationPlugin } from "../../../lib/auth/organization-plugin"
import { AdditionalField } from "../additional-field"
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
  const { additionalFields, localization: organizationLocalization } =
    useAuthPlugin(organizationPlugin)

  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [slugEdited, setSlugEdited] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const submissionLocked = useRef(false)
  const submissionGeneration = useRef(0)

  const { mutate: createOrganization, isPending: isCreating } =
    useCreateOrganization(authClient as OrganizationAuthClient)

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (submissionLocked.current) return

    const generation = ++submissionGeneration.current
    submissionLocked.current = true
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    const additionalValues: Record<string, unknown> = {}
    try {
      for (const field of additionalFields) {
        const value = parseAdditionalFieldValue(
          field,
          formData.get(field.name) as string | null
        )
        await field.validate?.(value)
        if (value !== undefined) additionalValues[field.name] = value
      }
    } catch (error) {
      if (generation !== submissionGeneration.current) return

      submissionLocked.current = false
      setIsSubmitting(false)
      toast.danger(error instanceof Error ? error.message : String(error))
      return
    }

    if (generation !== submissionGeneration.current) return

    createOrganization(
      { name, slug, ...additionalValues },
      {
        onSuccess: () => {
          if (generation === submissionGeneration.current) onOpenChange(false)
        },
        onSettled: () => {
          if (generation !== submissionGeneration.current) return

          submissionLocked.current = false
          setIsSubmitting(false)
        }
      }
    )
  }

  const isPending = isCreating || isSubmitting

  useEffect(() => {
    if (!isOpen) {
      submissionGeneration.current += 1
      submissionLocked.current = false
      setIsSubmitting(false)
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
                isDisabled={isPending}
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
                isDisabled={isPending}
                variant="secondary"
              />
              {additionalFields.map((field) => (
                <AdditionalField
                  field={field}
                  isPending={isPending}
                  key={field.name}
                  name={field.name}
                  optionalLabel={localization.settings.optional}
                />
              ))}
            </AlertDialog.Body>

            <AlertDialog.Footer>
              <Button slot="close" variant="tertiary" isDisabled={isPending}>
                {localization.settings.cancel}
              </Button>

              <Button type="submit" isPending={isPending}>
                {isPending && <Spinner color="current" size="sm" />}

                {organizationLocalization.createOrganization}
              </Button>
            </AlertDialog.Footer>
          </Form>
        </AlertDialog.Dialog>
      </AlertDialog.Container>
    </AlertDialog.Backdrop>
  )
}
