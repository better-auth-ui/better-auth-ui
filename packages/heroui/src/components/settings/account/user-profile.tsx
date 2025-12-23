import { type AnyAuthConfig, useUpdateUser } from "@better-auth-ui/react"
import { FloppyDisk, Pencil } from "@gravity-ui/icons"
import {
  Button,
  Card,
  cn,
  FieldError,
  Fieldset,
  Form,
  Input,
  Label,
  Skeleton,
  Spinner,
  TextField
} from "@heroui/react"

import { useAuth } from "../../../hooks/use-auth"
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
  const context = useAuth(config)
  const { authClient, localization } = context

  const { data: sessionData } = authClient.useSession()

  const [state, formAction, isPending] = useUpdateUser(context)

  return (
    <Card className={cn("p-4 md:p-6 gap-4 md:gap-6", className)}>
      <Card.Header>
        <Card.Title className="text-xl">
          {localization.settings.profile}
        </Card.Title>
      </Card.Header>

      <Form action={formAction}>
        <Fieldset className="w-full gap-4 md:gap-6">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              isIconOnly
              variant="ghost"
              className="p-0 h-auto w-auto rounded-full"
              isDisabled={!sessionData}
            >
              <UserAvatar {...config} size="lg" />

              <span className="absolute right-0 bottom-0 size-3.5 rounded-full bg-background ring-2 ring-surface-quaternary flex items-center justify-center">
                <Pencil className="size-2.5 text-muted" />
              </span>
            </Button>

            {sessionData ? (
              <div className="flex flex-col">
                <p className="text-sm font-medium">
                  {sessionData?.user?.displayUsername ||
                    sessionData?.user?.name ||
                    sessionData?.user?.email}
                </p>

                {(sessionData?.user?.displayUsername ||
                  sessionData?.user?.name) && (
                  <p className="text-muted text-xs">
                    {sessionData?.user?.email}
                  </p>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <Skeleton className="h-4 mt-0.5 w-24 rounded-lg" />
                <Skeleton className="h-3 mt-0.5 w-32 rounded-lg" />
              </div>
            )}
          </div>

          <Fieldset.Group>
            <TextField
              key={sessionData?.user?.name}
              name="name"
              defaultValue={sessionData?.user?.name || state.name}
              isDisabled={isPending || !sessionData}
            >
              <Label>{localization.auth.name}</Label>

              {sessionData ? (
                <Input
                  autoComplete="name"
                  placeholder={localization.auth.name}
                />
              ) : (
                <Skeleton className="h-10 md:h-9 w-full rounded-xl" />
              )}

              <FieldError />
            </TextField>
          </Fieldset.Group>

          <Fieldset.Actions>
            <Button
              type="submit"
              isPending={isPending}
              isDisabled={!sessionData}
            >
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
