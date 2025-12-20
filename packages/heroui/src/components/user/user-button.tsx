import { type AnyAuthConfig, useAuth } from "@better-auth-ui/react"
import {
  ArrowRightFromSquare,
  ArrowRightToSquare,
  ChevronsExpandVertical,
  PersonPlus
} from "@gravity-ui/icons"
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
  const { authClient, basePaths, viewPaths, localization } = useAuth(config)

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
          className={cn(
            "h-auto font-normal justify-start px-3 py-2 text-left",
            className
          )}
        >
          <UserAvatar {...config} />

          {isPending ? (
            <div className="flex flex-col gap-1">
              <Skeleton className="h-4 w-24 rounded-lg" />
              <Skeleton className="h-3 w-32 rounded-lg" />
            </div>
          ) : user ? (
            <div>
              <p className="text-sm font-medium">
                {user.displayUsername || user.name || user.email}
              </p>

              {(user.displayUsername || user.name) && (
                <p className="text-muted text-xs leading-none mb-1">
                  {user.email}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm font-medium">{localization.auth.account}</p>
          )}

          <ChevronsExpandVertical className="ml-auto" />
        </Button>
      )}

      <Dropdown.Popover placement={placement}>
        {user && (
          <div className="px-3 py-2">
            <div className="flex items-center gap-2">
              <UserAvatar {...config} />

              <div>
                <p className="text-sm font-medium">
                  {user.displayUsername || user.name || user.email}
                </p>

                {(user.displayUsername || user.name) && (
                  <p className="text-muted text-xs leading-none mb-1">
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
              href={`${basePaths.auth}/${viewPaths.auth.signOut}`}
            >
              <Label>{localization.auth.signOut}</Label>

              <ArrowRightFromSquare className="ml-auto text-danger" />
            </Dropdown.Item>
          ) : (
            <>
              <Dropdown.Item
                textValue={localization.auth.signIn}
                href={`${basePaths.auth}/${viewPaths.auth.signIn}`}
              >
                <Label>{localization.auth.signIn}</Label>

                <ArrowRightToSquare className="ml-auto" />
              </Dropdown.Item>

              <Dropdown.Item
                textValue={localization.auth.signUp}
                href={`${basePaths.auth}/${viewPaths.auth.signUp}`}
              >
                <Label>{localization.auth.signUp}</Label>

                <PersonPlus className="ml-auto" />
              </Dropdown.Item>
            </>
          )}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  )
}
