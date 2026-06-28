import { fileToBase64 } from "@better-auth-ui/core"
import type {
  OrganizationAuthClient,
  OrganizationLocalization
} from "@better-auth-ui/core/plugins/organization"
import { useAuth } from "@better-auth-ui/solid"
import {
  useActiveOrganization,
  useUpdateOrganization
} from "@better-auth-ui/solid/plugins/organization"
import { Trash2, Upload } from "lucide-solid"
import { createSignal, Show } from "solid-js"
import { toast } from "solid-sonner"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { organizationPlugin } from "@/lib/auth/organization-plugin"
import { OrganizationLogo } from "./organization-logo"

export type ChangeOrganizationLogoProps = {
  class?: string
}

type LogoConfig = {
  enabled?: boolean
  resize?: (file: File, size?: number, extension?: string) => Promise<File>
  size?: number
  extension?: string
  upload?: (file: File) => Promise<string>
  delete?: (url: string) => Promise<void>
}

const fallbackLocalization = {
  logo: "Logo",
  changeLogo: "Change logo",
  uploadLogo: "Upload logo",
  deleteLogo: "Delete logo",
  logoChangedSuccess: "Logo updated successfully",
  logoDeletedSuccess: "Logo removed successfully"
} satisfies Pick<
  OrganizationLocalization,
  | "logo"
  | "changeLogo"
  | "uploadLogo"
  | "deleteLogo"
  | "logoChangedSuccess"
  | "logoDeletedSuccess"
>

export function ChangeOrganizationLogo(props: ChangeOrganizationLogoProps) {
  const auth = useAuth<OrganizationAuthClient>()
  const activeOrganization = useActiveOrganization(auth.authClient)
  const updateOrganization = useUpdateOrganization(auth.authClient)
  const [isUploadingLogo, setIsUploadingLogo] = createSignal(false)
  const [isDeletingLogo, setIsDeletingLogo] = createSignal(false)
  let logoFileInput: HTMLInputElement | undefined
  const organizationPluginConfig = () =>
    auth.plugins.find((plugin) => plugin.id === organizationPlugin.id) as
      | { logo?: LogoConfig; localization?: OrganizationLocalization }
      | undefined
  const logo = () => organizationPluginConfig()?.logo ?? { enabled: true }
  const localization = () =>
    organizationPluginConfig()?.localization ?? fallbackLocalization
  const isPending = () =>
    activeOrganization.isPending ||
    updateOrganization.isPending ||
    isUploadingLogo() ||
    isDeletingLogo()

  const handleLogoFileChange = async (event: Event) => {
    const input = event.currentTarget as HTMLInputElement
    const file = input.files?.[0]

    if (!file) return

    input.value = ""
    setIsUploadingLogo(true)

    try {
      const resized =
        (await logo().resize?.(file, logo().size, logo().extension)) || file
      const image =
        (await logo().upload?.(resized)) || (await fileToBase64(resized))

      updateOrganization.mutate(
        { data: { logo: image } },
        {
          onSuccess: () => toast.success(localization().logoChangedSuccess)
        }
      )
    } catch (error) {
      if (error instanceof Error) toast.error(error.message)
    } finally {
      setIsUploadingLogo(false)
    }
  }

  const deleteLogo = () => {
    const currentLogo = activeOrganization.data?.logo?.trim()

    updateOrganization.mutate(
      { data: { logo: "" } },
      {
        onSuccess: async () => {
          if (currentLogo) {
            setIsDeletingLogo(true)
            try {
              await logo().delete?.(currentLogo)
            } finally {
              setIsDeletingLogo(false)
            }
          }

          toast.success(localization().logoDeletedSuccess)
        }
      }
    )
  }

  return (
    <Show when={logo().enabled !== false}>
      <div class={props.class ?? "grid gap-2"}>
        <Label>{localization().logo}</Label>
        <input
          accept="image/*"
          class="hidden"
          onChange={handleLogoFileChange}
          ref={logoFileInput}
          type="file"
        />
        <div class="flex items-center gap-4">
          <Button
            class="h-auto w-auto rounded-full p-0"
            disabled={isPending()}
            onClick={() => logoFileInput?.click()}
            type="button"
            variant="ghost"
          >
            <OrganizationLogo
              isPending={activeOrganization.isPending}
              organization={activeOrganization.data}
              size="lg"
            />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger
              as={Button}
              class=""
              disabled={!activeOrganization.data || isPending()}
              size="sm"
              variant="secondary"
            >
              {localization().changeLogo}
            </DropdownMenuTrigger>
            <DropdownMenuContent class="min-w-fit">
              <DropdownMenuItem onSelect={() => logoFileInput?.click()}>
                <Upload class="text-muted-foreground" />
                {localization().uploadLogo}
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={!activeOrganization.data?.logo}
                onSelect={deleteLogo}
                variant="destructive"
              >
                <Trash2 />
                {localization().deleteLogo}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Show>
  )
}
