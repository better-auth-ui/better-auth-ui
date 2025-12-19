import { type AnyAuthConfig, useAuth } from "@better-auth-ui/react"
import { Skeleton } from "@heroui/react"

export type UserProfileProps = AnyAuthConfig & {
  className?: string
}

export function UserProfile({ className, ...config }: UserProfileProps) {
  const { authClient } = useAuth(config)

  const { data: sessionData, isPending } = authClient.useSession()

  if (isPending) {
    return <Skeleton className={className} />
  }

  const resolvedUser = sessionData?.user

  const displayName =
    resolvedUser?.displayUsername ||
    resolvedUser?.username ||
    resolvedUser?.name ||
    resolvedUser?.email

  return <span className={className}>{displayName}</span>
}
