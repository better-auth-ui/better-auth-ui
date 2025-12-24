"use client"

import { type AnyAuthConfig, useUpdateUser } from "@better-auth-ui/react"
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
import { useAuth } from "@/hooks/auth/use-auth"
import { useSession } from "@/hooks/auth/use-session"
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
  const context = useAuth(config)
  const { localization } = context

  const { data: sessionData } = useSession(context)
  const [state, formAction, isPending] = useUpdateUser(context)

  const [fieldErrors, setFieldErrors] = useState<{
    name?: string
  }>({})

  return (
    <form action={formAction}>
      <Card className={cn("w-full py-4 md:py-6 gap-4 md:gap-6", className)}>
        <CardHeader className="px-4 md:px-6 gap-0">
          <CardTitle className="text-xl">
            {localization.settings.profile}
          </CardTitle>
        </CardHeader>

        <CardContent className="px-4 md:px-6 grid gap-4 md:gap-6">
          <div className="flex items-center gap-2.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="relative p-0 h-auto w-auto rounded-full"
              disabled={!sessionData}
            >
              <UserAvatar {...config} className="size-12 text-base" />

              <span className="absolute right-0 bottom-0 size-4 rounded-full bg-background ring-2 ring-secondary flex items-center justify-center">
                <Pencil className="size-2 text-muted-foreground" />
              </span>
            </Button>

            {sessionData ? (
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {sessionData?.user?.displayUsername ||
                    sessionData?.user?.name ||
                    sessionData?.user?.email}
                </span>

                {(sessionData?.user?.displayUsername ||
                  sessionData?.user?.name) && (
                  <span className="text-muted-foreground truncate text-xs">
                    {sessionData?.user?.email}
                  </span>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <Skeleton className="h-4 w-24 mt-0.5" />
                <Skeleton className="h-3 w-32" />
              </div>
            )}
          </div>

          <Field className="gap-1">
            <FieldLabel htmlFor="name">{localization.auth.name}</FieldLabel>

            {sessionData ? (
              <Input
                key={sessionData?.user?.name}
                id="name"
                name="name"
                autoComplete="name"
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
            ) : (
              <Skeleton className="h-9 w-full" />
            )}

            <FieldError>{fieldErrors.name}</FieldError>
          </Field>
        </CardContent>

        <CardFooter className="px-4 md:px-6">
          <Button type="submit" disabled={isPending || !sessionData}>
            {isPending ? <Spinner /> : <Save />}

            {localization.settings.saveChanges}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
