import type { OrganizationLocalization } from "@better-auth-ui/core/plugins/organization"
import type { OrganizationAuthClient } from "@better-auth-ui/solid"
import { useAuth, useCreateOrganization } from "@better-auth-ui/solid"
import { BriefcaseBusiness, LoaderCircle } from "lucide-solid"
import { createEffect, createSignal } from "solid-js"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { organizationPlugin } from "@/lib/auth/organization-plugin"
import { SlugField, sanitizeSlug } from "./slug-field"

export type CreateOrganizationDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const organizationFallbackLocalization = {
  createOrganization: "Create organization",
  name: "Name",
  namePlaceholder: "Enter the organization name",
  organizationsDescription:
    "Create an organization to collaborate with others and manage shared access."
} satisfies Pick<
  OrganizationLocalization,
  "createOrganization" | "name" | "namePlaceholder" | "organizationsDescription"
>

export function CreateOrganizationDialog(props: CreateOrganizationDialogProps) {
  const auth = useAuth()
  const [name, setName] = createSignal("")
  const [slug, setSlug] = createSignal("")
  const [slugEdited, setSlugEdited] = createSignal(false)
  const createOrganization = useCreateOrganization(
    auth.authClient as OrganizationAuthClient,
    {
      onSuccess: () => props.onOpenChange(false)
    }
  )
  const organizationPluginConfig = () =>
    auth.plugins.find((plugin) => plugin.id === organizationPlugin.id) as
      | { localization?: OrganizationLocalization }
      | undefined
  const localization = () =>
    organizationPluginConfig()?.localization ?? organizationFallbackLocalization

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

  const handleSubmit = (event: SubmitEvent) => {
    event.preventDefault()

    createOrganization.mutate({
      name: name(),
      slug: slug()
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
            <DialogTitle>{localization().createOrganization}</DialogTitle>
            <DialogDescription>
              {localization().organizationsDescription}
            </DialogDescription>
          </DialogHeader>

          <div class="grid gap-2">
            <Label for="create-organization-name">{localization().name}</Label>
            <Input
              autofocus
              disabled={createOrganization.isPending}
              id="create-organization-name"
              name="name"
              onInput={(event) => setName(event.currentTarget.value)}
              placeholder={localization().namePlaceholder}
              required
              value={name()}
            />
          </div>

          <SlugField
            disabled={createOrganization.isPending}
            id="create-organization-slug"
            onChange={(value) => {
              setSlug(value)
              setSlugEdited(true)
            }}
            value={slug()}
          />

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
                  {localization().createOrganization}
                </>
              ) : (
                localization().createOrganization
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
