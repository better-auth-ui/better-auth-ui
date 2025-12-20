import {
  type AnyAuthConfig,
  useAuth,
  useUpdateUser
} from "@better-auth-ui/react"
import { CheckIcon, PencilIcon } from "@heroicons/react/24/outline"
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

          <div className="flex items-center gap-3">
            <Button
              type="button"
              isIconOnly
              variant="ghost"
              className="p-0 h-auto w-auto rounded-full"
            >
              <UserAvatar size="lg" />

              <span className="absolute right-0 bottom-0 size-3.5 rounded-full bg-background ring-2 ring-surface-quaternary flex items-center justify-center">
                <PencilIcon className="size-2 text-muted" />
              </span>
            </Button>

            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium">
                {sessionData?.user?.displayUsername ||
                  sessionData?.user?.name ||
                  sessionData?.user?.email}
              </p>

              {(sessionData?.user?.displayUsername ||
                sessionData?.user?.name) && (
                <p className="text-muted text-xs leading-none">
                  {sessionData?.user?.email}
                </p>
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
                <CheckIcon className="size-4" />
              )}
              {localization.settings.saveChanges}
            </Button>
          </Fieldset.Actions>
        </Fieldset>
      </Form>
    </Card>
  )
}

function UserProfileSkeleton() {
  return (
    <Card className="p-4 md:p-6 gap-4 md:gap-6">
      <Skeleton className="h-7 w-16 rounded-xl" />

      <div className="flex items-center gap-3">
        <Skeleton className="size-12 rounded-full" />

        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-4 mt-0.5 w-24 rounded-lg" />
          <Skeleton className="h-3 mt-0.5 w-32 rounded-lg" />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <Skeleton className="h-4 w-12 my-0.5 rounded-lg" />
        <Skeleton className="h-9 w-full rounded-xl" />
      </div>

      <Skeleton className="h-10 md:h-9 w-36 rounded-full mt-1" />
    </Card>
  )
}
