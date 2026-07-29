import { type ComponentType, type LazyExoticComponent, lazy } from "react"

function lazyDemo<TModule, TComponent extends ComponentType>(
  load: () => Promise<TModule>,
  select: (module: TModule) => TComponent
): LazyExoticComponent<TComponent> {
  return lazy(async () => ({ default: select(await load()) }))
}

const HeroUIApiKeysDemo = lazyDemo(
  () => import("./heroui/api-key/api-keys"),
  ({ ApiKeysDemo }) => ApiKeysDemo
)

const HeroUIAuthDemo = lazyDemo(
  () => import("./heroui/auth/auth"),
  ({ AuthDemo }) => AuthDemo
)

const HeroUIForgotPasswordDemo = lazyDemo(
  () => import("./heroui/auth/forgot-password"),
  ({ ForgotPasswordDemo }) => ForgotPasswordDemo
)

const HeroUIResetPasswordDemo = lazyDemo(
  () => import("./heroui/auth/reset-password"),
  ({ ResetPasswordDemo }) => ResetPasswordDemo
)

const HeroUISignInDemo = lazyDemo(
  () => import("./heroui/auth/sign-in"),
  ({ SignInDemo }) => SignInDemo
)

const HeroUISignOutDemo = lazyDemo(
  () => import("./heroui/auth/sign-out"),
  ({ SignOutDemo }) => SignOutDemo
)

const HeroUISignUpDemo = lazyDemo(
  () => import("./heroui/auth/sign-up"),
  ({ SignUpDemo }) => SignUpDemo
)

const HeroUIVerifyEmailDemo = lazyDemo(
  () => import("./heroui/auth/verify-email"),
  ({ VerifyEmailDemo }) => VerifyEmailDemo
)

const HeroUIDangerZoneDemo = lazyDemo(
  () => import("./heroui/delete-user/danger-zone"),
  ({ DangerZoneDemo }) => DangerZoneDemo
)

const HeroUIDeviceAuthorizationDemo = lazyDemo(
  () => import("./heroui/device-authorization/device-authorization"),
  ({ DeviceAuthorizationDemo }) => DeviceAuthorizationDemo
)

const HeroUIChangeEmailConfirmationEmailDemo = lazyDemo(
  () => import("./heroui/email/change-email-confirmation-email"),
  ({ ChangeEmailConfirmationEmailDemo }) => ChangeEmailConfirmationEmailDemo
)

const HeroUIDeleteAccountVerificationEmailDemo = lazyDemo(
  () => import("./heroui/email/delete-account-verification-email"),
  ({ DeleteAccountVerificationEmailDemo }) => DeleteAccountVerificationEmailDemo
)

const HeroUIEmailChangedEmailDemo = lazyDemo(
  () => import("./heroui/email/email-changed-email"),
  ({ EmailChangedEmailDemo }) => EmailChangedEmailDemo
)

const HeroUIEmailVerificationEmailDemo = lazyDemo(
  () => import("./heroui/email/email-verification-email"),
  ({ EmailVerificationEmailDemo }) => EmailVerificationEmailDemo
)

const HeroUIMagicLinkEmailDemo = lazyDemo(
  () => import("./heroui/email/magic-link-email"),
  ({ MagicLinkEmailDemo }) => MagicLinkEmailDemo
)

const HeroUINewDeviceEmailDemo = lazyDemo(
  () => import("./heroui/email/new-device-email"),
  ({ NewDeviceEmailDemo }) => NewDeviceEmailDemo
)

const HeroUIOrganizationInvitationEmailDemo = lazyDemo(
  () => import("./heroui/email/organization-invitation-email"),
  ({ OrganizationInvitationEmailDemo }) => OrganizationInvitationEmailDemo
)

const HeroUIOtpEmailDemo = lazyDemo(
  () => import("./heroui/email/otp-email"),
  ({ OtpEmailDemo }) => OtpEmailDemo
)

const HeroUIPasswordChangedEmailDemo = lazyDemo(
  () => import("./heroui/email/password-changed-email"),
  ({ PasswordChangedEmailDemo }) => PasswordChangedEmailDemo
)

const HeroUIResetPasswordEmailDemo = lazyDemo(
  () => import("./heroui/email/reset-password-email"),
  ({ ResetPasswordEmailDemo }) => ResetPasswordEmailDemo
)

const HeroUIMagicLinkDemo = lazyDemo(
  () => import("./heroui/magic-link/magic-link"),
  ({ MagicLinkDemo }) => MagicLinkDemo
)

const HeroUIManageAccountsDemo = lazyDemo(
  () => import("./heroui/multi-session/manage-accounts"),
  ({ ManageAccountsDemo }) => ManageAccountsDemo
)

const HeroUISwitchAccountSubmenuDemo = lazyDemo(
  () => import("./heroui/multi-session/switch-account-submenu"),
  ({ SwitchAccountSubmenuDemo }) => SwitchAccountSubmenuDemo
)

const HeroUIOrganizationDemo = lazyDemo(
  () => import("./heroui/organization/organization"),
  ({ OrganizationDemo }) => OrganizationDemo
)

const HeroUIOrganizationDangerZoneDemo = lazyDemo(
  () => import("./heroui/organization/organization-danger-zone"),
  ({ OrganizationDangerZoneDemo }) => OrganizationDangerZoneDemo
)

const HeroUIOrganizationInvitationsDemo = lazyDemo(
  () => import("./heroui/organization/organization-invitations"),
  ({ OrganizationInvitationsDemo }) => OrganizationInvitationsDemo
)

const HeroUIOrganizationMembersDemo = lazyDemo(
  () => import("./heroui/organization/organization-members"),
  ({ OrganizationMembersDemo }) => OrganizationMembersDemo
)

const HeroUIOrganizationPeopleDemo = lazyDemo(
  () => import("./heroui/organization/organization-people"),
  ({ OrganizationPeopleDemo }) => OrganizationPeopleDemo
)

const HeroUIOrganizationProfileDemo = lazyDemo(
  () => import("./heroui/organization/organization-profile"),
  ({ OrganizationProfileDemo }) => OrganizationProfileDemo
)

const HeroUIOrganizationSettingsDemo = lazyDemo(
  () => import("./heroui/organization/organization-settings"),
  ({ OrganizationSettingsDemo }) => OrganizationSettingsDemo
)

const HeroUIOrganizationSwitcherDemo = lazyDemo(
  () => import("./heroui/organization/organization-switcher"),
  ({ OrganizationSwitcherDemo }) => OrganizationSwitcherDemo
)

const HeroUIOrganizationsDemo = lazyDemo(
  () => import("./heroui/organization/organizations"),
  ({ OrganizationsDemo }) => OrganizationsDemo
)

const HeroUIOrganizationsSettingsDemo = lazyDemo(
  () => import("./heroui/organization/organizations-settings"),
  ({ OrganizationsSettingsDemo }) => OrganizationsSettingsDemo
)

const HeroUIUserInvitationsDemo = lazyDemo(
  () => import("./heroui/organization/user-invitations"),
  ({ UserInvitationsDemo }) => UserInvitationsDemo
)

const HeroUIPasskeySignInDemo = lazyDemo(
  () => import("./heroui/passkey/passkey-sign-in"),
  ({ PasskeySignInDemo }) => PasskeySignInDemo
)

const HeroUIAccountSettingsDemo = lazyDemo(
  () => import("./heroui/settings/account/account-settings"),
  ({ AccountSettingsDemo }) => AccountSettingsDemo
)

const HeroUIChangeEmailDemo = lazyDemo(
  () => import("./heroui/settings/account/change-email"),
  ({ ChangeEmailDemo }) => ChangeEmailDemo
)

const HeroUIUserProfileDemo = lazyDemo(
  () => import("./heroui/settings/account/user-profile"),
  ({ UserProfileDemo }) => UserProfileDemo
)

const HeroUIActiveSessionsDemo = lazyDemo(
  () => import("./heroui/settings/security/active-sessions"),
  ({ ActiveSessionsDemo }) => ActiveSessionsDemo
)

const HeroUIChangePasswordDemo = lazyDemo(
  () => import("./heroui/settings/security/change-password"),
  ({ ChangePasswordDemo }) => ChangePasswordDemo
)

const HeroUILinkedAccountsDemo = lazyDemo(
  () => import("./heroui/settings/security/linked-accounts"),
  ({ LinkedAccountsDemo }) => LinkedAccountsDemo
)

const HeroUIPasskeysDemo = lazyDemo(
  () => import("./heroui/settings/security/passkeys"),
  ({ PasskeysDemo }) => PasskeysDemo
)

const HeroUISecuritySettingsDemo = lazyDemo(
  () => import("./heroui/settings/security/security-settings"),
  ({ SecuritySettingsDemo }) => SecuritySettingsDemo
)

const HeroUISettingsDemo = lazyDemo(
  () => import("./heroui/settings/settings"),
  ({ SettingsDemo }) => SettingsDemo
)

const HeroUIAppearanceDemo = lazyDemo(
  () => import("./heroui/theme/appearance"),
  ({ AppearanceDemo }) => AppearanceDemo
)

const HeroUIThemeToggleItemDemo = lazyDemo(
  () => import("./heroui/theme/theme-toggle-item"),
  ({ ThemeToggleItemDemo }) => ThemeToggleItemDemo
)

const HeroUIUserAvatarDemo = lazyDemo(
  () => import("./heroui/user/user-avatar"),
  ({ UserAvatarDemo }) => UserAvatarDemo
)

const HeroUIUserButtonDemo = lazyDemo(
  () => import("./heroui/user/user-button"),
  ({ UserButtonDemo }) => UserButtonDemo
)

const HeroUIUserButtonIconDemo = lazyDemo(
  () => import("./heroui/user/user-button-icon"),
  ({ UserButtonIconDemo }) => UserButtonIconDemo
)

const HeroUIUserButtonLinksDemo = lazyDemo(
  () => import("./heroui/user/user-button-links"),
  ({ UserButtonLinksDemo }) => UserButtonLinksDemo
)

const HeroUIUserViewDemo = lazyDemo(
  () => import("./heroui/user/user-view"),
  ({ UserViewDemo }) => UserViewDemo
)

const HeroUISignInUsernameDemo = lazyDemo(
  () => import("./heroui/username/sign-in"),
  ({ SignInUsernameDemo }) => SignInUsernameDemo
)

const HeroUISignUpUsernameDemo = lazyDemo(
  () => import("./heroui/username/sign-up"),
  ({ SignUpUsernameDemo }) => SignUpUsernameDemo
)

const HeroUIUserProfileUsernameDemo = lazyDemo(
  () => import("./heroui/username/user-profile"),
  ({ UserProfileUsernameDemo }) => UserProfileUsernameDemo
)

const ShadcnApiKeysDemo = lazyDemo(
  () => import("./shadcn/api-key/api-keys"),
  ({ ApiKeysDemo }) => ApiKeysDemo
)

const ShadcnAuthDemo = lazyDemo(
  () => import("./shadcn/auth/auth"),
  ({ AuthDemo }) => AuthDemo
)

const ShadcnForgotPasswordDemo = lazyDemo(
  () => import("./shadcn/auth/forgot-password"),
  ({ ForgotPasswordDemo }) => ForgotPasswordDemo
)

const ShadcnResetPasswordDemo = lazyDemo(
  () => import("./shadcn/auth/reset-password"),
  ({ ResetPasswordDemo }) => ResetPasswordDemo
)

const ShadcnSignInDemo = lazyDemo(
  () => import("./shadcn/auth/sign-in"),
  ({ SignInDemo }) => SignInDemo
)

const ShadcnSignOutDemo = lazyDemo(
  () => import("./shadcn/auth/sign-out"),
  ({ SignOutDemo }) => SignOutDemo
)

const ShadcnSignUpDemo = lazyDemo(
  () => import("./shadcn/auth/sign-up"),
  ({ SignUpDemo }) => SignUpDemo
)

const ShadcnVerifyEmailDemo = lazyDemo(
  () => import("./shadcn/auth/verify-email"),
  ({ VerifyEmailDemo }) => VerifyEmailDemo
)

const ShadcnDangerZoneDemo = lazyDemo(
  () => import("./shadcn/delete-user/danger-zone"),
  ({ DangerZoneDemo }) => DangerZoneDemo
)

const ShadcnDeviceAuthorizationDemo = lazyDemo(
  () => import("./shadcn/device-authorization/device-authorization"),
  ({ DeviceAuthorizationDemo }) => DeviceAuthorizationDemo
)

const ShadcnChangeEmailConfirmationEmailDemo = lazyDemo(
  () => import("./shadcn/email/change-email-confirmation-email"),
  ({ ChangeEmailConfirmationEmailDemo }) => ChangeEmailConfirmationEmailDemo
)

const ShadcnDeleteAccountVerificationEmailDemo = lazyDemo(
  () => import("./shadcn/email/delete-account-verification-email"),
  ({ DeleteAccountVerificationEmailDemo }) => DeleteAccountVerificationEmailDemo
)

const ShadcnEmailChangedEmailDemo = lazyDemo(
  () => import("./shadcn/email/email-changed-email"),
  ({ EmailChangedEmailDemo }) => EmailChangedEmailDemo
)

const ShadcnEmailVerificationEmailDemo = lazyDemo(
  () => import("./shadcn/email/email-verification-email"),
  ({ EmailVerificationEmailDemo }) => EmailVerificationEmailDemo
)

const ShadcnMagicLinkEmailDemo = lazyDemo(
  () => import("./shadcn/email/magic-link-email"),
  ({ MagicLinkEmailDemo }) => MagicLinkEmailDemo
)

const ShadcnNewDeviceEmailDemo = lazyDemo(
  () => import("./shadcn/email/new-device-email"),
  ({ NewDeviceEmailDemo }) => NewDeviceEmailDemo
)

const ShadcnOrganizationInvitationEmailDemo = lazyDemo(
  () => import("./shadcn/email/organization-invitation-email"),
  ({ OrganizationInvitationEmailDemo }) => OrganizationInvitationEmailDemo
)

const ShadcnOtpEmailDemo = lazyDemo(
  () => import("./shadcn/email/otp-email"),
  ({ OtpEmailDemo }) => OtpEmailDemo
)

const ShadcnPasswordChangedEmailDemo = lazyDemo(
  () => import("./shadcn/email/password-changed-email"),
  ({ PasswordChangedEmailDemo }) => PasswordChangedEmailDemo
)

const ShadcnResetPasswordEmailDemo = lazyDemo(
  () => import("./shadcn/email/reset-password-email"),
  ({ ResetPasswordEmailDemo }) => ResetPasswordEmailDemo
)

const ShadcnMagicLinkDemo = lazyDemo(
  () => import("./shadcn/magic-link/magic-link"),
  ({ MagicLinkDemo }) => MagicLinkDemo
)

const ShadcnManageAccountsDemo = lazyDemo(
  () => import("./shadcn/multi-session/manage-accounts"),
  ({ ManageAccountsDemo }) => ManageAccountsDemo
)

const ShadcnSwitchAccountSubmenuDemo = lazyDemo(
  () => import("./shadcn/multi-session/switch-account-submenu"),
  ({ SwitchAccountSubmenuDemo }) => SwitchAccountSubmenuDemo
)

const ShadcnOrganizationDemo = lazyDemo(
  () => import("./shadcn/organization/organization"),
  ({ OrganizationDemo }) => OrganizationDemo
)

const ShadcnOrganizationDangerZoneDemo = lazyDemo(
  () => import("./shadcn/organization/organization-danger-zone"),
  ({ OrganizationDangerZoneDemo }) => OrganizationDangerZoneDemo
)

const ShadcnOrganizationInvitationsDemo = lazyDemo(
  () => import("./shadcn/organization/organization-invitations"),
  ({ OrganizationInvitationsDemo }) => OrganizationInvitationsDemo
)

const ShadcnOrganizationMembersDemo = lazyDemo(
  () => import("./shadcn/organization/organization-members"),
  ({ OrganizationMembersDemo }) => OrganizationMembersDemo
)

const ShadcnOrganizationPeopleDemo = lazyDemo(
  () => import("./shadcn/organization/organization-people"),
  ({ OrganizationPeopleDemo }) => OrganizationPeopleDemo
)

const ShadcnOrganizationProfileDemo = lazyDemo(
  () => import("./shadcn/organization/organization-profile"),
  ({ OrganizationProfileDemo }) => OrganizationProfileDemo
)

const ShadcnOrganizationSettingsDemo = lazyDemo(
  () => import("./shadcn/organization/organization-settings"),
  ({ OrganizationSettingsDemo }) => OrganizationSettingsDemo
)

const ShadcnOrganizationSwitcherDemo = lazyDemo(
  () => import("./shadcn/organization/organization-switcher"),
  ({ OrganizationSwitcherDemo }) => OrganizationSwitcherDemo
)

const ShadcnOrganizationsDemo = lazyDemo(
  () => import("./shadcn/organization/organizations"),
  ({ OrganizationsDemo }) => OrganizationsDemo
)

const ShadcnOrganizationsSettingsDemo = lazyDemo(
  () => import("./shadcn/organization/organizations-settings"),
  ({ OrganizationsSettingsDemo }) => OrganizationsSettingsDemo
)

const ShadcnUserInvitationsDemo = lazyDemo(
  () => import("./shadcn/organization/user-invitations"),
  ({ UserInvitationsDemo }) => UserInvitationsDemo
)

const ShadcnPasskeySignInDemo = lazyDemo(
  () => import("./shadcn/passkey/passkey-sign-in"),
  ({ PasskeySignInDemo }) => PasskeySignInDemo
)

const ShadcnAccountSettingsDemo = lazyDemo(
  () => import("./shadcn/settings/account/account-settings"),
  ({ AccountSettingsDemo }) => AccountSettingsDemo
)

const ShadcnChangeEmailDemo = lazyDemo(
  () => import("./shadcn/settings/account/change-email"),
  ({ ChangeEmailDemo }) => ChangeEmailDemo
)

const ShadcnUserProfileDemo = lazyDemo(
  () => import("./shadcn/settings/account/user-profile"),
  ({ UserProfileDemo }) => UserProfileDemo
)

const ShadcnActiveSessionsDemo = lazyDemo(
  () => import("./shadcn/settings/security/active-sessions"),
  ({ ActiveSessionsDemo }) => ActiveSessionsDemo
)

const ShadcnChangePasswordDemo = lazyDemo(
  () => import("./shadcn/settings/security/change-password"),
  ({ ChangePasswordDemo }) => ChangePasswordDemo
)

const ShadcnLinkedAccountsDemo = lazyDemo(
  () => import("./shadcn/settings/security/linked-accounts"),
  ({ LinkedAccountsDemo }) => LinkedAccountsDemo
)

const ShadcnPasskeysDemo = lazyDemo(
  () => import("./shadcn/settings/security/passkeys"),
  ({ PasskeysDemo }) => PasskeysDemo
)

const ShadcnSecuritySettingsDemo = lazyDemo(
  () => import("./shadcn/settings/security/security-settings"),
  ({ SecuritySettingsDemo }) => SecuritySettingsDemo
)

const ShadcnSettingsDemo = lazyDemo(
  () => import("./shadcn/settings/settings"),
  ({ SettingsDemo }) => SettingsDemo
)

const ShadcnAppearanceDemo = lazyDemo(
  () => import("./shadcn/theme/appearance"),
  ({ AppearanceDemo }) => AppearanceDemo
)

const ShadcnThemeToggleItemDemo = lazyDemo(
  () => import("./shadcn/theme/theme-toggle-item"),
  ({ ThemeToggleItemDemo }) => ThemeToggleItemDemo
)

const ShadcnUserAvatarDemo = lazyDemo(
  () => import("./shadcn/user/user-avatar"),
  ({ UserAvatarDemo }) => UserAvatarDemo
)

const ShadcnUserButtonDemo = lazyDemo(
  () => import("./shadcn/user/user-button"),
  ({ UserButtonDemo }) => UserButtonDemo
)

const ShadcnUserButtonIconDemo = lazyDemo(
  () => import("./shadcn/user/user-button-icon"),
  ({ UserButtonIconDemo }) => UserButtonIconDemo
)

const ShadcnUserButtonLinksDemo = lazyDemo(
  () => import("./shadcn/user/user-button-links"),
  ({ UserButtonLinksDemo }) => UserButtonLinksDemo
)

const ShadcnUserViewDemo = lazyDemo(
  () => import("./shadcn/user/user-view"),
  ({ UserViewDemo }) => UserViewDemo
)

const ShadcnSignInUsernameDemo = lazyDemo(
  () => import("./shadcn/username/sign-in"),
  ({ SignInUsernameDemo }) => SignInUsernameDemo
)

const ShadcnSignUpUsernameDemo = lazyDemo(
  () => import("./shadcn/username/sign-up"),
  ({ SignUpUsernameDemo }) => SignUpUsernameDemo
)

const ShadcnUserProfileUsernameDemo = lazyDemo(
  () => import("./shadcn/username/user-profile"),
  ({ UserProfileUsernameDemo }) => UserProfileUsernameDemo
)

const ZaidanChangeEmailConfirmationEmailDemo = lazyDemo(
  () => import("./zaidan/email/change-email-confirmation-email"),
  ({ ChangeEmailConfirmationEmailDemo }) => ChangeEmailConfirmationEmailDemo
)

const ZaidanDeleteAccountVerificationEmailDemo = lazyDemo(
  () => import("./zaidan/email/delete-account-verification-email"),
  ({ DeleteAccountVerificationEmailDemo }) => DeleteAccountVerificationEmailDemo
)

const ZaidanEmailChangedEmailDemo = lazyDemo(
  () => import("./zaidan/email/email-changed-email"),
  ({ EmailChangedEmailDemo }) => EmailChangedEmailDemo
)

const ZaidanEmailVerificationEmailDemo = lazyDemo(
  () => import("./zaidan/email/email-verification-email"),
  ({ EmailVerificationEmailDemo }) => EmailVerificationEmailDemo
)

const ZaidanMagicLinkEmailDemo = lazyDemo(
  () => import("./zaidan/email/magic-link-email"),
  ({ MagicLinkEmailDemo }) => MagicLinkEmailDemo
)

const ZaidanNewDeviceEmailDemo = lazyDemo(
  () => import("./zaidan/email/new-device-email"),
  ({ NewDeviceEmailDemo }) => NewDeviceEmailDemo
)

const ZaidanOrganizationInvitationEmailDemo = lazyDemo(
  () => import("./zaidan/email/organization-invitation-email"),
  ({ OrganizationInvitationEmailDemo }) => OrganizationInvitationEmailDemo
)

const ZaidanOtpEmailDemo = lazyDemo(
  () => import("./zaidan/email/otp-email"),
  ({ OtpEmailDemo }) => OtpEmailDemo
)

const ZaidanPasswordChangedEmailDemo = lazyDemo(
  () => import("./zaidan/email/password-changed-email"),
  ({ PasswordChangedEmailDemo }) => PasswordChangedEmailDemo
)

const ZaidanResetPasswordEmailDemo = lazyDemo(
  () => import("./zaidan/email/reset-password-email"),
  ({ ResetPasswordEmailDemo }) => ResetPasswordEmailDemo
)

export const demos: Record<string, LazyExoticComponent<ComponentType>> = {
  "heroui-account-settings": HeroUIAccountSettingsDemo,
  "heroui-active-sessions": HeroUIActiveSessionsDemo,
  "heroui-api-keys": HeroUIApiKeysDemo,
  "heroui-theme-appearance": HeroUIAppearanceDemo,
  "heroui-auth": HeroUIAuthDemo,
  "heroui-change-email": HeroUIChangeEmailDemo,
  "heroui-change-password": HeroUIChangePasswordDemo,
  "heroui-delete-user-danger-zone": HeroUIDangerZoneDemo,
  "heroui-device-authorization": HeroUIDeviceAuthorizationDemo,
  "heroui-change-email-confirmation-email":
    HeroUIChangeEmailConfirmationEmailDemo,
  "heroui-delete-account-verification-email":
    HeroUIDeleteAccountVerificationEmailDemo,
  "heroui-email-changed-email": HeroUIEmailChangedEmailDemo,
  "heroui-email-verification-email": HeroUIEmailVerificationEmailDemo,
  "heroui-forgot-password": HeroUIForgotPasswordDemo,
  "heroui-linked-accounts": HeroUILinkedAccountsDemo,
  "heroui-magic-link": HeroUIMagicLinkDemo,
  "heroui-magic-link-email": HeroUIMagicLinkEmailDemo,
  "heroui-manage-accounts": HeroUIManageAccountsDemo,
  "heroui-new-device-email": HeroUINewDeviceEmailDemo,
  "heroui-organization": HeroUIOrganizationDemo,
  "heroui-organization-danger-zone": HeroUIOrganizationDangerZoneDemo,
  "heroui-organization-invitations": HeroUIOrganizationInvitationsDemo,
  "heroui-organization-members": HeroUIOrganizationMembersDemo,
  "heroui-organization-people": HeroUIOrganizationPeopleDemo,
  "heroui-organization-profile": HeroUIOrganizationProfileDemo,
  "heroui-organization-settings": HeroUIOrganizationSettingsDemo,
  "heroui-organization-switcher": HeroUIOrganizationSwitcherDemo,
  "heroui-organizations": HeroUIOrganizationsDemo,
  "heroui-organizations-settings": HeroUIOrganizationsSettingsDemo,
  "heroui-user-invitations": HeroUIUserInvitationsDemo,
  "heroui-organization-invitation-email": HeroUIOrganizationInvitationEmailDemo,
  "heroui-otp-email": HeroUIOtpEmailDemo,
  "heroui-passkey-sign-in": HeroUIPasskeySignInDemo,
  "heroui-passkeys": HeroUIPasskeysDemo,
  "heroui-password-changed-email": HeroUIPasswordChangedEmailDemo,
  "heroui-reset-password": HeroUIResetPasswordDemo,
  "heroui-reset-password-email": HeroUIResetPasswordEmailDemo,
  "heroui-security-settings": HeroUISecuritySettingsDemo,
  "heroui-settings": HeroUISettingsDemo,
  "heroui-sign-in": HeroUISignInDemo,
  "heroui-sign-out": HeroUISignOutDemo,
  "heroui-sign-up": HeroUISignUpDemo,
  "heroui-switch-account-submenu": HeroUISwitchAccountSubmenuDemo,
  "heroui-user-avatar": HeroUIUserAvatarDemo,
  "heroui-user-button": HeroUIUserButtonDemo,
  "heroui-user-button-icon": HeroUIUserButtonIconDemo,
  "heroui-user-button-links": HeroUIUserButtonLinksDemo,
  "heroui-user-profile": HeroUIUserProfileDemo,
  "heroui-theme-toggle-item": HeroUIThemeToggleItemDemo,
  "heroui-user-view": HeroUIUserViewDemo,
  "heroui-username-sign-in": HeroUISignInUsernameDemo,
  "heroui-username-sign-up": HeroUISignUpUsernameDemo,
  "heroui-username-user-profile": HeroUIUserProfileUsernameDemo,
  "heroui-verify-email": HeroUIVerifyEmailDemo,
  "shadcn-account-settings": ShadcnAccountSettingsDemo,
  "shadcn-active-sessions": ShadcnActiveSessionsDemo,
  "shadcn-api-keys": ShadcnApiKeysDemo,
  "shadcn-theme-appearance": ShadcnAppearanceDemo,
  "shadcn-auth": ShadcnAuthDemo,
  "shadcn-change-email": ShadcnChangeEmailDemo,
  "shadcn-change-password": ShadcnChangePasswordDemo,
  "shadcn-delete-user-danger-zone": ShadcnDangerZoneDemo,
  "shadcn-device-authorization": ShadcnDeviceAuthorizationDemo,
  "shadcn-change-email-confirmation-email":
    ShadcnChangeEmailConfirmationEmailDemo,
  "shadcn-delete-account-verification-email":
    ShadcnDeleteAccountVerificationEmailDemo,
  "shadcn-email-changed-email": ShadcnEmailChangedEmailDemo,
  "shadcn-email-verification-email": ShadcnEmailVerificationEmailDemo,
  "shadcn-forgot-password": ShadcnForgotPasswordDemo,
  "shadcn-linked-accounts": ShadcnLinkedAccountsDemo,
  "shadcn-magic-link": ShadcnMagicLinkDemo,
  "shadcn-magic-link-email": ShadcnMagicLinkEmailDemo,
  "shadcn-manage-accounts": ShadcnManageAccountsDemo,
  "shadcn-new-device-email": ShadcnNewDeviceEmailDemo,
  "shadcn-organization": ShadcnOrganizationDemo,
  "shadcn-organization-danger-zone": ShadcnOrganizationDangerZoneDemo,
  "shadcn-organization-invitations": ShadcnOrganizationInvitationsDemo,
  "shadcn-organization-members": ShadcnOrganizationMembersDemo,
  "shadcn-organization-people": ShadcnOrganizationPeopleDemo,
  "shadcn-organization-profile": ShadcnOrganizationProfileDemo,
  "shadcn-organization-settings": ShadcnOrganizationSettingsDemo,
  "shadcn-organization-switcher": ShadcnOrganizationSwitcherDemo,
  "shadcn-organizations": ShadcnOrganizationsDemo,
  "shadcn-organizations-settings": ShadcnOrganizationsSettingsDemo,
  "shadcn-user-invitations": ShadcnUserInvitationsDemo,
  "shadcn-organization-invitation-email": ShadcnOrganizationInvitationEmailDemo,
  "shadcn-otp-email": ShadcnOtpEmailDemo,
  "shadcn-passkey-sign-in": ShadcnPasskeySignInDemo,
  "shadcn-passkeys": ShadcnPasskeysDemo,
  "shadcn-password-changed-email": ShadcnPasswordChangedEmailDemo,
  "shadcn-reset-password": ShadcnResetPasswordDemo,
  "shadcn-reset-password-email": ShadcnResetPasswordEmailDemo,
  "shadcn-security-settings": ShadcnSecuritySettingsDemo,
  "shadcn-settings": ShadcnSettingsDemo,
  "shadcn-sign-in": ShadcnSignInDemo,
  "shadcn-sign-out": ShadcnSignOutDemo,
  "shadcn-sign-up": ShadcnSignUpDemo,
  "shadcn-switch-account-submenu": ShadcnSwitchAccountSubmenuDemo,
  "shadcn-user-avatar": ShadcnUserAvatarDemo,
  "shadcn-user-button": ShadcnUserButtonDemo,
  "shadcn-user-button-icon": ShadcnUserButtonIconDemo,
  "shadcn-user-button-links": ShadcnUserButtonLinksDemo,
  "shadcn-user-profile": ShadcnUserProfileDemo,
  "shadcn-user-view": ShadcnUserViewDemo,
  "shadcn-username-sign-in": ShadcnSignInUsernameDemo,
  "shadcn-username-sign-up": ShadcnSignUpUsernameDemo,
  "shadcn-username-user-profile": ShadcnUserProfileUsernameDemo,
  "shadcn-verify-email": ShadcnVerifyEmailDemo,
  "shadcn-theme-toggle-item": ShadcnThemeToggleItemDemo,
  "zaidan-change-email-confirmation-email":
    ZaidanChangeEmailConfirmationEmailDemo,
  "zaidan-delete-account-verification-email":
    ZaidanDeleteAccountVerificationEmailDemo,
  "zaidan-email-changed-email": ZaidanEmailChangedEmailDemo,
  "zaidan-email-verification-email": ZaidanEmailVerificationEmailDemo,
  "zaidan-magic-link-email": ZaidanMagicLinkEmailDemo,
  "zaidan-new-device-email": ZaidanNewDeviceEmailDemo,
  "zaidan-organization-invitation-email": ZaidanOrganizationInvitationEmailDemo,
  "zaidan-otp-email": ZaidanOtpEmailDemo,
  "zaidan-password-changed-email": ZaidanPasswordChangedEmailDemo,
  "zaidan-reset-password-email": ZaidanResetPasswordEmailDemo
}
