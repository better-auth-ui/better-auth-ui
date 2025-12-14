import { type AnyAuthConfig, useAuth } from "@better-auth-ui/react"
import {
  ArrowRightEndOnRectangleIcon,
  ArrowRightStartOnRectangleIcon,
  ChevronUpDownIcon,
  UserPlusIcon
} from "@heroicons/react/24/outline"
import { Button, cn, Dropdown, Label, Skeleton } from "@heroui/react"

import { UserAvatar } from "./user-avatar"

export type UserButtonProps = AnyAuthConfig & {
  className?: string
  size?: "default" | "icon"
  placement?:
    | "bottom"
    | "bottom left"
    | "bottom right"
    | "bottom start"
    | "bottom end"
    | "top"
    | "top left"
    | "top right"
    | "top start"
    | "top end"
    | "left"
    | "left top"
    | "left bottom"
    | "start"
    | "start top"
    | "start bottom"
    | "right"
    | "right top"
    | "right bottom"
    | "end"
    | "end top"
    | "end bottom"
  variant?:
    | "ghost"
    | "primary"
    | "secondary"
    | "tertiary"
    | "danger"
    | "danger-soft"
}

export function UserButton({
  className,
  placement = "bottom",
  size = "default",
  variant = "ghost",
  ...config
}: UserButtonProps) {
  const { authClient, basePaths, viewPaths, localization, Link } =
    useAuth(config)

  const { data: sessionData, isPending } = authClient.useSession()

  const user = sessionData?.user

  return (
    <Dropdown>
      {size === "icon" ? (
        <Dropdown.Trigger className={cn(className)}>
          <UserAvatar {...config} />
        </Dropdown.Trigger>
      ) : (
        <Button
          variant={variant}
          className={cn("h-auto font-normal justify-start p-2", className)}
        >
          <UserAvatar {...config} />

          {isPending ? (
            <div className="flex flex-col gap-1 text-left">
              <Skeleton className="h-4 w-24 rounded-lg" />
              <Skeleton className="h-3 w-32 rounded-lg" />
            </div>
          ) : user ? (
            <div className="flex flex-col gap-0 text-left">
              <p className="text-sm font-medium leading-5">
                {user.displayUsername || user.name || user.email}
              </p>

              {(user.displayUsername || user.name) && (
                <p className="text-muted text-xs leading-none">{user.email}</p>
              )}
            </div>
          ) : (
            <p className="text-sm font-medium leading-5">
              {localization.auth.account}
            </p>
          )}

          <ChevronUpDownIcon className="ml-auto size-4" />
        </Button>
      )}

      <Dropdown.Popover placement={placement}>
        {user && (
          <div className="px-3 pb-1 pt-3">
            <div className="flex items-center gap-2">
              <UserAvatar {...config} />

              <div className="flex flex-col gap-0">
                <p className="text-sm font-medium leading-5">
                  {user.displayUsername || user.name || user.email}
                </p>

                {(user.displayUsername || user.name) && (
                  <p className="text-muted text-xs leading-none">
                    {user.email}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <Dropdown.Menu>
          {user ? (
            <Dropdown.Item
              textValue={localization.auth.signOut}
              variant="danger"
              className="!p-0"
            >
              <Link
                href={`${basePaths.auth}/${viewPaths.auth.signOut}`}
                className="p-2 flex w-full items-center justify-between gap-2"
              >
                <Label>{localization.auth.signOut}</Label>

                <ArrowRightStartOnRectangleIcon className="size-4 text-danger" />
              </Link>
            </Dropdown.Item>
          ) : (
            <>
              <Dropdown.Item
                textValue={localization.auth.signIn}
                className="!p-0"
              >
                <Link
                  href={`${basePaths.auth}/${viewPaths.auth.signIn}`}
                  className="p-2 flex w-full items-center justify-between gap-2"
                >
                  <Label>{localization.auth.signIn}</Label>

                  <ArrowRightEndOnRectangleIcon className="size-4" />
                </Link>
              </Dropdown.Item>

              <Dropdown.Item
                textValue={localization.auth.signUp}
                className="!p-0"
              >
                <Link
                  href={`${basePaths.auth}/${viewPaths.auth.signUp}`}
                  className="p-2 flex w-full items-center justify-between gap-2"
                >
                  <Label>{localization.auth.signUp}</Label>

                  <UserPlusIcon className="size-4" />
                </Link>
              </Dropdown.Item>
            </>
          )}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  )
}
