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
import { Button } from "../../../primitives/button"
import { Card } from "../../../primitives/card"
import { Description } from "../../../primitives/description"
import { Skeleton } from "../../../primitives/skeleton"
import { Txt } from "../../../primitives/styled"

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
  return (
    <Card className={props.className} variant={props.variant}>
      <Card.Header>
        <Card.Title>{localization.acceptInvitationTitle}</Card.Title>
      </Card.Header>
      <Card.Content className="gap-4">
        {session.isPending || (id && invitation.isPending) ? (
          <Skeleton className="h-10 w-full" />
        ) : available ? (
          <Description>
            {localization.acceptInvitationDescription
              .replace(
                "{{organization}}",
                invitation.data?.organizationName ?? localization.organization
              )
              .replace(
                "{{role}}",
                memberRoleLabels(invitation.data?.role, roles).join(", ")
              )}
          </Description>
        ) : (
          <Description>
            {localization.invitationUnavailableDescription}
          </Description>
        )}
        {invitation.error ? (
          <Txt accessibilityRole="alert">{invitation.error.message}</Txt>
        ) : null}
        {available && session.data && invitation.data ? (
          <>
            <Button
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
          <Button onPress={returnToApplication}>{localization.return}</Button>
        )}
      </Card.Content>
    </Card>
  )
}
