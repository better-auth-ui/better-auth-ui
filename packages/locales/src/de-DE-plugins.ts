import type { AdminLocalization } from "@better-auth-ui/core/plugins/admin"
import type { AgentAuthLocalization } from "@better-auth-ui/core/plugins/agent-auth"
import type { AnonymousLocalization } from "@better-auth-ui/core/plugins/anonymous"
import type { ApiKeyLocalization } from "@better-auth-ui/core/plugins/api-key"
import type { BillingLocalization } from "@better-auth-ui/core/plugins/billing"
import type { DashLocalization } from "@better-auth-ui/core/plugins/dash"
import type { DeleteUserLocalization } from "@better-auth-ui/core/plugins/delete-user"
import type { DeviceAuthorizationLocalization } from "@better-auth-ui/core/plugins/device-authorization"
import type { EmailOtpLocalization } from "@better-auth-ui/core/plugins/email-otp"
import type { LastLoginMethodLocalization } from "@better-auth-ui/core/plugins/last-login-method"
import type { MagicLinkLocalization } from "@better-auth-ui/core/plugins/magic-link"
import type { MultiSessionLocalization } from "@better-auth-ui/core/plugins/multi-session"
import type { OAuthProviderLocalization } from "@better-auth-ui/core/plugins/oauth-provider"
import type { OrganizationLocalization } from "@better-auth-ui/core/plugins/organization"
import type { PasskeyLocalization } from "@better-auth-ui/core/plugins/passkey"
import type { PhoneNumberLocalization } from "@better-auth-ui/core/plugins/phone-number"
import type { SiweLocalization } from "@better-auth-ui/core/plugins/siwe"
import type { SsoLocalization } from "@better-auth-ui/core/plugins/sso"
import type { ThemeLocalization } from "@better-auth-ui/core/plugins/theme"
import type { TwoFactorLocalization } from "@better-auth-ui/core/plugins/two-factor"
import type { UsernameLocalization } from "@better-auth-ui/core/plugins/username"

type Translated<T> = {
  [TKey in keyof T]: T[TKey] extends Record<string, unknown>
    ? Translated<T[TKey]>
    : string
}

export const deDEPlugins = {
  admin: {
    accessDenied: "Zugriff verweigert",
    accessDeniedDescription:
      "Du hast keine Berechtigung, Benutzer zu verwalten.",
    active: "Aktiv",
    admin: "Administration",
    banned: "Gesperrt",
    banUser: "Benutzer sperren",
    cancel: "Abbrechen",
    close: "Schließen",
    copyUserId: "Benutzer-ID kopieren",
    created: "Erstellt",
    createUser: "Benutzer erstellen",
    deleteUser: "Benutzer löschen",
    email: "E-Mail",
    loadUsersError: "Benutzer konnten nicht geladen werden",
    loadUsersErrorDescription:
      "Versuche es erneut oder prüfe die Konfiguration des Admin-Plugins.",
    name: "Name",
    noUsers: "Keine Benutzer gefunden",
    noUsersDescription: "Ändere die Suche oder erstelle einen Benutzer.",
    nextPage: "Nächste Seite",
    previousPage: "Vorherige Seite",
    impersonateUser: "Benutzeridentität übernehmen",
    overview: "Übersicht",
    password: "Passwort",
    retry: "Erneut versuchen",
    role: "Rolle",
    search: "Suche",
    searchByEmail: "Nach E-Mail suchen",
    searchByName: "Nach Namen suchen",
    sessions: "Sitzungen",
    noSessions: "Keine aktiven Sitzungen",
    revoke: "Widerrufen",
    revokeAllSessions: "Alle Sitzungen widerrufen",
    saveRole: "Rolle speichern",
    setPassword: "Passwort festlegen",
    status: "Status",
    stopImpersonating: "Identitätswechsel beenden",
    userDetails: "Benutzerdetails",
    userId: "Benutzer-ID",
    unknownView: "Unbekannte Admin-Ansicht",
    unknownViewDescription:
      "Dieser statische Admin-Pfad ist nicht registriert.",
    unbanUser: "Benutzersperre aufheben",
    users: "Benutzer",
    usersDescription: "Benutzerzugriff, Rollen und Sitzungen verwalten.",
    usersPaginationRange: "{{from}}-{{to}} von {{total}}"
  } satisfies Translated<AdminLocalization>,
  agentAuth: {
    approvalTitle: "Agentenzugriff genehmigen",
    approvalDescription:
      "Prüfe, was dieser Agent in deinem Namen ausführen möchte.",
    requestedCapabilities: "Angeforderte Berechtigungen",
    requestReason: "Grund",
    constraints: "Einschränkungen",
    delegatedAgent: "Delegierter Agent",
    autonomousAgent: "Autonomer Agent",
    approvalNone: "Keine zusätzliche Prüfung",
    approvalSession: "Kürzliche Anmeldung",
    approvalWebauthn: "Passkey erforderlich",
    allow: "Auswahl erlauben",
    deny: "Ablehnen",
    approvedTitle: "Zugriff genehmigt",
    approvedDescription:
      "Der Agent kann jetzt die ausgewählten Berechtigungen verwenden.",
    deniedTitle: "Zugriff abgelehnt",
    deniedDescription: "Der Agent hat keinen Zugriff erhalten.",
    noCapabilities: "Diese Anfrage enthält keine offenen Berechtigungen.",
    invalidRequest: "In diesem Genehmigungslink fehlt die Agentenkennung.",
    approvalError:
      "Diese Anfrage konnte nicht aktualisiert werden. Versuche es erneut.",
    agents: "Agentenzugriff",
    agentsDescription:
      "Prüfe Agenten und widerrufe nicht mehr vertrauenswürdige Berechtigungen.",
    noAgents: "Keine Agenten haben Zugriff auf dein Konto.",
    active: "Aktiv",
    pending: "Ausstehend",
    denied: "Abgelehnt",
    revoked: "Widerrufen",
    expires: "Läuft am {date} ab",
    lastUsed: "Zuletzt verwendet am {date}",
    neverUsed: "Nie verwendet",
    revoke: "Widerrufen",
    revokeTitle: "Berechtigung widerrufen?",
    revokeDescription: "Der Agent verliert diese Berechtigung sofort.",
    confirmRevoke: "Berechtigung widerrufen"
  } satisfies Translated<AgentAuthLocalization>,
  anonymous: {
    continueAsGuest: "Als Gast fortfahren"
  } satisfies Translated<AnonymousLocalization>,
  apiKey: {
    apiKey: "API-Schlüssel",
    apiKeys: "API-Schlüssel",
    apiKeysDescription:
      "Erstelle einen API-Schlüssel für den programmatischen Zugriff auf dein Konto.",
    createApiKey: "API-Schlüssel erstellen",
    noApiKeys: "Keine API-Schlüssel",
    name: "Name",
    expiration: "Ablauf",
    day: "Tag",
    days: "Tage",
    never: "Nie",
    created: "Erstellt",
    expires: "Läuft ab",
    neverExpires: "Läuft nie ab",
    newApiKey: "Neuer API-Schlüssel",
    newApiKeyWarning:
      "Dieser API-Schlüssel wird nur jetzt angezeigt. Kopiere ihn und bewahre ihn sicher auf.",
    deleteApiKey: "API-Schlüssel löschen",
    deleteApiKeyWarning:
      "Diese Aktion kann nicht rückgängig gemacht werden. Alle Dienste mit diesem API-Schlüssel funktionieren sofort nicht mehr.",
    dismissNewKey: "Ich habe meinen Schlüssel gespeichert",
    editApiKey: "API-Schlüssel bearbeiten",
    configuration: "Konfiguration",
    enabled: "Aktiviert",
    disabled: "Deaktiviert",
    permissions: "Berechtigungen",
    metadata: "Metadaten (JSON)",
    quota: "Anfragelimit",
    refillAmount: "Auffüllmenge",
    refillInterval: "Auffüllintervall (Millisekunden)",
    rateLimit: "Ratenbegrenzung",
    rateLimitMax: "Maximale Anfragen",
    rateLimitWindow: "Zeitfenster (Millisekunden)",
    requests: "Anfragen",
    remaining: "Verbleibend",
    lastRequest: "Letzte Anfrage",
    neverRequested: "Nie angefragt",
    sortBy: "Sortieren nach",
    newest: "Neueste",
    oldest: "Älteste",
    nameAscending: "Name A–Z",
    nameDescending: "Name Z–A",
    previousPage: "Vorherige Seite",
    nextPage: "Nächste Seite"
  } satisfies Translated<ApiKeyLocalization>,
  billing: {
    billing: "Abrechnung",
    billingDescription:
      "Verwalte Tarife, Abonnementdetails, Plätze und Nutzung.",
    plans: "Tarife",
    currentPlan: "Aktueller Tarif",
    choosePlan: "Tarif auswählen",
    changePlan: "Tarif ändern",
    perMonth: "pro Monat",
    perYear: "pro Jahr",
    oneTime: "einmalig",
    popular: "Beliebt",
    subscription: "Abonnement",
    noSubscription: "Kein aktives Abonnement",
    noSubscriptionDescription:
      "Wähle einen Tarif, um ein Abonnement zu starten.",
    manageBilling: "Abrechnung verwalten",
    renewsOn: "Verlängert sich am {{date}}",
    endsOn: "Endet am {{date}}",
    cancelSubscription: "Abonnement kündigen",
    cancelSubscriptionTitle: "Abonnement kündigen?",
    cancelSubscriptionDescription:
      "Dein Zugriff bleibt bis zum Ende des aktuellen Abrechnungszeitraums bestehen.",
    restoreSubscription: "Abonnement wiederherstellen",
    restoreSubscriptionTitle: "Abonnement wiederherstellen?",
    restoreSubscriptionDescription:
      "Dein Abonnement verlängert sich weiterhin mit dem aktuellen Tarif.",
    confirm: "Bestätigen",
    cancel: "Abbrechen",
    seats: "Plätze",
    updateSeats: "Plätze aktualisieren",
    usage: "Nutzung",
    unlimited: "Unbegrenzt",
    used: "{{used}} verwendet",
    loadingBilling: "Abrechnungsdaten werden geladen"
  } satisfies Translated<BillingLocalization>,
  dash: {
    activity: "Aktivität",
    activityDescription:
      "Prüfe die letzten Authentifizierungs- und Kontoaktivitäten.",
    adminUserActivityDescription:
      "Prüfe die letzten Authentifizierungs- und Kontoaktivitäten für diesen Benutzer.",
    organizationActivityDescription:
      "Prüfe die für dich sichtbaren Aktivitäten dieser Organisation.",
    organizationWide: "Gesamte Organisation",
    personalOnly: "Deine Aktivität",
    noActivity: "Keine gespeicherte Aktivität",
    noActivityDescription:
      "Keine gespeicherte Aktivität entspricht dieser Ansicht.",
    activityLoadError: "Aktivität konnte nicht geladen werden",
    activityLoadErrorDescription:
      "Prüfe die Dash-Client-Konfiguration und versuche es erneut.",
    retry: "Erneut versuchen",
    paginationRange: "{{from}}–{{to}} von {{total}}",
    previousPage: "Vorherige Seite",
    nextPage: "Nächste Seite",
    unknownEvent: "Aktivitätsereignis",
    eventLabels: {
      account_linked: "Konto verknüpft",
      account_unlinked: "Kontoverknüpfung aufgehoben",
      all_sessions_revoked: "Alle Sitzungen widerrufen",
      email_changed: "E-Mail-Adresse geändert",
      email_verification_sent: "Bestätigungs-E-Mail gesendet",
      email_verified: "E-Mail-Adresse bestätigt",
      organization_created: "Organisation erstellt",
      organization_member_added: "Mitglied hinzugefügt",
      organization_member_invite_accepted: "Einladung angenommen",
      organization_member_invite_canceled: "Einladung abgebrochen",
      organization_member_invite_rejected: "Einladung abgelehnt",
      organization_member_invited: "Mitglied eingeladen",
      organization_member_removed: "Mitglied entfernt",
      organization_member_role_updated: "Mitgliedsrolle aktualisiert",
      organization_team_created: "Team erstellt",
      organization_team_deleted: "Team gelöscht",
      organization_team_member_added: "Teammitglied hinzugefügt",
      organization_team_member_removed: "Teammitglied entfernt",
      organization_team_updated: "Team aktualisiert",
      organization_updated: "Organisation aktualisiert",
      password_changed: "Passwort geändert",
      password_reset_completed: "Passwort zurückgesetzt",
      password_reset_requested: "Passwortzurücksetzung angefordert",
      profile_image_updated: "Profilbild aktualisiert",
      profile_updated: "Profil aktualisiert",
      session_created: "Sitzung erstellt",
      session_revoked: "Sitzung widerrufen",
      two_factor_disabled: "Zwei-Faktor-Authentifizierung deaktiviert",
      two_factor_enabled: "Zwei-Faktor-Authentifizierung aktiviert",
      two_factor_verified: "Zwei-Faktor-Authentifizierung bestätigt",
      user_banned: "Benutzer gesperrt",
      user_created: "Konto erstellt",
      user_deleted: "Benutzer gelöscht",
      user_impersonated: "Benutzeridentität übernommen",
      user_impersonated_stopped: "Identitätsübernahme beendet",
      user_sign_in_failed: "Anmeldung fehlgeschlagen",
      user_signed_in: "Angemeldet",
      user_signed_out: "Abgemeldet",
      user_unbanned: "Benutzersperre aufgehoben"
    }
  } satisfies Translated<DashLocalization>,
  deleteUser: {
    deleteAccount: "Konto löschen",
    deleteAccountDescription:
      "Lösche dein Konto und alle zugehörigen Daten dauerhaft. Diese Aktion kann nicht rückgängig gemacht werden.",
    deleteUserVerificationSent:
      "Prüfe deine E-Mails, um die Kontolöschung zu bestätigen.",
    deleteUserSuccess: "Dein Konto wurde gelöscht."
  } satisfies Translated<DeleteUserLocalization>,
  deviceAuthorization: {
    deviceAuthorization: "Geräteautorisierung",
    deviceAuthorizationDescription:
      "Gib den auf deinem Gerät angezeigten Code ein.",
    deviceCode: "Gerätecode",
    invalidDeviceCode: "Der Code ist ungültig oder abgelaufen.",
    continue: "Weiter",
    approveDevice: "Gerät genehmigen",
    approveDeviceDescription: "Ein Gerät fordert Zugriff auf dein Konto an.",
    signedInAs: "Angemeldet als",
    approve: "Genehmigen",
    deny: "Ablehnen",
    deviceApproved: "Gerät genehmigt",
    deviceApprovedDescription:
      "Das Gerät kann jetzt auf dein Konto zugreifen. Kehre zum Gerät zurück und fahre fort.",
    deviceDenied: "Gerät abgelehnt",
    deviceDeniedDescription:
      "Das Gerät hat keinen Zugriff auf dein Konto erhalten.",
    returnToApplication: "Zur Anwendung zurückkehren"
  } satisfies Translated<DeviceAuthorizationLocalization>,
  emailOtp: {
    emailOtp: "E-Mail-Code",
    sendCode: "Code senden",
    code: "Code",
    verifyCode: "Code bestätigen",
    codeSentTo: "Wir haben einen Code an {{email}} gesendet",
    codeLengthMismatch: "Gib den {{length}}-stelligen Code ein",
    useDifferentEmail: "Andere E-Mail-Adresse verwenden",
    codeSent: "Code gesendet",
    emailVerified: "E-Mail-Adresse bestätigt",
    confirmCurrentEmail: "Aktuelle E-Mail-Adresse bestätigen",
    confirmNewEmail: "Neue E-Mail-Adresse bestätigen",
    confirmEmailDescription:
      "Gib den an {{email}} gesendeten Code ein, um die Änderung abzuschließen"
  } satisfies Translated<EmailOtpLocalization>,
  lastLoginMethod: {
    lastUsed: "Zuletzt verwendet",
    lastUsedShort: "Zuletzt"
  } satisfies Translated<LastLoginMethodLocalization>,
  magicLink: {
    magicLink: "Magischer Link",
    sendMagicLink: "Magischen Link senden",
    magicLinkSent: "Prüfe deine E-Mails auf den magischen Link",
    magicLinkSentTo: "Wir haben einen magischen Link an {{email}} gesendet"
  } satisfies Translated<MagicLinkLocalization>,
  multiSession: {
    switchAccount: "Konto wechseln",
    addAccount: "Konto hinzufügen",
    manageAccounts: "Konten verwalten",
    manageAccountsDescription:
      "Verwalte deine Konten für einen sicheren Zugriff."
  } satisfies Translated<MultiSessionLocalization>,
  oauthProvider: {
    authorize: "{{client}} autorisieren",
    authorizationDescription: "{{client}} möchte auf dein Konto zugreifen.",
    requestedPermissions: "Dadurch kann {{client}} Folgendes ausführen:",
    signedInAs: "Angemeldet als",
    allow: "Erlauben",
    cancel: "Abbrechen",
    privacyPolicy: "Datenschutzrichtlinie",
    termsOfService: "Nutzungsbedingungen",
    invalidRequest: "Ungültige Autorisierungsanfrage",
    invalidRequestDescription:
      "In dieser Autorisierungsanfrage fehlen erforderliche Daten oder die Anfrage ist nicht mehr gültig.",
    application: "Anwendung",
    selectAccount: "Konto auswählen",
    selectAccountDescription:
      "Wähle das Konto aus, das du mit {{client}} verwenden möchtest.",
    currentAccount: "Aktuell",
    continue: "Weiter",
    noAccounts: "Keine Konten verfügbar",
    noAccountsDescription: "Melde dich an, um mit {{client}} fortzufahren.",
    accountCreated: "Konto erstellt",
    continuing: "Du wirst zu {{client}} zurückgeleitet.",
    continueFailed:
      "Dein Konto ist bereit, aber du konntest nicht zu {{client}} zurückgeleitet werden.",
    tryAgain: "Erneut versuchen",
    connectedApplications: "Verbundene Anwendungen",
    noConnectedApplications: "Keine verbundenen Anwendungen",
    connectedApplicationsDescription:
      "Von dir autorisierte Anwendungen werden hier angezeigt.",
    lastAuthorized: "Zuletzt autorisiert",
    removeAuthorization: "Autorisierung entfernen",
    removeAuthorizationTitle: "Autorisierung entfernen?",
    removeAuthorizationDescription:
      "Diese Anwendung benötigt deine Genehmigung, bevor sie neuen Zugriff erhält. Bestehende Token können bis zu ihrem Ablauf gültig bleiben.",
    remove: "Entfernen",
    oauthClients: "OAuth-Clients",
    oauthClientsDescription:
      "Erstelle und verwalte Anwendungen, die Kontozugriff anfordern können.",
    noOAuthClients: "Keine OAuth-Clients",
    noOAuthClientsDescription:
      "Erstelle einen Client, wenn deine Anwendung OAuth verwenden kann.",
    createClient: "Client erstellen",
    editClient: "Client bearbeiten",
    clientName: "Clientname",
    applicationType: "Anwendungstyp",
    webApplication: "Web",
    nativeApplication: "Nativ",
    redirectUrls: "Weiterleitungs-URLs",
    redirectUrlsDescription: "Gib eine URL pro Zeile ein.",
    applicationUrl: "Anwendungs-URL",
    logoUrl: "Logo-URL",
    scopes: "Geltungsbereiche",
    saveChanges: "Änderungen speichern",
    clientId: "Client-ID",
    clientSecret: "Clientschlüssel",
    clientSecretWarning:
      "Kopiere diesen Schlüssel jetzt. Er wird nicht erneut angezeigt.",
    rotateSecret: "Schlüssel rotieren",
    rotateSecretTitle: "Clientschlüssel rotieren?",
    rotateSecretDescription:
      "Der aktuelle Schlüssel funktioniert sofort nicht mehr.",
    deleteClient: "Client löschen",
    deleteClientTitle: "OAuth-Client löschen?",
    deleteClientDescription:
      "Dadurch wird der Client dauerhaft entfernt und neue Autorisierungsanfragen werden beendet.",
    enabled: "Aktiviert",
    disabled: "Deaktiviert",
    clientCreated: "Client erstellt",
    secretRotated: "Schlüssel rotiert"
  } satisfies Translated<OAuthProviderLocalization>,
  organization: {
    accept: "Annehmen",
    acceptInvitationTitle: "Organisationseinladung",
    acceptInvitationDescription:
      "Du wurdest eingeladen, {{organization}} als {{role}} beizutreten.",
    accepted: "Angenommen",
    actions: "Aktionen",
    admin: "Administrator",
    all: "Alle",
    canceled: "Abgebrochen",
    cancelInvitation: "Einladung abbrechen",
    changeLogo: "Logo ändern",
    changeMemberRole: "Rolle ändern",
    clear: "Leeren",
    createOrganization: "Organisation erstellen",
    deleteLogo: "Logo löschen",
    deleteOrganization: "Organisation löschen",
    deleteOrganizationDescription:
      "Lösche diese Organisation und alle zugehörigen Daten dauerhaft. Alle Mitglieder verlieren den Zugriff. Diese Aktion kann nicht rückgängig gemacht werden.",
    invitations: "Einladungen",
    invitationResent: "Einladung erneut gesendet",
    invitationUnavailable: "Einladung nicht verfügbar",
    invitationUnavailableDescription:
      "Diese Einladung ist ungültig, abgelaufen oder wurde bereits bearbeitet.",
    invitedAt: "Eingeladen am",
    inviteMember: "Mitglied einladen",
    inviteMemberSuccess: "Mitglied erfolgreich eingeladen",
    inviteMemberDescription:
      "Wir senden einen Link zum Beitritt per E-Mail. Wähle die Rolle aus, die nach der Annahme gilt.",
    leftOrganization: "Du hast die Organisation verlassen",
    leaveOrganization: "Organisation verlassen",
    leaveOrganizationDescription:
      "Verlasse diese Organisation und verliere den Zugriff auf ihre Daten und Ressourcen. Für einen erneuten Beitritt benötigst du eine neue Einladung.",
    logo: "Logo",
    logoChangedSuccess: "Logo erfolgreich aktualisiert",
    logoDeletedSuccess: "Logo erfolgreich entfernt",
    manage: "Verwalten",
    member: "Mitglied",
    memberRemoved: "Mitglied entfernt",
    memberRoleUpdated: "Mitgliedsrolle aktualisiert",
    members: "Mitglieder",
    people: "Personen",
    name: "Name",
    namePlaceholder: "Name der Organisation eingeben",
    noInvitations: "Keine Einladungen",
    noOrganizations: "Keine Organisationen",
    organization: "Organisation",
    organizationDeleted: "Organisation gelöscht",
    organizationInvitationsEmptyDescription:
      "Lade ein Teammitglied zur Zusammenarbeit in dieser Organisation ein.",
    organizations: "Organisationen",
    organizationsDescription:
      "Erstelle eine Organisation, um mit anderen zusammenzuarbeiten und gemeinsamen Zugriff zu verwalten.",
    organizationProfile: "Organisationsprofil",
    organizationUpdatedSuccess: "Organisation erfolgreich aktualisiert",
    owner: "Inhaber",
    pending: "Ausstehend",
    nextPage: "Nächste Seite",
    personalAccount: "Persönliches Konto",
    previousPage: "Vorherige Seite",
    rejected: "Abgelehnt",
    paginationRange: "{{from}}–{{to}} von {{total}}",
    return: "Zurück",
    rejectInvitation: "Einladung ablehnen",
    removeMember: "Mitglied entfernen",
    removeMemberWarning:
      "Möchtest du dieses Mitglied aus der Organisation entfernen? Der Zugriff geht sofort verloren.",
    resendInvitation: "Einladung erneut senden",
    role: "Rolle",
    search: "Suchen...",
    selectRoles: "Rollen auswählen",
    slug: "Slug",
    slugPlaceholder: "organisations-slug",
    status: "Status",
    uploadLogo: "Logo hochladen",
    userInvitationsEmptyDescription:
      "Einladungen zum Beitritt zu einer Organisation werden hier angezeigt.",
    teams: "Teams",
    team: "Team",
    teamsDescription: "Erstelle Teams und verwalte ihre Mitglieder.",
    selectTeam: "Team auswählen",
    allTeams: "Alle Teams",
    selectMember: "Mitglied auswählen",
    createTeam: "Team erstellen",
    renameTeam: "Team umbenennen",
    deleteTeam: "Team löschen",
    noTeams: "Keine Teams",
    noTeamsDescription:
      "Erstelle ein Team, um den Zugriff innerhalb dieser Organisation zu ordnen.",
    teamMembers: "Teammitglieder",
    addTeamMember: "Teammitglied hinzufügen",
    removeTeamMember: "Aus Team entfernen",
    teamCreated: "Team erstellt",
    teamUpdated: "Team aktualisiert",
    teamDeleted: "Team gelöscht",
    teamLimitReached: "Diese Organisation hat ihr Teamlimit erreicht.",
    teamMemberLimitReached: "Dieses Team hat sein Mitgliederlimit erreicht.",
    lastTeamRemovalDisabled:
      "Diese Organisation muss mindestens ein Team behalten.",
    limitReached: "Limit erreicht",
    organizationLimitReached: "Du hast das Organisationslimit erreicht.",
    membershipLimitReached:
      "Diese Organisation hat ihr Mitgliederlimit erreicht.",
    invitationLimitReached:
      "Diese Organisation hat ihr Einladungslimit erreicht.",
    roles: "Rollen",
    rolesDescription:
      "Erstelle Rollen und lege fest, was jede Rolle ausführen kann.",
    createRole: "Rolle erstellen",
    editRole: "Rolle bearbeiten",
    deleteRole: "Rolle löschen",
    deleteRoleDescription:
      "Lösche diese Rolle dauerhaft. Mitglieder müssen zuerst einer anderen Rolle zugewiesen werden.",
    roleName: "Rollenname",
    permissions: "Berechtigungen",
    noRoles: "Keine benutzerdefinierten Rollen",
    noRolesDescription:
      "Erstelle eine Rolle, um einen benutzerdefinierten Organisationszugriff festzulegen.",
    roleCreated: "Rolle erstellt",
    roleUpdated: "Rolle aktualisiert",
    roleDeleted: "Rolle gelöscht",
    roleInUse: "Diese Rolle ist {{count}} Mitgliedern zugewiesen.",
    roleNamePlaceholder: "support-agent"
  } satisfies Translated<OrganizationLocalization>,
  passkey: {
    passkey: "Passkey",
    addPasskey: "Passkey hinzufügen",
    deletePasskey: "Passkey {{name}} löschen",
    deletePasskeyTitle: "Passkey löschen",
    deletePasskeyWarning:
      "Diese Aktion kann nicht rückgängig gemacht werden. Du musst diesen Passkey erneut hinzufügen, bevor du ihn wieder zur Anmeldung verwenden kannst.",
    passkeys: "Passkeys",
    passkeysDescription:
      "Erstelle einen Passkey für den sicheren Zugriff auf dein Konto.",
    noPasskeys: "Keine Passkeys",
    name: "Name",
    renamePasskey: "Passkey umbenennen",
    renamePasskeySuccess: "Passkey umbenannt"
  } satisfies Translated<PasskeyLocalization>,
  phoneNumber: {
    country: "Land oder Region",
    invalidPhoneNumber: "Gib eine gültige Telefonnummer ein",
    phoneNumber: "Telefonnummer",
    phoneNumberPlaceholder: "+49 151 12345678",
    phoneCode: "Telefoncode",
    sendCode: "Code senden",
    verifyCode: "Code bestätigen",
    codeSentTo: "Wir haben einen Code an {{phoneNumber}} gesendet",
    codeLengthMismatch: "Gib den {{length}}-stelligen Code ein",
    useDifferentPhoneNumber: "Andere Telefonnummer verwenden",
    usePassword: "Passwort verwenden",
    useVerificationCode: "Bestätigungscode verwenden",
    forgotPassword: "Passwort vergessen?",
    resetPassword: "Passwort zurücksetzen",
    changePhoneNumber: "Telefonnummer ändern",
    updatePhoneNumber: "Telefonnummer aktualisieren",
    phoneNumberUpdated: "Telefonnummer aktualisiert",
    removePhoneNumber: "Telefonnummer entfernen",
    phoneNumberRemoved: "Telefonnummer entfernt",
    removePhoneNumberTitle: "Diese Telefonnummer aus deinem Konto entfernen?",
    removePhoneNumberDescription:
      "Du kannst sie danach nicht mehr für die Anmeldung oder zum Zurücksetzen deines Passworts verwenden.",
    cancel: "Abbrechen"
  } satisfies Translated<PhoneNumberLocalization>,
  siwe: {
    ethereum: "Ethereum",
    continueWithEthereum: "Mit Ethereum fortfahren",
    signMessage: "Nachricht signieren",
    email: "E-Mail-Adresse",
    emailDescription: "Füge diesem Wallet-Konto eine E-Mail-Adresse hinzu.",
    emailOptional: "E-Mail-Adresse (optional)",
    wallets: "Wallets",
    walletsDescription:
      "Verwalte die mit deinem Konto verbundenen Ethereum-Wallets.",
    connectWallet: "Wallet verbinden",
    noWallets: "Keine Ethereum-Wallets sind verbunden.",
    primary: "Primär",
    setPrimary: "Als primär festlegen",
    removeWallet: "Wallet entfernen",
    removeWalletTitle: "Ethereum-Wallet entfernen?",
    removeWalletWarning:
      "Du kannst dich mit diesem Wallet nicht anmelden, bis du es erneut verbindest.",
    chain: "Chain {{chainId}}"
  } satisfies Translated<SiweLocalization>,
  sso: {
    continueWithEmail: "Mit E-Mail-Adresse fortfahren",
    continueWithSso: "Mit SSO fortfahren",
    emailFirstDescription:
      "Gib deine geschäftliche E-Mail-Adresse ein, um fortzufahren.",
    useDifferentEmail: "Andere E-Mail-Adresse verwenden",
    noProvider:
      "Es wurde keine Organisationsanmeldung gefunden. Wähle eine andere Methode, um fortzufahren.",
    ssoUnavailable:
      "Die Organisationsanmeldung ist nicht verfügbar. Versuche eine andere Anmeldemethode."
  } satisfies Translated<SsoLocalization>,
  theme: {
    appearance: "Darstellung",
    theme: "Design",
    system: "System",
    light: "Hell",
    dark: "Dunkel"
  } satisfies Translated<ThemeLocalization>,
  twoFactor: {
    twoFactor: "Zwei-Faktor-Authentifizierung",
    twoFactorDescription:
      "Füge der Anmeldung einen zweiten Schritt hinzu, damit ein gestohlenes Passwort nicht ausreicht",
    enableTwoFactor: "Zwei-Faktor-Authentifizierung aktivieren",
    disableTwoFactor: "Zwei-Faktor-Authentifizierung deaktivieren",
    twoFactorEnabled: "Zwei-Faktor-Authentifizierung ist aktiviert",
    twoFactorDisabled: "Zwei-Faktor-Authentifizierung ist deaktiviert",
    passwordConfirmation: "Gib dein Passwort ein, um fortzufahren",
    scanQrCode: "Scanne dies mit deiner Authenticator-App",
    setupKey: "Scannen nicht möglich? Gib stattdessen diesen Schlüssel ein",
    setupKeyCopied: "Einrichtungsschlüssel kopiert",
    setupKeyCopyFailed:
      "Der Einrichtungsschlüssel konnte nicht kopiert werden. Wähle ihn aus und kopiere ihn manuell.",
    authenticatorCode: "Authenticator-Code",
    authenticatorCodeDescription:
      "Gib den Code aus deiner Authenticator-App ein",
    emailedCode: "Code per E-Mail",
    emailedCodeDescription:
      "Wir haben dir einen Code per E-Mail gesendet. Gib ihn ein, um die Anmeldung abzuschließen",
    sendEmailCode: "Code per E-Mail senden",
    backupCode: "Wiederherstellungscode",
    backupCodeDescription:
      "Gib einen deiner gespeicherten Wiederherstellungscodes ein",
    backupCodes: "Wiederherstellungscodes",
    backupCodesForWebsite: "Wiederherstellungscodes für {{website}}",
    backupCodesDescription:
      "Bewahre diese Codes sicher auf. Jeder Code funktioniert einmal, falls du deinen Authenticator verlierst.",
    backupCodesCopied: "Wiederherstellungscodes kopiert",
    backupCodesCopyFailed:
      "Die Wiederherstellungscodes konnten nicht kopiert werden. Wähle sie aus und kopiere sie manuell.",
    downloadBackupCodes: ".txt herunterladen",
    printBackupCodes: "Drucken",
    regenerateBackupCodes: "Wiederherstellungscodes neu erstellen",
    backupCodesRegenerated:
      "Neue Wiederherstellungscodes erstellt. Die alten Codes funktionieren nicht mehr.",
    useAuthenticator: "Authenticator-App verwenden",
    useEmailedCode: "Code per E-Mail verwenden",
    useBackupCode: "Wiederherstellungscode verwenden",
    trustDevice: "Diesem Gerät vertrauen",
    trustDeviceDescription:
      "Den zweiten Schritt auf diesem Gerät zukünftig überspringen",
    verify: "Bestätigen",
    codeLengthMismatch: "Gib den {{length}}-stelligen Code ein",
    backToSignIn: "Zurück zur Anmeldung",
    done: "Fertig"
  } satisfies Translated<TwoFactorLocalization>,
  username: {
    username: "Benutzername",
    usernamePlaceholder: "Benutzername",
    usernameOrEmailPlaceholder: "Benutzername oder E-Mail-Adresse",
    usernameAvailable: "Benutzername ist verfügbar",
    usernameTaken: "Benutzername ist bereits vergeben. Versuche einen anderen.",
    displayUsername: "Anzeigename",
    displayUsernamePlaceholder: "Anzeigename"
  } satisfies Translated<UsernameLocalization>
}
