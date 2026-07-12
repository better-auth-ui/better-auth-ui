import {
  type OrganizationAuthClient,
  useAuth,
  useAuthPlugin,
  useCheckSlug,
  useCreateOrganization
} from "@better-auth-ui/react"
import { useDebouncer } from "@tanstack/react-pacer"
import { useEffect, useState } from "react"

import { organizationPlugin } from "../../../lib/auth/organization-plugin"
import { useThemeColors } from "../../../lib/theme-colors"
import { AlertDialog } from "../../../primitives/alert-dialog"
import { Button } from "../../../primitives/button"
import { FieldError, Label, TextField } from "../../../primitives/field"
import { Form } from "../../../primitives/form"
import { Input, InputGroup } from "../../../primitives/input"
import { Spinner } from "../../../primitives/spinner"
import { Txt } from "../../../primitives/styled"
import { Briefcase, Check, Xmark } from "../../../primitives/ui-icons"

/** Props for the {@link CreateOrganizationDialog} component. */
export type CreateOrganizationDialogProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Sanitize a slug value so it only contains lowercase alphanumeric characters
 * and dashes. Runs of disallowed characters are collapsed to a single dash,
 * mirroring the heroui `sanitizeSlug` helper from `slug-field.tsx`.
 */
function sanitizeSlug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-")
}

/**
 * Render a dialog for creating a new organization.
 *
 * Mirrors the heroui `CreateOrganizationDialog`, adapted for React Native:
 * the dialog shell is the RN `AlertDialog` primitive (controlled `isOpen`),
 * `name`/`slug` are controlled state (no `FormData`), and the debounced slug
 * availability check (heroui's `SlugField`) is inlined here via `InputGroup`
 * since RN has no separate shared `SlugField` component yet — matching the
 * pattern already established in the RN `OrganizationProfile` port.
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
  const {
    localization: organizationLocalization,
    checkSlug: checkSlugEnabled,
    slugPrefix
  } = useAuthPlugin(organizationPlugin)

  const colors = useThemeColors()

  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [slugEdited, setSlugEdited] = useState(false)

  const { mutate: createOrganization, isPending: isCreating } =
    useCreateOrganization(authClient as OrganizationAuthClient, {
      onSuccess: () => onOpenChange(false)
    })

  const {
    mutate: checkSlug,
    data: checkSlugData,
    error: checkSlugError,
    reset: resetCheckSlug
  } = useCheckSlug(authClient as OrganizationAuthClient)

  const debouncer = useDebouncer(
    (value: string) => {
      if (!checkSlugEnabled || !value.trim()) return
      checkSlug({ slug: value.trim() })
    },
    { wait: 500 }
  )

  const handleSubmit = () => {
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

  useEffect(() => {
    if (!checkSlugEnabled) return

    resetCheckSlug()
    debouncer.maybeExecute(slug)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkSlugEnabled, slug, debouncer.maybeExecute, resetCheckSlug])

  const isCheckingSlug = checkSlugEnabled && !!slug.trim()

  return (
    <AlertDialog isOpen={isOpen} onOpenChange={onOpenChange}>
      <Form onSubmit={handleSubmit} className="gap-4">
        <AlertDialog.CloseTrigger />

        <AlertDialog.Header>
          <AlertDialog.Icon status="default">
            <Briefcase width={20} height={20} color={colors.foreground} />
          </AlertDialog.Icon>

          <AlertDialog.Heading>
            {organizationLocalization.createOrganization}
          </AlertDialog.Heading>
        </AlertDialog.Header>

        <AlertDialog.Body contentClassName="gap-4">
          <Txt className="text-sm text-muted">
            {organizationLocalization.organizationsDescription}
          </Txt>

          <TextField
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
              placeholder={organizationLocalization.namePlaceholder}
              variant="secondary"
              required
            />

            <FieldError />
          </TextField>

          <TextField
            name="slug"
            isDisabled={isCreating}
            value={slug}
            onChange={(value) => {
              setSlug(sanitizeSlug(value))
              setSlugEdited(true)
            }}
            validate={(value) => {
              if (!value) return localization.auth.fieldRequired
            }}
          >
            <Label>{organizationLocalization.slug}</Label>

            <InputGroup variant="secondary">
              {slugPrefix && (
                <InputGroup.Prefix>
                  <Txt className="text-muted">{slugPrefix}</Txt>
                </InputGroup.Prefix>
              )}

              <InputGroup.Input
                placeholder={organizationLocalization.slugPlaceholder}
                required
              />

              {isCheckingSlug && (
                <InputGroup.Suffix>
                  {checkSlugData?.status ? (
                    <Check width={16} height={16} color={colors.accent} />
                  ) : checkSlugError ? (
                    <Xmark width={16} height={16} color={colors.danger} />
                  ) : (
                    <Spinner size="sm" />
                  )}
                </InputGroup.Suffix>
              )}
            </InputGroup>

            <FieldError />
          </TextField>
        </AlertDialog.Body>

        <AlertDialog.Footer>
          <Button
            variant="tertiary"
            isDisabled={isCreating}
            onPress={() => onOpenChange(false)}
          >
            {localization.settings.cancel}
          </Button>

          <Button type="submit" isPending={isCreating}>
            {isCreating && <Spinner color="current" size="sm" />}
            {organizationLocalization.createOrganization}
          </Button>
        </AlertDialog.Footer>
      </Form>
    </AlertDialog>
  )
}
