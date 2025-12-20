import { type AnyAuthConfig, useAuth } from "@better-auth-ui/react"
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
  TextField
} from "@heroui/react"
import { UserAvatar } from "../../user/user-avatar"

export type UserProfileProps = AnyAuthConfig & {
  className?: string
}

export function UserProfile({ className, ...config }: UserProfileProps) {
  const { authClient } = useAuth(config)

  const { data: sessionData, isPending } = authClient.useSession()

  return (
    <Card className="p-4 md:p-6">
      <Form>
        <Fieldset className="w-full">
          {isPending ? (
            <Skeleton className="h-7 w-16 rounded-xl" />
          ) : (
            <>
              <Fieldset.Legend className="text-xl">Profile</Fieldset.Legend>
              <Description />
            </>
          )}

          <div className="flex items-center gap-3">
            <Button
              isIconOnly
              variant="ghost"
              className="p-0 h-auto w-auto rounded-full"
            >
              <UserAvatar size="lg" />

              {!isPending && (
                <span className="absolute right-0 bottom-0 size-3.5 rounded-full bg-background ring-2 ring-surface-quaternary flex items-center justify-center">
                  <PencilIcon className="size-2 text-muted" />
                </span>
              )}
            </Button>

            <div className="flex flex-col gap-1">
              {isPending ? (
                <>
                  <Skeleton className="h-4 mt-0.5 w-24 rounded-lg" />
                  <Skeleton className="h-3.5 mt-0.5 w-32 rounded-lg" />
                </>
              ) : (
                <>
                  <p className="text-sm font-medium leading-5">
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
                </>
              )}
            </div>
          </div>

          <Fieldset.Group>
            <TextField
              key={sessionData?.user?.name}
              name="name"
              defaultValue={sessionData?.user?.name}
            >
              {isPending ? (
                <Skeleton className="h-4 w-16 my-0.5 rounded-lg" />
              ) : (
                <Label>Name</Label>
              )}

              {isPending ? (
                <Skeleton className="h-9 w-full rounded-xl" />
              ) : (
                <Input placeholder="Name" />
              )}

              <FieldError />
            </TextField>
          </Fieldset.Group>

          <Fieldset.Actions>
            {isPending ? (
              <Skeleton className="h-10 md:h-9 w-36 rounded-full" />
            ) : (
              <Button type="submit" isPending={isPending}>
                <CheckIcon className="size-4" />
                Save changes
              </Button>
            )}
          </Fieldset.Actions>
        </Fieldset>
      </Form>
    </Card>
  )
}
