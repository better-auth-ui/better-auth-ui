import { getSafeRedirectTo } from "@better-auth-ui/core"
import {
  memberRoleLabels,
  type OrganizationAuthClient
} from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import {
  useInvitation,
  useAcceptInvitation,
  useRejectInvitation
} from "@better-auth-ui/react/plugins/organization"
import { organizationPlugin } from "../../../lib/auth/organization-plugin"
import { useNativeAuthenticate } from "../../../lib/auth/use-native-authenticate"
import type { AuthViewProps } from "../../../lib/auth-plugin"
import { useAuthNavigation } from "../../../navigation/navigation-context"
import { cn } from "../../../lib/cn"
import { Separator } from "../../../primitives/separator"
import { Users } from "../../../primitives/ui-icons"
import { UserAvatar } from "../user/user-avatar"
import { Button } from "../../../primitives/button"
import { Card } from "../../../primitives/card"
import { Description } from "../../../primitives/description"
import { Skeleton } from "../../../primitives/skeleton"
import { Box, Txt } from "../../../primitives/styled"

export function AcceptInvitation(
  props: AuthViewProps & { invitationId?: string }
) {
  const { authClient, navigate, redirectTo } = useAuth()
  const { localization, roles } = useAuthPlugin(organizationPlugin)
  const session = useNativeAuthenticate({
    section: "auth",
    view: "acceptInvitation"
  })
  const navigation = useAuthNavigation()
  const id = props.invitationId ?? navigation.getParam("invitationId") ?? ""
  const invitation = useInvitation(authClient as OrganizationAuthClient, {
    query: { id },
    enabled: !!id
  })
  const accept = useAcceptInvitation(authClient as OrganizationAuthClient)
  const reject = useRejectInvitation(authClient as OrganizationAuthClient)
  const available =
    invitation.data?.status === "pending" &&
    new Date(invitation.data.expiresAt).getTime() > Date.now()
  const pending = accept.isPending || reject.isPending
  const returnToApplication = () =>
    navigate({
      to: getSafeRedirectTo(redirectTo, "https://better-auth.local"),
      replace: true
    })
  const loading = session.isPending || Boolean(id && invitation.isPending)
  const organizationName =
    invitation.data?.organizationName ?? localization.organization
  const role = memberRoleLabels(invitation.data?.role, roles).join(", ")
  return (
    <Card
      className={cn("overflow-hidden p-0", props.className)}
      variant={props.variant}
    >
      <Card.Header className="items-center gap-5 p-6">
        <Box className="size-16 items-center justify-center rounded-full bg-surface-secondary">
          <Users aria-hidden={true} className="size-7" />
        </Box>
        <Box className="items-center gap-1">
          {loading ? (
            <Skeleton className="h-6 w-48" />
          ) : (
            <Card.Title className="text-center">
              {available
                ? organizationName
                : localization.invitationUnavailable}
            </Card.Title>
          )}
          <Description>{localization.acceptInvitationTitle}</Description>
        </Box>
      </Card.Header>
      <Card.Content className="px-4 pb-6">
        <Box className="gap-5 rounded-lg bg-surface-secondary p-5">
          {loading ? (
            <Skeleton className="h-10 w-full" />
          ) : available ? (
            <>
              <Description>
                {localization.acceptInvitationDescription
                  .replace("{{organization}}", organizationName)
                  .replace("{{role}}", role)}
              </Description>
              <Box className="gap-1">
                <Description>{localization.role}</Description>
                <Txt className="text-base font-medium text-foreground">
                  {role}
                </Txt>
              </Box>
            </>
          ) : (
            <Description>
              {localization.invitationUnavailableDescription}
            </Description>
          )}
          <Box className="flex-row items-center gap-3">
            <UserAvatar
              user={session.data?.user}
              isPending={session.isPending}
            />
            {session.data ? (
              <Box className="min-w-0 flex-1 gap-1">
                <Txt className="text-sm font-medium text-foreground">
                  {session.data.user.name || session.data.user.email}
                </Txt>
                {session.data.user.name ? (
                  <Description>{session.data.user.email}</Description>
                ) : null}
              </Box>
            ) : (
              <Skeleton className="h-4 w-40" />
            )}
          </Box>
          {invitation.error ? (
            <Txt accessibilityRole="alert">{invitation.error.message}</Txt>
          ) : null}
        </Box>
      </Card.Content>
      <Separator />
      <Card.Footer className="flex-row gap-3 p-4">
        {loading ? (
          <>
            <Skeleton className="h-11 flex-1" />
            <Skeleton className="h-11 flex-1" />
          </>
        ) : available && session.data && invitation.data ? (
          <>
            <Button
              className="flex-1"
              variant="secondary"
              isDisabled={pending}
              isPending={reject.isPending}
              onPress={() =>
                reject.mutate(
                  { invitationId: id },
                  { onSuccess: returnToApplication }
                )
              }
            >
              {localization.rejectInvitation}
            </Button>
            <Button
              className="flex-1"
              variant="primary"
              isDisabled={pending}
              isPending={accept.isPending}
              onPress={() =>
                accept.mutate(
                  { invitationId: id },
                  { onSuccess: returnToApplication }
                )
              }
            >
              {localization.accept}
            </Button>
          </>
        ) : (
          <Button className="flex-1" onPress={returnToApplication}>
            {localization.return}
          </Button>
        )}
      </Card.Footer>
    </Card>
  )
}
