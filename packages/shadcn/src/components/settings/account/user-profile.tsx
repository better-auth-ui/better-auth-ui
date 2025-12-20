"use client"

import {
  type AnyAuthConfig,
  useAuth,
  useUpdateUser
} from "@better-auth-ui/react"
import { Pencil, Save } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { UserAvatar } from "@/components/user/user-avatar"
import { cn } from "@/lib/utils"

export type UserProfileProps = AnyAuthConfig & {
  className?: string
}

/**
 * Render the current user's profile editor UI.
 *
 * Renders a form that displays the user's avatar and identity, lets the user edit their name with inline validation, and submit changes. While session data is loading it renders a skeleton variant; while a submit is pending it disables inputs and shows a spinner.
 *
 * @param className - Optional additional CSS class names applied to the card container
 * @param config - Authentication/configuration options forwarded to auth and user-update hooks
 * @returns A React element containing the user profile form and controls
 */
export function UserProfile({ className, ...config }: UserProfileProps) {
  const { authClient, localization } = useAuth(config)

  const { data: sessionData, isPending: isSessionPending } =
    authClient.useSession()

  const [state, formAction, isPending] = useUpdateUser(config)

  const [fieldErrors, setFieldErrors] = useState<{
    name?: string
  }>({})

  if (isSessionPending) {
    return <UserProfileSkeleton />
  }

  return (
    <form action={formAction}>
      <Card className={cn("w-full py-4 md:py-6 gap-4 md:gap-6", className)}>
        <CardHeader className="px-4 md:px-6 gap-0">
          <CardTitle className="text-xl">
            {localization.settings.profile}
          </CardTitle>
        </CardHeader>

        <CardContent className="px-4 md:px-6 grid gap-4 md:gap-6">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="relative p-0 h-auto w-auto rounded-full"
            >
              <UserAvatar {...config} className="size-12 text-base" />

              <span className="absolute right-0 bottom-0 size-4 rounded-full bg-background ring-2 ring-border flex items-center justify-center">
                <Pencil className="size-2 text-muted-foreground" />
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
                <p className="text-muted-foreground text-xs leading-none">
                  {sessionData?.user?.email}
                </p>
              )}
            </div>
          </div>

          <Field className="gap-1">
            <FieldLabel htmlFor="name">{localization.auth.name}</FieldLabel>

            <Input
              id="name"
              name="name"
              defaultValue={sessionData?.user?.name || state.name}
              placeholder={localization.auth.name}
              disabled={isPending}
              required
              onChange={() => {
                setFieldErrors((prev) => ({
                  ...prev,
                  name: undefined
                }))
              }}
              onInvalid={(e) => {
                e.preventDefault()
                setFieldErrors((prev) => ({
                  ...prev,
                  name: (e.target as HTMLInputElement).validationMessage
                }))
              }}
              aria-invalid={!!fieldErrors.name}
            />

            <FieldError>{fieldErrors.name}</FieldError>
          </Field>
        </CardContent>

        <CardFooter className="px-4 md:px-6">
          <Button type="submit" disabled={isPending}>
            {isPending ? <Spinner /> : <Save />}

            {localization.settings.saveChanges}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}

/**
 * Render a skeleton placeholder for the user profile settings card shown while profile data loads.
 *
 * @returns A JSX element representing the loading skeleton for the user profile card
 */
function UserProfileSkeleton() {
  return (
    <Card className="w-full py-4 md:py-6 gap-4 md:gap-6">
      <CardHeader className="px-4 md:px-6 gap-0">
        <Skeleton className="h-6 w-16 my-0.5" />
      </CardHeader>

      <CardContent className="px-4 md:px-6 grid gap-4 md:gap-6">
        <div className="flex items-center gap-3">
          <Skeleton className="size-12 rounded-full" />

          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-24 mt-0.5" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <Skeleton className="h-4 w-12 my-0.5" />
          <Skeleton className="h-9 w-full" />
        </div>
      </CardContent>

      <CardFooter className="px-4 md:px-6">
        <Skeleton className="h-9 w-36" />
      </CardFooter>
    </Card>
  )
}
