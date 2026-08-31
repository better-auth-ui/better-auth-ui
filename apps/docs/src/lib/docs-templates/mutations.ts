import type { MutationDefinition } from "./types.ts"

export const mutationDefinitions: Record<string, MutationDefinition> = {
  "accept-invitation": {
    name: "acceptInvitation",
    params:
      "packages/core/src/plugins/organization/accept-invitation-mutation.ts#AcceptInvitationParams",
    plugin: "organization"
  },
  "add-passkey": {
    name: "addPasskey",
    params:
      "packages/core/src/plugins/passkey/add-passkey-mutation.ts#AddPasskeyParams",
    plugin: "passkey",
    react: {
      usage: {
        binding: "{ mutate: addPasskey, isPending }",
        call: `addPasskey({ name: "MacBook Pro" })`
      },
      options: { binding: "{ mutate }" }
    },
    solid: {
      usage: {
        kind: "factory",
        binding: "addPasskey",
        call: `addPasskey.mutate({ name: "Work laptop" })`
      },
      options: false
    }
  },
  "approve-device": {
    name: "approveDevice",
    params:
      "packages/core/src/plugins/device-authorization/approve-device-mutation.ts#ApproveDeviceParams",
    plugin: "device-authorization",
    react: {
      usage: {
        client: "provided",
        binding: "approveDevice",
        call: `approveDevice.mutate({
  userCode: "ABCD1234"
})`
      },
      options: { kind: "options", binding: "options", lang: "ts" }
    },
    solid: {
      usage: false,
      options: {
        binding: "approveDevice",
        call: `approveDevice.mutate({
  userCode: "ABCD1234"
})`,
        queryHook: "createMutation"
      }
    }
  },
  "cancel-invitation": {
    name: "cancelInvitation",
    params:
      "packages/core/src/plugins/organization/cancel-invitation-mutation.ts#CancelInvitationParams",
    plugin: "organization"
  },
  "change-email": {
    name: "changeEmail",
    params:
      "packages/core/src/mutations/change-email-mutation.ts#ChangeEmailParams",
    react: {
      usage: {
        binding: "{ mutate: changeEmail }",
        call: `changeEmail({
  newEmail: "new@example.com",
  callbackURL: "/account"
})`
      },
      options: { binding: "{ mutate }" }
    },
    solid: {
      usage: {
        kind: "factory",
        binding: "changeEmail",
        call: `changeEmail.mutate({ newEmail: "alice@example.com" })`
      },
      options: false
    }
  },
  "change-email-otp": {
    name: "changeEmailOtp",
    params:
      "packages/core/src/plugins/email-otp/change-email-otp-mutation.ts#ChangeEmailOtpParams",
    plugin: "email-otp",
    react: {
      usage: {
        client: "context",
        clientType: "EmailOtpAuthClient",
        binding: "{ mutate: changeEmailOtp }",
        call: `changeEmailOtp({
  newEmail: "new@example.com",
  otp: "123456"
})`
      },
      options: { binding: "{ mutate }" }
    },
    solid: {
      usage: false,
      options: {
        binding: "changeEmail",
        call: `changeEmail.mutate({ newEmail: "new@example.com", otp: "123456" })`,
        queryHook: "createMutation"
      }
    }
  },
  "change-password": {
    name: "changePassword",
    params:
      "packages/core/src/mutations/change-password-mutation.ts#ChangePasswordParams",
    react: {
      usage: {
        binding: "{ mutate: changePassword }",
        call: `changePassword({
  currentPassword: "hunter2",
  newPassword: "hunter3",
  revokeOtherSessions: true
})`
      },
      options: { binding: "{ mutate }" }
    },
    solid: {
      usage: {
        kind: "factory",
        binding: "changePassword",
        call: `changePassword.mutate({ currentPassword: "old", newPassword: "new" })`
      },
      options: false
    }
  },
  "check-slug": {
    name: "checkSlug",
    params:
      "packages/core/src/plugins/organization/check-slug-mutation.ts#CheckSlugParams",
    plugin: "organization"
  },
  "create-api-key": {
    name: "createApiKey",
    params:
      "packages/core/src/plugins/api-key/create-api-key-mutation.ts#CreateApiKeyParams",
    plugin: "api-key",
    solid: {
      usage: {
        binding: "createApiKey",
        call: `createApiKey.mutate({ name: "CLI" })`
      },
      options: { binding: "createApiKey", args: "authClient, userId" }
    }
  },
  "create-organization": {
    name: "createOrganization",
    params:
      "packages/core/src/plugins/organization/create-organization-mutation.ts#CreateOrganizationParams",
    plugin: "organization"
  },
  "delete-api-key": {
    name: "deleteApiKey",
    params:
      "packages/core/src/plugins/api-key/delete-api-key-mutation.ts#DeleteApiKeyParams",
    plugin: "api-key",
    solid: {
      usage: {
        binding: "deleteApiKey",
        call: `deleteApiKey.mutate({ keyId: "api-key-id" })`
      },
      options: { binding: "deleteApiKey", args: "authClient, userId" }
    }
  },
  "delete-oauth-consent": {
    name: "deleteOAuthConsent",
    params:
      "packages/core/src/plugins/oauth-provider/delete-oauth-consent-mutation.ts#DeleteOAuthConsentParams",
    plugin: "oauth-provider",
    react: {
      usage: {
        client: "context",
        binding: "{ mutateAsync: deleteConsent }",
        call: `for (const id of application.consentIds) {
  await deleteConsent({ id })
}`
      },
      options: { kind: "options", binding: "options", lang: "ts" }
    },
    solid: {
      usage: {
        binding: "deleteConsent",
        call: `for (const id of application.consentIds) {
  await deleteConsent.mutateAsync({ id })
}`
      },
      options: {
        code: `import { deleteOAuthConsentOptions } from "@better-auth-ui/core/plugins/oauth-provider"
import { createMutation } from "@tanstack/solid-query"

const deleteConsent = createMutation(() =>
  deleteOAuthConsentOptions(authClient)
)`,
        lang: "ts"
      }
    }
  },
  "delete-organization": {
    name: "deleteOrganization",
    params:
      "packages/core/src/plugins/organization/delete-organization-mutation.ts#DeleteOrganizationParams",
    plugin: "organization"
  },
  "delete-passkey": {
    name: "deletePasskey",
    params:
      "packages/core/src/plugins/passkey/delete-passkey-mutation.ts#DeletePasskeyParams",
    plugin: "passkey",
    react: {
      usage: {
        code: `import { useDeletePasskey } from "@better-auth-ui/react/plugins/passkey"
import { authClient } from "@/lib/auth-client"

const { mutate: deletePasskey } = useDeletePasskey(authClient)

deletePasskey({ id: passkey.id })`
      },
      options: { binding: "{ mutate }" }
    },
    solid: {
      usage: {
        kind: "factory",
        binding: "deletePasskey",
        call: `deletePasskey.mutate({ id: "passkey-id" })`
      },
      options: false
    }
  },
  "delete-user": {
    name: "deleteUser",
    params:
      "packages/core/src/mutations/delete-user-mutation.ts#DeleteUserParams",
    react: {
      usage: {
        binding: "{ mutate: deleteUser }",
        call: `deleteUser({ password: "hunter2", callbackURL: "/" })`
      },
      options: { binding: "{ mutate }" }
    },
    solid: {
      usage: {
        kind: "factory",
        binding: "deleteUser",
        call: "deleteUser.mutate()"
      },
      options: false
    }
  },
  "deny-device": {
    name: "denyDevice",
    params:
      "packages/core/src/plugins/device-authorization/deny-device-mutation.ts#DenyDeviceParams",
    plugin: "device-authorization",
    react: {
      usage: {
        client: "provided",
        binding: "denyDevice",
        call: `denyDevice.mutate({
  userCode: "ABCD1234"
})`
      },
      options: { kind: "options", binding: "options", lang: "ts" }
    },
    solid: {
      usage: false,
      options: {
        binding: "denyDevice",
        call: `denyDevice.mutate({
  userCode: "ABCD1234"
})`,
        queryHook: "createMutation"
      }
    }
  },
  "disable-two-factor": {
    name: "disableTwoFactor",
    params:
      "packages/core/src/plugins/two-factor/disable-two-factor-mutation.ts#DisableTwoFactorParams",
    plugin: "two-factor",
    react: {
      usage: {
        client: "context",
        clientType: "TwoFactorAuthClient",
        binding: "{ mutate: disableTwoFactor }",
        call: `disableTwoFactor({ password: "current-password" })`
      },
      options: { binding: "{ mutate }" }
    },
    solid: {
      usage: false,
      options: {
        binding: "disable",
        call: `disable.mutate({ password: "current-password" })`,
        queryHook: "createMutation"
      }
    }
  },
  "enable-two-factor": {
    name: "enableTwoFactor",
    params:
      "packages/core/src/plugins/two-factor/enable-two-factor-mutation.ts#EnableTwoFactorParams",
    plugin: "two-factor",
    react: {
      usage: {
        client: "context",
        clientType: "TwoFactorAuthClient",
        binding: "{ mutate: enableTwoFactor }",
        call: `enableTwoFactor(
  { password: "current-password" },
  {
    onSuccess: ({ totpURI, backupCodes }) => {
      // Render the QR code and show the backup codes once.
    }
  }
)`
      },
      options: { binding: "{ mutate }" }
    },
    solid: {
      usage: false,
      options: {
        binding: "enable",
        call: `enable.mutate({ password: "current-password" })`,
        queryHook: "createMutation"
      }
    }
  },
  "generate-backup-codes": {
    name: "generateBackupCodes",
    params:
      "packages/core/src/plugins/two-factor/generate-backup-codes-mutation.ts#GenerateBackupCodesParams",
    plugin: "two-factor",
    react: {
      usage: {
        client: "context",
        clientType: "TwoFactorAuthClient",
        binding: "{ mutate: generateBackupCodes }",
        call: `generateBackupCodes({ password: "current-password" })`
      },
      options: { binding: "{ mutate }" }
    },
    solid: {
      usage: false,
      options: {
        binding: "generateCodes",
        call: `generateCodes.mutate({ password: "current-password" })`,
        queryHook: "createMutation"
      }
    }
  },
  "get-totp-uri": {
    name: "getTotpUri",
    params:
      "packages/core/src/plugins/two-factor/get-totp-uri-mutation.ts#GetTotpUriParams",
    plugin: "two-factor",
    react: {
      usage: {
        client: "context",
        clientType: "TwoFactorAuthClient",
        binding: "{ mutate: getTotpUri }",
        call: `getTotpUri({ password: "current-password" })`
      },
      options: { binding: "{ mutate }" }
    },
    solid: {
      usage: false,
      options: {
        binding: "getTotpUri",
        call: `getTotpUri.mutate({ password: "current-password" })`,
        queryHook: "createMutation"
      }
    }
  },
  "invite-member": {
    name: "inviteMember",
    params:
      "packages/core/src/plugins/organization/invite-member-mutation.ts#InviteMemberParams",
    plugin: "organization"
  },
  "is-username-available": {
    name: "isUsernameAvailable",
    params:
      "packages/core/src/plugins/username/is-username-available-mutation.ts#IsUsernameAvailableParams",
    plugin: "username",
    react: {
      usage: {
        binding: "{ mutateAsync: checkUsername, data }",
        call: `const result = await checkUsername({ username: "alice" })
// result.available -> boolean`
      },
      options: { binding: "{ mutate }" }
    },
    solid: {
      options: {
        binding: "checkUsername",
        call: `checkUsername.mutate({ username: "alice" })`
      }
    }
  },
  "leave-organization": {
    name: "leaveOrganization",
    params:
      "packages/core/src/plugins/organization/leave-organization-mutation.ts#LeaveOrganizationParams",
    plugin: "organization"
  },
  "link-social": {
    name: "linkSocial",
    params:
      "packages/core/src/mutations/link-social-mutation.ts#LinkSocialParams",
    react: {
      usage: {
        binding: "{ mutate: linkSocial }",
        call: `linkSocial({
  provider: "github",
  callbackURL: "/account"
})`
      },
      options: { binding: "{ mutate }" }
    },
    solid: {
      usage: {
        kind: "factory",
        binding: "linkSocial",
        call: `linkSocial.mutate({ provider: "github" })`
      },
      options: false
    }
  },
  "oauth-consent": {
    name: "oauthConsent",
    params:
      "packages/core/src/plugins/oauth-provider/oauth-consent-mutation.ts#OAuthConsentParams",
    plugin: "oauth-provider",
    react: {
      usage: {
        code: `import { useOAuthConsent } from "@better-auth-ui/react/plugins/oauth-provider"

const consent = useOAuthConsent(authClient)

consent.mutate({ accept: true })
consent.mutate({ accept: false })`
      },
      options: { kind: "options", binding: "options", lang: "ts" }
    },
    solid: {
      usage: {
        code: `import { useOAuthConsent } from "@better-auth-ui/solid/plugins/oauth-provider"

const consent = useOAuthConsent(authClient)

consent.mutate({ accept: true })
consent.mutate({ accept: false })`
      },
      options: {
        binding: "consent",
        call: `consent.mutate({ accept: true })
consent.mutate({ accept: false })`,
        queryHook: "createMutation"
      }
    }
  },
  "oauth-continue": {
    name: "oauthContinue",
    params:
      "packages/core/src/plugins/oauth-provider/oauth-continue-mutation.ts#OAuthContinueParams",
    plugin: "oauth-provider",
    react: {
      usage: {
        code: `import { useOAuthContinue } from "@better-auth-ui/react/plugins/oauth-provider"

const oauthContinue = useOAuthContinue(authClient)

// After the account was created during this flow (\`prompt=create\`)
oauthContinue.mutate({ created: true })

// After the user picked an account (\`prompt=select_account\`)
oauthContinue.mutate({ selected: true })

// After your own post-login selection screen
await oauthContinue.mutateAsync({ postLogin: true })`
      },
      options: { kind: "options", binding: "options", lang: "ts" }
    },
    solid: {
      usage: false,
      options: {
        binding: "oauthContinue",
        call: `// After the account was created during this flow (\`prompt=create\`)
oauthContinue.mutate({ created: true })

// After the user picked an account (\`prompt=select_account\`)
oauthContinue.mutate({ selected: true })

// After your own post-login selection screen
await oauthContinue.mutateAsync({ postLogin: true })`,
        queryHook: "createMutation"
      }
    }
  },
  "reject-invitation": {
    name: "rejectInvitation",
    params:
      "packages/core/src/plugins/organization/reject-invitation-mutation.ts#RejectInvitationParams",
    plugin: "organization"
  },
  "remove-member": {
    name: "removeMember",
    params:
      "packages/core/src/plugins/organization/remove-member-mutation.ts#RemoveMemberParams",
    plugin: "organization"
  },
  "request-email-change-otp": {
    name: "requestEmailChangeOtp",
    params:
      "packages/core/src/plugins/email-otp/request-email-change-otp-mutation.ts#RequestEmailChangeOtpParams",
    plugin: "email-otp",
    react: {
      usage: {
        client: "context",
        clientType: "EmailOtpAuthClient",
        binding: "{ mutate: requestEmailChangeOtp }",
        call: `requestEmailChangeOtp({ newEmail: "new@example.com" })`
      },
      options: { binding: "{ mutate }" }
    },
    solid: {
      usage: false,
      options: {
        binding: "requestChange",
        call: `requestChange.mutate({ newEmail: "new@example.com" })`,
        queryHook: "createMutation"
      }
    }
  },
  "request-password-reset": {
    name: "requestPasswordReset",
    params:
      "packages/core/src/mutations/request-password-reset-mutation.ts#RequestPasswordResetParams",
    react: {
      usage: {
        binding: "{ mutate: requestPasswordReset }",
        call: `requestPasswordReset({
  email: "alice@example.com",
  redirectTo: "/auth/reset-password"
})`
      },
      options: { binding: "{ mutate }" }
    },
    solid: {
      usage: {
        binding: "requestReset",
        call: `requestReset.mutate({
  email: "alice@example.com",
  redirectTo: "/auth/reset-password"
})`
      },
      options: { binding: "requestReset" }
    }
  },
  "request-password-reset-otp": {
    name: "requestPasswordResetOtp",
    params:
      "packages/core/src/plugins/email-otp/request-password-reset-otp-mutation.ts#RequestPasswordResetOtpParams",
    plugin: "email-otp",
    react: {
      usage: {
        client: "context",
        clientType: "EmailOtpAuthClient",
        binding: "{ mutate: requestPasswordResetOtp }",
        call: `requestPasswordResetOtp({ email: "alice@example.com" })`
      },
      options: { binding: "{ mutate }" }
    },
    solid: {
      usage: false,
      options: {
        binding: "requestReset",
        call: `requestReset.mutate({ email: "alice@example.com" })`,
        queryHook: "createMutation"
      }
    }
  },
  "request-phone-number-password-reset": {
    name: "requestPhoneNumberPasswordReset",
    params:
      "packages/core/src/plugins/phone-number/request-phone-number-password-reset-mutation.ts#RequestPhoneNumberPasswordResetParams",
    plugin: "phone-number",
    react: {
      usage: false,
      options: {
        code: `import { requestPhoneNumberPasswordResetOptions } from "@better-auth-ui/core/plugins/phone-number"
import { useMutation } from "@tanstack/react-query"

const { mutate } = useMutation(
  requestPhoneNumberPasswordResetOptions(authClient)
)`
      }
    },
    solid: {
      usage: {
        client: "context",
        clientType: "PhoneNumberAuthClient",
        binding: "requestReset",
        call: `requestReset.mutate({ phoneNumber: "+12025550123" })`
      },
      options: {
        code: `import { requestPhoneNumberPasswordResetOptions } from "@better-auth-ui/core/plugins/phone-number"
import { useMutation } from "@tanstack/solid-query"

const requestReset = useMutation(() =>
  requestPhoneNumberPasswordResetOptions(authClient)
)`
      }
    }
  },
  "reset-password": {
    name: "resetPassword",
    params:
      "packages/core/src/mutations/reset-password-mutation.ts#ResetPasswordParams",
    react: {
      usage: {
        binding: "{ mutate: resetPassword }",
        call: `resetPassword({
  newPassword: "hunter3",
  token
})`
      },
      options: { binding: "{ mutate }" }
    },
    solid: {
      options: {
        code: `import { resetPasswordOptions } from "@better-auth-ui/core"
import { useMutation } from "@tanstack/solid-query"

const resetPassword = useMutation(() => resetPasswordOptions(authClient))
const token = new URLSearchParams(window.location.search).get("token")

const newPassword = formPasswordValue

if (token) {
  resetPassword.mutate({ token, newPassword })
}`
      }
    }
  },
  "reset-password-otp": {
    name: "resetPasswordOtp",
    params:
      "packages/core/src/plugins/email-otp/reset-password-otp-mutation.ts#ResetPasswordOtpParams",
    plugin: "email-otp",
    react: {
      usage: {
        client: "context",
        clientType: "EmailOtpAuthClient",
        binding: "{ mutate: resetPasswordOtp }",
        call: `resetPasswordOtp({
  email: "alice@example.com",
  otp: "123456",
  password: "new-password"
})`
      },
      options: { binding: "{ mutate }" }
    },
    solid: {
      usage: false,
      options: {
        binding: "resetPassword",
        call: `resetPassword.mutate({
  email: "alice@example.com",
  otp: "123456",
  password: "new-password"
})`,
        queryHook: "createMutation"
      }
    }
  },
  "reset-phone-number-password": {
    name: "resetPhoneNumberPassword",
    params:
      "packages/core/src/plugins/phone-number/reset-phone-number-password-mutation.ts#ResetPhoneNumberPasswordParams",
    plugin: "phone-number",
    react: { usage: false, options: { binding: "{ mutate }" } },
    solid: {
      usage: {
        client: "context",
        clientType: "PhoneNumberAuthClient",
        binding: "resetPassword",
        call: `resetPassword.mutate({
  phoneNumber: "+12025550123",
  otp: "123456",
  newPassword
})`
      },
      options: {
        code: `import { resetPhoneNumberPasswordOptions } from "@better-auth-ui/core/plugins/phone-number"
import { useMutation } from "@tanstack/solid-query"

const resetPassword = useMutation(() =>
  resetPhoneNumberPasswordOptions(authClient)
)`
      }
    }
  },
  "revoke-multi-session": {
    name: "revokeMultiSession",
    params:
      "packages/core/src/plugins/multi-session/revoke-multi-session-mutation.ts#RevokeMultiSessionParams",
    plugin: "multi-session",
    react: {
      usage: {
        binding: "{ mutate: revokeMultiSession }",
        call: "revokeMultiSession({ sessionToken: deviceSession.session.token })"
      },
      options: { binding: "{ mutate }" }
    },
    solid: {
      usage: {
        binding: "revokeMultiSession",
        call: `revokeMultiSession.mutate({ sessionToken: "session-token" })`
      },
      options: {
        code: `import { revokeMultiSessionOptions } from "@better-auth-ui/core/plugins/multi-session"
import { useMutation } from "@tanstack/solid-query"

const revokeMultiSession = useMutation(() =>
  revokeMultiSessionOptions(authClient, userId)
)`
      }
    }
  },
  "revoke-session": {
    name: "revokeSession",
    params:
      "packages/core/src/mutations/revoke-session-mutation.ts#RevokeSessionParams",
    react: {
      usage: {
        binding: "{ mutate: revokeSession }",
        call: "revokeSession({ token: session.token })"
      },
      options: { binding: "{ mutate }" }
    },
    solid: {
      usage: {
        kind: "factory",
        binding: "revokeSession",
        call: `revokeSession.mutate({ token: "session-token" })`
      },
      options: false
    }
  },
  "send-phone-number-otp": {
    name: "sendPhoneNumberOtp",
    params:
      "packages/core/src/plugins/phone-number/send-phone-number-otp-mutation.ts#SendPhoneNumberOtpParams",
    plugin: "phone-number",
    react: { usage: false, options: { binding: "{ mutate }" } },
    solid: {
      usage: {
        client: "context",
        clientType: "PhoneNumberAuthClient",
        binding: "sendOtp",
        call: `sendOtp.mutate({ phoneNumber: "+12025550123" })`
      },
      options: { binding: "sendOtp" }
    }
  },
  "send-two-factor-otp": {
    name: "sendTwoFactorOtp",
    params:
      "packages/core/src/plugins/two-factor/send-two-factor-otp-mutation.ts#SendTwoFactorOtpParams",
    plugin: "two-factor",
    react: {
      usage: {
        client: "context",
        clientType: "TwoFactorAuthClient",
        binding: "{ mutate: sendTwoFactorOtp }",
        call: "sendTwoFactorOtp()"
      },
      options: { binding: "{ mutate }" }
    },
    solid: {
      usage: false,
      options: {
        binding: "sendOtp",
        call: "sendOtp.mutate({})",
        queryHook: "createMutation"
      }
    }
  },
  "send-verification-email": {
    name: "sendVerificationEmail",
    params:
      "packages/core/src/mutations/send-verification-email-mutation.ts#SendVerificationEmailParams",
    react: {
      usage: {
        binding: "{ mutate: sendVerificationEmail }",
        call: `sendVerificationEmail({
  email: "alice@example.com",
  callbackURL: "/dashboard"
})`
      },
      options: { binding: "{ mutate }" }
    },
    solid: {
      usage: {
        binding: "sendVerificationEmail",
        call: `sendVerificationEmail.mutate({
  email: "alice@example.com",
  callbackURL: "/dashboard"
})`
      },
      options: {
        code: `import { sendVerificationEmailOptions } from "@better-auth-ui/core"
import { useMutation } from "@tanstack/solid-query"

const sendVerificationEmail = useMutation(() =>
  sendVerificationEmailOptions(authClient)
)`
      }
    }
  },
  "send-verification-otp": {
    name: "sendVerificationOtp",
    params:
      "packages/core/src/plugins/email-otp/send-verification-otp-mutation.ts#SendVerificationOtpParams",
    plugin: "email-otp",
    react: {
      usage: {
        client: "context",
        clientType: "EmailOtpAuthClient",
        binding: "{ mutate: sendVerificationOtp }",
        call: `sendVerificationOtp({
  email: "alice@example.com",
  type: "sign-in"
})`
      },
      options: { binding: "{ mutate }" }
    },
    solid: {
      usage: false,
      options: {
        binding: "sendCode",
        call: `sendCode.mutate({ email: "alice@example.com", type: "sign-in" })`,
        queryHook: "createMutation"
      }
    }
  },
  "set-active-organization": {
    name: "setActiveOrganization",
    params:
      "packages/core/src/plugins/organization/set-active-organization-mutation.ts#SetActiveOrganizationParams",
    plugin: "organization"
  },
  "set-active-session": {
    name: "setActiveSession",
    params:
      "packages/core/src/plugins/multi-session/set-active-session-mutation.ts#SetActiveSessionParams",
    plugin: "multi-session",
    react: {
      usage: {
        binding: "{ mutate: setActive }",
        call: "setActive({ sessionToken: deviceSession.session.token })"
      },
      options: { binding: "{ mutate }" }
    },
    solid: {
      usage: {
        binding: "setActiveSession",
        call: `setActiveSession.mutate({ sessionToken: "session-token" })`
      },
      options: {
        code: `import { setActiveSessionOptions } from "@better-auth-ui/core/plugins/multi-session"
import { useMutation } from "@tanstack/solid-query"

const setActiveSession = useMutation(() =>
  setActiveSessionOptions(authClient, userId)
)`
      }
    }
  },
  "sign-in-email": {
    name: "signInEmail",
    params:
      "packages/core/src/mutations/sign-in-email-mutation.ts#SignInEmailParams",
    react: {
      usage: {
        binding: "{ mutate: signInEmail, isPending }",
        call: `signInEmail({
  email: "alice@example.com",
  password: "hunter2",
  rememberMe: true
})`
      },
      options: { binding: "{ mutate }" }
    },
    solid: {
      options: {
        binding: "signIn",
        call: `signIn.mutate({
  email: "alice@example.com",
  password: passwordInput,
  rememberMe: true
})`
      }
    }
  },
  "sign-in-email-otp": {
    name: "signInEmailOtp",
    params:
      "packages/core/src/plugins/email-otp/sign-in-email-otp-mutation.ts#SignInEmailOtpParams",
    plugin: "email-otp",
    react: {
      usage: {
        client: "context",
        clientType: "EmailOtpAuthClient",
        binding: "{ mutate: signInEmailOtp }",
        call: `signInEmailOtp({
  email: "alice@example.com",
  otp: "123456"
})`
      },
      options: { binding: "{ mutate }" }
    },
    solid: {
      usage: false,
      options: {
        binding: "signIn",
        call: `signIn.mutate({ email: "alice@example.com", otp: "123456" })`,
        queryHook: "createMutation"
      }
    }
  },
  "sign-in-magic-link": {
    name: "signInMagicLink",
    params:
      "packages/core/src/plugins/magic-link/sign-in-magic-link-mutation.ts#SignInMagicLinkParams",
    plugin: "magic-link",
    react: {
      usage: {
        binding: "{ mutate: signInMagicLink }",
        call: `signInMagicLink({
  email: "alice@example.com",
  callbackURL: "/dashboard"
})`
      },
      options: { binding: "{ mutate }" }
    },
    solid: {
      usage: {
        binding: "sendMagicLink",
        call: `sendMagicLink.mutate({
  email: "alice@example.com",
  callbackURL: "/dashboard"
})`
      },
      options: { binding: "sendMagicLink" }
    }
  },
  "sign-in-passkey": {
    name: "signInPasskey",
    params:
      "packages/core/src/plugins/passkey/sign-in-passkey-mutation.ts#SignInPasskeyParams",
    plugin: "passkey",
    react: {
      usage: { binding: "{ mutate: signInPasskey }", call: "signInPasskey()" },
      options: { binding: "{ mutate }" }
    },
    solid: {
      options: {
        binding: "signInWithPasskey",
        call: "signInWithPasskey.mutate()"
      }
    }
  },
  "sign-in-phone-number": {
    name: "signInPhoneNumber",
    params:
      "packages/core/src/plugins/phone-number/sign-in-phone-number-mutation.ts#SignInPhoneNumberParams",
    plugin: "phone-number",
    react: { usage: false, options: { binding: "{ mutate }" } },
    solid: {
      usage: {
        client: "context",
        clientType: "PhoneNumberAuthClient",
        binding: "signIn",
        call: `signIn.mutate({
  phoneNumber: "+12025550123",
  password,
  rememberMe: true
})`
      },
      options: { binding: "signIn" }
    }
  },
  "sign-in-social": {
    name: "signInSocial",
    params:
      "packages/core/src/mutations/sign-in-social-mutation.ts#SignInSocialParams",
    react: {
      usage: {
        binding: "{ mutate: signInSocial }",
        call: `signInSocial({
  provider: "github",
  callbackURL: "/dashboard"
})`
      },
      options: { binding: "{ mutate }" }
    },
    solid: {
      options: {
        binding: "signInSocial",
        call: `signInSocial.mutate({
  provider: "github",
  callbackURL: "/dashboard"
})`
      }
    }
  },
  "sign-in-sso": {
    name: "signInSso",
    params:
      "packages/core/src/plugins/sso/sign-in-sso-mutation.ts#SignInSsoParams",
    plugin: "sso",
    react: {
      usage: {
        binding: "{ mutate: signInSso }",
        call: `signInSso({
  email: "alice@example.com",
  callbackURL: "/dashboard"
})`
      },
      options: { binding: "{ mutate }" }
    }
  },
  "sign-in-username": {
    name: "signInUsername",
    params:
      "packages/core/src/plugins/username/sign-in-username-mutation.ts#SignInUsernameParams",
    plugin: "username",
    react: {
      usage: {
        binding: "{ mutate: signInUsername }",
        call: `signInUsername({
  username: "alice",
  password: "hunter2"
})`
      },
      options: { binding: "{ mutate }" }
    },
    solid: {
      options: {
        binding: "signIn",
        call: `signIn.mutate({ username: "alice", password: passwordInput })`
      }
    }
  },
  "sign-out": {
    name: "signOut",
    params: "packages/core/src/mutations/sign-out-mutation.ts#SignOutParams",
    react: {
      usage: {
        binding: "{ mutate: signOut }",
        args: `authClient, {
  onSuccess: () => navigate("/")
}`,
        call: "signOut()"
      },
      options: { binding: "{ mutate }" }
    },
    solid: {
      usage: {
        code: `import { useSignOut } from "@better-auth-ui/solid"

const signOut = useSignOut(authClient)
signOut.mutate()`
      },
      options: { binding: "signOut" }
    }
  },
  "sign-up-email": {
    name: "signUpEmail",
    params:
      "packages/core/src/mutations/sign-up-email-mutation.ts#SignUpEmailParams",
    react: {
      usage: {
        binding: "{ mutate: signUpEmail }",
        call: `signUpEmail({
  email: "alice@example.com",
  password: "hunter2",
  name: "Alice"
})`
      },
      options: { binding: "{ mutate }" }
    },
    solid: {
      options: {
        binding: "signUp",
        call: `signUp.mutate({
  email: "alice@example.com",
  password: passwordInput,
  name: "Alice"
})`
      }
    }
  },
  "unlink-account": {
    name: "unlinkAccount",
    params:
      "packages/core/src/mutations/unlink-account-mutation.ts#UnlinkAccountParams",
    react: {
      usage: {
        binding: "{ mutate: unlinkAccount }",
        call: `unlinkAccount({ providerId: "github", accountId: "acc_123" })`
      },
      options: { binding: "{ mutate }" }
    },
    solid: {
      usage: {
        kind: "factory",
        binding: "unlinkAccount",
        call: `unlinkAccount.mutate({ providerId: "github", accountId: "github-account-id" })`
      },
      options: false
    }
  },
  "update-member-role": {
    name: "updateMemberRole",
    params:
      "packages/core/src/plugins/organization/update-member-role-mutation.ts#UpdateMemberRoleParams",
    plugin: "organization"
  },
  "update-organization": {
    name: "updateOrganization",
    params:
      "packages/core/src/plugins/organization/update-organization-mutation.ts#UpdateOrganizationParams",
    plugin: "organization"
  },
  "update-user": {
    name: "updateUser",
    params:
      "packages/core/src/mutations/update-user-mutation.ts#UpdateUserParams",
    react: {
      usage: {
        binding: "{ mutate: updateUser, isPending }",
        call: `updateUser({ name: "Alice", image: "https://.../avatar.png" })`
      },
      options: { binding: "{ mutate }" }
    },
    solid: {
      usage: {
        binding: "updateUser",
        call: `updateUser.mutate({ name: "Alice" })`
      },
      options: false
    }
  },
  "verify-backup-code": {
    name: "verifyBackupCode",
    params:
      "packages/core/src/plugins/two-factor/verify-backup-code-mutation.ts#VerifyBackupCodeParams",
    plugin: "two-factor",
    react: {
      usage: {
        client: "context",
        clientType: "TwoFactorAuthClient",
        binding: "{ mutate: verifyBackupCode }",
        call: `verifyBackupCode({ code: "a1b2-c3d4" })`
      },
      options: { binding: "{ mutate }" }
    },
    solid: {
      usage: false,
      options: {
        binding: "verifyBackupCode",
        call: `verifyBackupCode.mutate({ code: "a1b2-c3d4" })`,
        queryHook: "createMutation"
      }
    }
  },
  "verify-device-code": {
    name: "verifyDeviceCode",
    params:
      "packages/core/src/plugins/device-authorization/verify-device-code-mutation.ts#VerifyDeviceCodeParams",
    plugin: "device-authorization",
    react: {
      usage: {
        client: "provided",
        binding: "verifyDeviceCode",
        call: `verifyDeviceCode.mutate({
  query: {
    user_code: "ABCD1234"
  }
})`
      },
      options: { kind: "options", binding: "options", lang: "ts" }
    },
    solid: {
      usage: false,
      options: {
        code: `import { verifyDeviceCodeOptions } from "@better-auth-ui/core/plugins/device-authorization"
import { createMutation } from "@tanstack/solid-query"

const verifyDeviceCode = createMutation(() =>
  verifyDeviceCodeOptions(authClient)
)

verifyDeviceCode.mutate({
  query: {
    user_code: "ABCD1234"
  }
})`
      }
    }
  },
  "verify-email-otp": {
    name: "verifyEmailOtp",
    params:
      "packages/core/src/plugins/email-otp/verify-email-otp-mutation.ts#VerifyEmailOtpParams",
    plugin: "email-otp",
    react: {
      usage: {
        client: "context",
        clientType: "EmailOtpAuthClient",
        binding: "{ mutate: verifyEmailOtp }",
        call: `verifyEmailOtp({
  email: "alice@example.com",
  otp: "123456"
})`
      },
      options: { binding: "{ mutate }" }
    },
    solid: {
      usage: false,
      options: {
        binding: "verifyEmail",
        call: `verifyEmail.mutate({ email: "alice@example.com", otp: "123456" })`,
        queryHook: "createMutation"
      }
    }
  },
  "verify-phone-number": {
    name: "verifyPhoneNumber",
    params:
      "packages/core/src/plugins/phone-number/verify-phone-number-mutation.ts#VerifyPhoneNumberParams",
    plugin: "phone-number",
    react: { usage: false, options: { binding: "{ mutate }" } },
    solid: {
      usage: {
        client: "context",
        clientType: "PhoneNumberAuthClient",
        binding: "verify",
        call: `verify.mutate({
  phoneNumber: "+12025550123",
  code: "123456"
})`
      },
      options: { binding: "verify" }
    }
  },
  "verify-totp": {
    name: "verifyTotp",
    params:
      "packages/core/src/plugins/two-factor/verify-totp-mutation.ts#VerifyTotpParams",
    plugin: "two-factor",
    react: {
      usage: {
        client: "context",
        clientType: "TwoFactorAuthClient",
        binding: "{ mutate: verifyTotp }",
        call: `verifyTotp({ code: "123456", trustDevice: true })`
      },
      options: { binding: "{ mutate }" }
    },
    solid: {
      usage: false,
      options: {
        binding: "verifyTotp",
        call: `verifyTotp.mutate({ code: "123456", trustDevice: true })`,
        queryHook: "createMutation"
      }
    }
  },
  "verify-two-factor-otp": {
    name: "verifyTwoFactorOtp",
    params:
      "packages/core/src/plugins/two-factor/verify-two-factor-otp-mutation.ts#VerifyTwoFactorOtpParams",
    plugin: "two-factor",
    react: {
      usage: {
        client: "context",
        clientType: "TwoFactorAuthClient",
        binding: "{ mutate: verifyTwoFactorOtp }",
        call: `verifyTwoFactorOtp({ code: "123456", trustDevice: true })`
      },
      options: { binding: "{ mutate }" }
    },
    solid: {
      usage: false,
      options: {
        binding: "verifyOtp",
        call: `verifyOtp.mutate({ code: "123456", trustDevice: true })`,
        queryHook: "createMutation"
      }
    }
  }
}
