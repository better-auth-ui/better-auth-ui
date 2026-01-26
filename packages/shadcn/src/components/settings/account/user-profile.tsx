"use client"

import { useAuth } from "@better-auth-ui/react"
import { Pencil, Save } from "lucide-react"
import { type FormEvent, useState } from "react"
import { toast } from "sonner"

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
import { useSession } from "@/hooks/auth/use-session"
import { useUpdateUser } from "@/hooks/settings/use-update-user"
import { cn } from "@/lib/utils"

export type UserProfileProps = {
  className?: string
}

/**
 * Render a profile card that lets the authenticated user view and update their display name.
 *
 * The component uses auth localization for labels, reflects session loading state with skeletons, shows the best-available
 * user identifier (display username, name, or email) and secondary email line, and includes a name input that can be
 * edited and saved.
 *
 * @param className - Optional additional CSS class names applied to the card container
 * @returns A JSX element containing the profile card with editable name field
 */
export function UserProfile({ className }: UserProfileProps) {
  const { localization } = useAuth()
  const { data: sessionData } = useSession()

  const { mutate: updateUser, isPending } = useUpdateUser({
    onError: (error) => toast.error(error.error?.message || error.message),
    onSuccess: () => toast.success(localization.settings.profileUpdatedSuccess)
  })

  const [fieldErrors, setFieldErrors] = useState<{
    name?: string
  }>({})

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    updateUser({ name: formData.get("name") as string })
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className={cn("w-full py-4 md:py-6 gap-4", className)}>
        <CardHeader className="px-4 md:px-6 gap-0">
          <CardTitle className="text-xl">
            {localization.settings.profile}
          </CardTitle>
        </CardHeader>

        <CardContent className="px-4 md:px-6 grid gap-4">
          <div className="flex items-center gap-2.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="relative p-0 h-auto w-auto rounded-full"
              disabled={!sessionData}
            >
              <UserAvatar className="size-12 text-base" />

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

          <Field className="gap-1" data-invalid={!!fieldErrors.name}>
            <FieldLabel htmlFor="name">{localization.auth.name}</FieldLabel>

            {sessionData ? (
              <Input
                key={sessionData?.user?.name}
                id="name"
                name="name"
                autoComplete="name"
                defaultValue={sessionData?.user?.name}
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
