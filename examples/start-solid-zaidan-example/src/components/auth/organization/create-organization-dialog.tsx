import { parseAdditionalFieldValue } from "@better-auth-ui/core"
import type { OrganizationAuthClient } from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin } from "@better-auth-ui/solid"
import { useCreateOrganization } from "@better-auth-ui/solid/plugins/organization"
import { BriefcaseBusiness, LoaderCircle } from "lucide-solid"
import { createEffect, createSignal, For } from "solid-js"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { organizationPlugin } from "@/lib/auth/organization-plugin"
import { AdditionalField } from "../additional-field"
import { SlugField, sanitizeSlug } from "./slug-field"

export type CreateOrganizationDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateOrganizationDialog(props: CreateOrganizationDialogProps) {
  const auth = useAuth<OrganizationAuthClient>()
  const config = useAuthPlugin(organizationPlugin)
  const [name, setName] = createSignal("")
  const [slug, setSlug] = createSignal("")
  const [slugEdited, setSlugEdited] = createSignal(false)
  const createOrganization = useCreateOrganization(auth.authClient, () => ({
    onSuccess: () => props.onOpenChange(false)
  }))
  createEffect(() => {
    if (!props.open) {
      setName("")
      setSlug("")
      setSlugEdited(false)
      return
    }

    if (slugEdited()) return

    setSlug(sanitizeSlug(name()))
  })

  const handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget as HTMLFormElement)
    const additionalValues: Record<string, unknown> = {}
    for (const field of config.additionalFields) {
      const value = parseAdditionalFieldValue(
        field,
        formData.get(field.name) as string | null
      )
      await field.validate?.(value)
      if (value !== undefined) additionalValues[field.name] = value
    }
    createOrganization.mutate({
      name: name(),
      slug: slug(),
      ...additionalValues
    })
  }

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent>
        <form class="flex flex-col gap-6" onSubmit={handleSubmit}>
          <DialogHeader>
            <div class="flex size-10 items-center justify-center rounded-md bg-muted">
              <BriefcaseBusiness class="size-4.5" />
            </div>
            <DialogTitle>{config.localization.createOrganization}</DialogTitle>
            <DialogDescription>
              {config.localization.organizationsDescription}
            </DialogDescription>
          </DialogHeader>

          <Field>
            <FieldLabel for="create-organization-name">
              {config.localization.name}
            </FieldLabel>
            <Input
              autofocus
              disabled={createOrganization.isPending}
              id="create-organization-name"
              name="name"
              onInput={(event) => setName(event.currentTarget.value)}
              placeholder={config.localization.namePlaceholder}
              required
              value={name()}
            />
          </Field>

          <SlugField
            disabled={createOrganization.isPending}
            id="create-organization-slug"
            onChange={(value) => {
              setSlug(value)
              setSlugEdited(true)
            }}
            value={slug()}
          />

          <For each={config.additionalFields}>
            {(field) => (
              <AdditionalField
                field={field}
                isPending={createOrganization.isPending}
                name={field.name}
                optionalLabel={auth.localization.settings.optional}
              />
            )}
          </For>

          <DialogFooter>
            <DialogClose
              as={Button}
              disabled={createOrganization.isPending}
              type="button"
              variant="outline"
            >
              {auth.localization.settings.cancel}
            </DialogClose>
            <Button disabled={createOrganization.isPending} type="submit">
              {createOrganization.isPending ? (
                <>
                  <LoaderCircle class="size-4 animate-spin" />
                  {config.localization.createOrganization}
                </>
              ) : (
                config.localization.createOrganization
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
