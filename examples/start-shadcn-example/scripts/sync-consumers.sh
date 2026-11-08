#!/usr/bin/env bash
#
# Sync component and library sources from this example into the docs app and
# the other shadcn examples.
#
# `cp -r` never prunes, so each mirrored subtree is removed up front and
# re-created from scratch to keep renames and deletions propagating cleanly.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EXAMPLE_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
SRC="$EXAMPLE_DIR/src"

MIRRORS=(
  components/auth
  components/ui
  lib/auth
)

TARGETS=(
  "$EXAMPLE_DIR/../next-shadcn-example/src"
)

DOCS_TARGET="$EXAMPLE_DIR/../../apps/docs/src"

# Most auth components and plugin scaffolding work with both Radix and Base UI.
# Keep the few primitive-specific consumers owned by the Base UI example.
AGNOSTIC_MIRRORS=(
  components/auth
  lib/auth
)

BASE_UI_TARGET="$EXAMPLE_DIR/../start-shadcn-baseui-example/src"
BASE_UI_OVERRIDES=(
  components/auth/additional-field.tsx
  components/auth/admin/admin-users.tsx
  components/auth/admin/admin.tsx
  components/auth/api-key/api-keys.tsx
  components/auth/api-key/create-api-key-dialog.tsx
  components/auth/billing/billing-settings.tsx
  components/auth/dash/activity.tsx
  components/auth/oauth-provider/oauth-clients.tsx
  # Preserve Base UI's onCheckedChange handler instead of Radix's onSelect.
  components/auth/organization/invite-member-dialog.tsx
  components/auth/organization/organization-member-row.tsx
  components/auth/organization/organization-teams.tsx
  components/auth/organization/team-switcher.tsx
  components/auth/phone-number/international-phone-field.tsx
  components/auth/phone-number/remove-phone-number-dialog.tsx
  components/auth/theme/theme-toggle-item.tsx
)

ARIA_UI_TARGET="$EXAMPLE_DIR/../start-shadcn-aria-example/src"
# React Aria consumers use its native composition and selection APIs.
ARIA_UI_OVERRIDES=(
  components/auth/additional-field.tsx
  components/auth/admin/admin-users.tsx
  components/auth/admin/admin.tsx
  components/auth/admin/stop-impersonating.tsx
  components/auth/agent-auth/agent-approval.tsx
  components/auth/agent-auth/agent-authorizations.tsx
  components/auth/anonymous/anonymous-button.tsx
  components/auth/api-key/api-key.tsx
  components/auth/api-key/api-keys-empty.tsx
  components/auth/api-key/api-keys.tsx
  components/auth/api-key/create-api-key-dialog.tsx
  components/auth/api-key/delete-api-key-dialog.tsx
  components/auth/api-key/edit-api-key-dialog.tsx
  components/auth/api-key/new-api-key-dialog.tsx
  components/auth/auth-form.tsx
  components/auth/auth-result.tsx
  components/auth/billing/billing-settings.tsx
  components/auth/dash/activity.tsx
  components/auth/delete-user/delete-account.tsx
  components/auth/device-authorization/device-authorization.tsx
  components/auth/email-otp/change-email-otp.tsx
  components/auth/email-otp/email-otp.tsx
  components/auth/email-otp/forgot-password-otp.tsx
  components/auth/email-otp/reset-password-otp.tsx
  components/auth/email-otp/verify-email-otp.tsx
  components/auth/forgot-password.tsx
  components/auth/magic-link.tsx
  components/auth/multi-session/manage-account.tsx
  components/auth/multi-session/switch-account-submenu-content.tsx
  components/auth/multi-session/switch-account-submenu-item.tsx
  components/auth/oauth-provider/authorized-application.tsx
  components/auth/oauth-provider/oauth-clients.tsx
  components/auth/oauth-provider/oauth-consent.tsx
  components/auth/oauth-provider/oauth-select-account.tsx
  components/auth/oauth-provider/oauth-sign-up.tsx
  components/auth/oauth-provider/remove-authorization-dialog.tsx
  components/auth/open-email-button.tsx
  components/auth/organization/accept-invitation.tsx
  components/auth/organization/change-organization-logo.tsx
  components/auth/organization/create-organization-dialog.tsx
  components/auth/organization/delete-organization-dialog.tsx
  components/auth/organization/delete-organization.tsx
  components/auth/organization/edit-member-roles-dialog.tsx
  components/auth/organization/invite-member-dialog.tsx
  components/auth/organization/leave-organization-dialog.tsx
  components/auth/organization/leave-organization.tsx
  components/auth/organization/organization-invitation-row.tsx
  components/auth/organization/organization-invitations-empty.tsx
  components/auth/organization/organization-invitations.tsx
  components/auth/organization/organization-member-row.tsx
  components/auth/organization/organization-members.tsx
  components/auth/organization/organization-profile.tsx
  components/auth/organization/organization-roles.tsx
  components/auth/organization/organization-row.tsx
  components/auth/organization/organization-sortable-table-head.tsx
  components/auth/organization/organization-switcher.tsx
  components/auth/organization/organization-table-bulk-action.tsx
  components/auth/organization/organization-table-pagination.tsx
  components/auth/organization/organization-table-selection.tsx
  components/auth/organization/organization-table-view-options.tsx
  components/auth/organization/organization-teams.tsx
  components/auth/organization/organization.tsx
  components/auth/organization/organizations-empty.tsx
  components/auth/organization/organizations.tsx
  components/auth/organization/remove-member-dialog.tsx
  components/auth/organization/slug-field.tsx
  components/auth/organization/team-switcher.tsx
  components/auth/organization/user-invitation-row.tsx
  components/auth/otp-field.tsx
  components/auth/passkey/add-passkey-dialog.tsx
  components/auth/passkey/delete-passkey-dialog.tsx
  components/auth/passkey/passkey-button.tsx
  components/auth/passkey/passkey.tsx
  components/auth/passkey/passkeys-empty.tsx
  components/auth/passkey/passkeys.tsx
  components/auth/passkey/rename-passkey-dialog.tsx
  components/auth/phone-number/change-phone-number.tsx
  components/auth/phone-number/forgot-phone-number-password.tsx
  components/auth/phone-number/international-phone-field.tsx
  components/auth/phone-number/phone-number.tsx
  components/auth/phone-number/remove-phone-number-dialog.tsx
  components/auth/phone-number/reset-phone-number-password.tsx
  components/auth/provider-button.tsx
  components/auth/reauthentication.tsx
  components/auth/reset-password.tsx
  components/auth/settings/account/change-avatar.tsx
  components/auth/settings/account/change-email.tsx
  components/auth/settings/account/user-profile.tsx
  components/auth/settings/security/active-session.tsx
  components/auth/settings/security/change-password.tsx
  components/auth/settings/security/linked-account.tsx
  components/auth/settings/security/session-actions.tsx
  components/auth/settings/settings.tsx
  components/auth/sign-in.tsx
  components/auth/sign-up.tsx
  components/auth/siwe/sign-in-ethereum-button.tsx
  components/auth/siwe/wallet-accounts.tsx
  components/auth/sso/email-first-sign-in.tsx
  components/auth/sso/organization-sso-providers.tsx
  components/auth/sso/sso-domain-verification.tsx
  components/auth/sso/sso-provider-setup.tsx
  components/auth/theme/appearance.tsx
  components/auth/theme/theme-toggle-item.tsx
  components/auth/two-factor/backup-codes.tsx
  components/auth/two-factor/disable-two-factor-dialog.tsx
  components/auth/two-factor/enable-two-factor-dialog.tsx
  components/auth/two-factor/regenerate-backup-codes-dialog.tsx
  components/auth/two-factor/two-factor-challenge.tsx
  components/auth/two-factor/two-factor-settings.tsx
  components/auth/user/user-button.tsx
  components/auth/username/sign-in-username.tsx
  components/auth/username/username-field.tsx
  components/auth/verify-email.tsx
  lib/auth/aria.ts
)

OVERRIDE_BACKUP="$(mktemp -d)"
trap 'rm -rf -- "$OVERRIDE_BACKUP"' EXIT

for path in "${BASE_UI_OVERRIDES[@]}"; do
  : "${path:?override path entry is empty}"
  mkdir -p -- "$OVERRIDE_BACKUP/$(dirname "$path")"
  cp -- "$BASE_UI_TARGET/$path" "$OVERRIDE_BACKUP/$path"
done

for path in "${ARIA_UI_OVERRIDES[@]}"; do
  mkdir -p -- "$OVERRIDE_BACKUP/aria/$(dirname "$path")"
  cp -- "$ARIA_UI_TARGET/$path" "$OVERRIDE_BACKUP/aria/$path"
done

for target in "${TARGETS[@]}"; do
  echo "→ syncing $target"
  for path in "${MIRRORS[@]}"; do
    : "${target:?target is empty}"
    : "${path:?mirror path entry is empty}"
    rm -rf -- "$target/$path"
    mkdir -p -- "$(dirname "$target/$path")"
    cp -R -- "$SRC/$path" "$target/$path"
  done
done

echo "→ syncing $BASE_UI_TARGET (shared files with Base UI overrides)"
for path in "${AGNOSTIC_MIRRORS[@]}"; do
  : "${path:?mirror path entry is empty}"
  rm -rf -- "$BASE_UI_TARGET/$path"
  mkdir -p -- "$(dirname "$BASE_UI_TARGET/$path")"
  cp -R -- "$SRC/$path" "$BASE_UI_TARGET/$path"
done

for path in "${BASE_UI_OVERRIDES[@]}"; do
  mkdir -p -- "$(dirname "$BASE_UI_TARGET/$path")"
  cp -- "$OVERRIDE_BACKUP/$path" "$BASE_UI_TARGET/$path"
done

# The docs use Base UI for both the site shell and interactive shadcn demos.
# Copy after restoring overrides so later syncs preserve primitive-specific APIs.
echo "→ syncing $DOCS_TARGET (Base UI sources)"
for path in "${MIRRORS[@]}"; do
  : "${path:?mirror path entry is empty}"
  rm -rf -- "$DOCS_TARGET/$path"
  mkdir -p -- "$(dirname "$DOCS_TARGET/$path")"
  cp -R -- "$BASE_UI_TARGET/$path" "$DOCS_TARGET/$path"
done

echo "→ syncing $ARIA_UI_TARGET (shared files with React Aria overrides)"
for path in "${AGNOSTIC_MIRRORS[@]}"; do
  : "${path:?mirror path entry is empty}"
  rm -rf -- "$ARIA_UI_TARGET/$path"
  mkdir -p -- "$(dirname "$ARIA_UI_TARGET/$path")"
  cp -R -- "$SRC/$path" "$ARIA_UI_TARGET/$path"
done

for path in "${ARIA_UI_OVERRIDES[@]}"; do
  mkdir -p -- "$ARIA_UI_TARGET/$(dirname "$path")"
  cp -- "$OVERRIDE_BACKUP/aria/$path" "$ARIA_UI_TARGET/$path"
done

echo "✓ source sync complete"
