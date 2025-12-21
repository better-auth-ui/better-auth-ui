import {
  type AnyAuthConfig,
  useAuth,
  useUpdateUser
} from "@better-auth-ui/react"
import { FloppyDisk, Pencil } from "@gravity-ui/icons"
import {
  Button,
  Card,
  Description,
  FieldError,
  Fieldset,
  Form,
  Input,
  Label,
  Skeleton,
  Spinner,
  TextField
} from "@heroui/react"

import { UserAvatar } from "../../user/user-avatar"

export type UserProfileProps = AnyAuthConfig & {
  className?: string
}

/**
 * Display and edit the authenticated user's profile in a card-based form.
 *
 * Renders a loading skeleton while the session is pending. When loaded, shows the user's avatar with an edit indicator, the best-available identifier (displayUsername, name, or email) with a conditional email line, a name input prefilled from the session or local state, and a submit button that reflects update pending state. Labels and texts come from the provided auth localization; the form action is wired to the update user action from the auth hooks.
 *
 * @returns A JSX element containing the profile card and editable form
 */
export function UserProfile({ className, ...config }: UserProfileProps) {
  const { authClient, localization } = useAuth(config)

  const { data: sessionData, isPending: isSessionPending } =
    authClient.useSession()

  const [state, formAction, isPending] = useUpdateUser(config)

  if (isSessionPending) {
    return <UserProfileSkeleton />
  }

  return (
    <Card className="p-4 md:p-6">
      <Form action={formAction}>
        <Fieldset className="w-full gap-4 md:gap-6">
          <Fieldset.Legend className="text-xl">
            {localization.settings.profile}
          </Fieldset.Legend>

          <Description />

          <div className="flex items-center gap-2">
            <Button
              type="button"
              isIconOnly
              variant="ghost"
              className="p-0 h-auto w-auto rounded-full"
            >
              <UserAvatar {...config} size="lg" />

              <span className="absolute right-0 bottom-0 size-3.5 rounded-full bg-background ring-2 ring-surface-quaternary flex items-center justify-center">
                <Pencil className="size-2.5 text-muted" />
              </span>
            </Button>

            <div className="flex flex-col">
              <p className="text-sm font-medium">
                {sessionData?.user?.displayUsername ||
                  sessionData?.user?.name ||
                  sessionData?.user?.email}
              </p>

              {(sessionData?.user?.displayUsername ||
                sessionData?.user?.name) && (
                <p className="text-muted text-xs">{sessionData?.user?.email}</p>
              )}
            </div>
          </div>

          <Fieldset.Group>
            <TextField
              name="name"
              defaultValue={sessionData?.user?.name || state.name}
              isDisabled={isPending}
            >
              <Label>{localization.auth.name}</Label>

              <Input placeholder={localization.auth.name} />

              <FieldError />
            </TextField>
          </Fieldset.Group>

          <Fieldset.Actions>
            <Button type="submit" isPending={isPending}>
              {isPending ? (
                <Spinner color="current" size="sm" />
              ) : (
                <FloppyDisk />
              )}
              {localization.settings.saveChanges}
            </Button>
          </Fieldset.Actions>
        </Fieldset>
      </Form>
    </Card>
  )
}

/**
 * Renders a skeleton placeholder that matches the UserProfile layout while data is loading.
 *
 * Displays placeholder elements for the profile header, avatar, user text lines, name field, and action button to indicate loading state.
 *
 * @returns A Card element containing skeleton UI blocks that visually represent the user profile form during loading.
 */
function UserProfileSkeleton() {
  return (
    <Card className="p-4 md:p-6 gap-4 md:gap-6">
      <Skeleton className="h-7 w-16 rounded-xl" />

      <div className="flex items-center gap-2">
        <Skeleton className="size-12 rounded-full" />

        <div className="flex flex-col gap-1">
          <Skeleton className="h-4 mt-0.5 w-24 rounded-lg" />
          <Skeleton className="h-3 mt-0.5 w-32 rounded-lg" />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <Skeleton className="h-4 w-12 my-0.5 rounded-lg" />
        <Skeleton className="h-10 md:h-9 w-full rounded-xl" />
      </div>

      <Skeleton className="h-10 md:h-9 w-36 rounded-full mt-1" />
    </Card>
  )
}
