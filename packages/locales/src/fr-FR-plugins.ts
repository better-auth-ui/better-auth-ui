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

export const frFRPlugins = {
  admin: {
    accessDenied: "Accès refusé",
    accessDeniedDescription:
      "Vous n’avez pas l’autorisation de gérer les utilisateurs.",
    active: "Actif",
    accountInformation: "Informations du compte",
    admin: "Administration",
    banned: "Banni",
    banDuration: "Durée du bannissement (jours)",
    banDurationDescription: "Laissez vide pour un bannissement définitif.",
    banExpires: "Fin du bannissement",
    banReason: "Motif du bannissement",
    banUser: "Bannir l’utilisateur",
    cancel: "Annuler",
    close: "Fermer",
    copyUserId: "Copier l’ID utilisateur",
    created: "Créé le",
    createUser: "Créer un utilisateur",
    deleteUser: "Supprimer l’utilisateur",
    dangerZone: "Zone de danger",
    email: "E-mail",
    emailVerified: "E-mail vérifié",
    endsWith: "Se termine par",
    filterAllStatuses: "Tous les statuts",
    loadUsersError: "Impossible de charger les utilisateurs",
    loadUsersErrorDescription:
      "Réessayez ou vérifiez la configuration du plugin Admin.",
    name: "Nom",
    moreActions: "Plus d’actions",
    noUsers: "Aucun utilisateur trouvé",
    noUsersDescription: "Modifiez la recherche ou créez un utilisateur.",
    nextPage: "Page suivante",
    previousPage: "Page précédente",
    impersonateUser: "Se connecter en tant que cet utilisateur",
    overview: "Vue d’ensemble",
    password: "Mot de passe",
    profileAndAccess: "Profil et accès",
    retry: "Réessayer",
    role: "Rôle",
    search: "Rechercher",
    searchOperator: "Opérateur de recherche",
    searchContains: "Contient",
    startsWith: "Commence par",
    searchByEmail: "Rechercher par e-mail",
    searchByName: "Rechercher par nom",
    sessions: "Sessions",
    noSessions: "Aucune session active",
    revoke: "Révoquer",
    revokeAllSessions: "Révoquer toutes les sessions",
    saveRole: "Enregistrer le rôle",
    saveChanges: "Enregistrer les modifications",
    saveUser: "Enregistrer l’utilisateur",
    setPassword: "Définir le mot de passe",
    security: "Sécurité",
    status: "Statut",
    sort: "Trier",
    sortNewest: "Plus récents d’abord",
    sortOldest: "Plus anciens d’abord",
    sortNameAscending: "Nom A-Z",
    sortNameDescending: "Nom Z-A",
    stopImpersonating: "Revenir à mon compte",
    userDetails: "Détails de l’utilisateur",
    userId: "ID utilisateur",
    unknownView: "Vue d’administration inconnue",
    unknownViewDescription:
      "Ce chemin d’administration statique n’est pas enregistré.",
    unbanUser: "Lever le bannissement",
    users: "Utilisateurs",
    usersDescription:
      "Gérez l’accès, les rôles et les sessions des utilisateurs.",
    usersPaginationRange: "{{from}}-{{to}} sur {{total}}"
  } satisfies Translated<AdminLocalization>,
  agentAuth: {
    approvalTitle: "Autoriser l’accès de l’agent",
    approvalDescription:
      "Vérifiez ce que cet agent souhaite faire en votre nom.",
    signedInAs: "Connecté en tant que",
    requestedCapabilities: "Capacités demandées",
    requestReason: "Motif",
    constraints: "Limites",
    delegatedAgent: "Agent délégué",
    autonomousAgent: "Agent autonome",
    approvalNone: "Aucune vérification supplémentaire",
    approvalSession: "Connexion récente",
    approvalWebauthn: "Clé d’accès requise",
    allow: "Autoriser la sélection",
    deny: "Refuser",
    approvedTitle: "Accès autorisé",
    approvedDescription:
      "L’agent peut maintenant utiliser les capacités que vous avez sélectionnées.",
    deniedTitle: "Accès refusé",
    deniedDescription: "L’agent n’a pas obtenu l’accès.",
    noCapabilities: "Cette demande ne comporte aucune capacité en attente.",
    invalidRequest:
      "Il manque l’identifiant de l’agent dans ce lien d’autorisation.",
    approvalError: "Impossible de mettre à jour cette demande. Réessayez.",
    agents: "Accès des agents",
    agentsDescription:
      "Passez en revue les agents et révoquez les capacités auxquelles vous ne faites plus confiance.",
    noAgents: "Aucun agent n’a accès à votre compte.",
    active: "Active",
    pending: "En attente",
    denied: "Refusée",
    revoked: "Révoquée",
    expires: "Expire le {date}",
    lastUsed: "Dernière utilisation : {date}",
    neverUsed: "Jamais utilisée",
    revoke: "Révoquer",
    revokeTitle: "Révoquer la capacité ?",
    revokeDescription: "L’agent perdra immédiatement cette capacité.",
    confirmRevoke: "Révoquer la capacité"
  } satisfies Translated<AgentAuthLocalization>,
  anonymous: {
    continueAsGuest: "Continuer en tant qu’invité"
  } satisfies Translated<AnonymousLocalization>,
  apiKey: {
    apiKey: "Clé d’API",
    apiKeys: "Clés d’API",
    apiKeysDescription:
      "Créez une clé d’API pour accéder à votre compte de façon programmatique.",
    createApiKey: "Créer une clé d’API",
    noApiKeys: "Aucune clé d’API",
    name: "Nom",
    expiration: "Expiration",
    day: "jour",
    days: "jours",
    never: "Jamais",
    created: "Créée le",
    expires: "Expire le",
    neverExpires: "N’expire jamais",
    newApiKey: "Nouvelle clé d’API",
    newApiKeyWarning:
      "C’est la seule fois que cette clé d’API s’affiche. Copiez-la et conservez-la en lieu sûr.",
    deleteApiKey: "Supprimer la clé d’API",
    deleteApiKeyWarning:
      "Cette action est irréversible. Tout service qui utilise cette clé d’API cessera aussitôt de fonctionner.",
    dismissNewKey: "J’ai enregistré ma clé",
    editApiKey: "Modifier la clé d’API",
    configuration: "Configuration",
    enabled: "Activée",
    disabled: "Désactivée",
    requests: "Requêtes",
    remaining: "Restantes",
    lastRequest: "Dernière requête",
    neverRequested: "Jamais utilisée",
    sortBy: "Trier par",
    newest: "Plus récentes",
    oldest: "Plus anciennes",
    nameAscending: "Nom A–Z",
    nameDescending: "Nom Z–A",
    previousPage: "Page précédente",
    nextPage: "Page suivante"
  } satisfies Translated<ApiKeyLocalization>,
  billing: {
    billing: "Facturation",
    billingDescription:
      "Gérez les offres, les détails de l’abonnement, les postes et la consommation.",
    plans: "Offres",
    currentPlan: "Offre actuelle",
    choosePlan: "Choisir l’offre",
    changePlan: "Changer d’offre",
    perMonth: "par mois",
    perYear: "par an",
    oneTime: "paiement unique",
    popular: "Populaire",
    subscription: "Abonnement",
    noSubscription: "Aucun abonnement actif",
    noSubscriptionDescription:
      "Choisissez une offre pour démarrer un abonnement.",
    manageBilling: "Gérer la facturation",
    renewsOn: "Renouvellement le {{date}}",
    endsOn: "Se termine le {{date}}",
    cancelSubscription: "Résilier l’abonnement",
    cancelSubscriptionTitle: "Résilier l’abonnement ?",
    cancelSubscriptionDescription:
      "Vous gardez l’accès jusqu’à la fin de la période de facturation en cours.",
    restoreSubscription: "Rétablir l’abonnement",
    restoreSubscriptionTitle: "Rétablir l’abonnement ?",
    restoreSubscriptionDescription:
      "Votre abonnement continuera de se renouveler avec son offre actuelle.",
    confirm: "Confirmer",
    cancel: "Annuler",
    seats: "Postes",
    updateSeats: "Modifier le nombre de postes",
    usage: "Consommation",
    unlimited: "Illimité",
    used: "Utilisé : {{used}}",
    loadingBilling: "Chargement des informations de facturation"
  } satisfies Translated<BillingLocalization>,
  dash: {
    activity: "Activité",
    activityDescription:
      "Consultez l’activité récente liée à l’authentification et au compte.",
    adminUserActivityDescription:
      "Consultez l’activité récente liée à l’authentification et au compte de cet utilisateur.",
    adminActivityDescription:
      "Consultez l’activité des organisations que vous gérez.",
    organizationActivityDescription:
      "Consultez l’activité de cette organisation à laquelle vous avez accès.",
    organizationWide: "Toute l’organisation",
    personalOnly: "Votre activité",
    noActivity: "Aucune activité conservée",
    noActivityDescription:
      "Aucune activité conservée ne correspond à cette vue.",
    activityLoadError: "Impossible de charger l’activité",
    activityLoadErrorDescription:
      "Vérifiez la configuration du client Dash, puis réessayez.",
    retry: "Réessayer",
    paginationRange: "{{from}}–{{to}} sur {{total}}",
    previousPage: "Page précédente",
    nextPage: "Page suivante",
    allEvents: "Tous les événements",
    eventType: "Type d’événement",
    identifier: "Identifiant",
    identifierPlaceholder: "Filtrer par e-mail, ID utilisateur ou fournisseur",
    unknownEvent: "Événement d’activité",
    eventLabels: {
      account_linked: "Compte associé",
      account_unlinked: "Compte dissocié",
      all_sessions_revoked: "Toutes les sessions révoquées",
      email_changed: "Adresse e-mail modifiée",
      email_verification_sent: "E-mail de vérification envoyé",
      email_verified: "Adresse e-mail vérifiée",
      organization_created: "Organisation créée",
      organization_member_added: "Membre ajouté",
      organization_member_invite_accepted: "Invitation acceptée",
      organization_member_invite_canceled: "Invitation annulée",
      organization_member_invite_rejected: "Invitation refusée",
      organization_member_invited: "Membre invité",
      organization_member_removed: "Membre retiré",
      organization_member_role_updated: "Rôle du membre modifié",
      organization_team_created: "Équipe créée",
      organization_team_deleted: "Équipe supprimée",
      organization_team_member_added: "Membre ajouté à l’équipe",
      organization_team_member_removed: "Membre retiré de l’équipe",
      organization_team_updated: "Équipe modifiée",
      organization_updated: "Organisation modifiée",
      password_changed: "Mot de passe modifié",
      password_reset_completed: "Mot de passe réinitialisé",
      password_reset_requested: "Réinitialisation du mot de passe demandée",
      profile_image_updated: "Photo de profil modifiée",
      profile_updated: "Profil modifié",
      session_created: "Session créée",
      session_revoked: "Session révoquée",
      two_factor_disabled: "Authentification à deux facteurs désactivée",
      two_factor_enabled: "Authentification à deux facteurs activée",
      two_factor_verified: "Authentification à deux facteurs validée",
      user_banned: "Utilisateur banni",
      user_created: "Compte créé",
      user_deleted: "Utilisateur supprimé",
      user_impersonated: "Connexion en tant qu’utilisateur",
      user_impersonated_stopped: "Fin de la connexion en tant qu’utilisateur",
      user_sign_in_failed: "Échec de connexion",
      user_signed_in: "Connexion",
      user_signed_out: "Déconnexion",
      user_unbanned: "Bannissement levé"
    }
  } satisfies Translated<DashLocalization>,
  deleteUser: {
    deleteAccount: "Supprimer le compte",
    deleteAccountDescription:
      "Supprimez définitivement votre compte et toutes les données associées. Cette action est irréversible.",
    deleteUserVerificationSent:
      "Consultez vos e-mails pour confirmer la suppression du compte.",
    deleteUserSuccess: "Votre compte a été supprimé."
  } satisfies Translated<DeleteUserLocalization>,
  deviceAuthorization: {
    deviceAuthorization: "Autorisation de l’appareil",
    deviceAuthorizationDescription:
      "Saisissez le code affiché sur votre appareil.",
    deviceCode: "Code de l’appareil",
    invalidDeviceCode: "Ce code n’est pas valide ou a expiré.",
    continue: "Continuer",
    approveDevice: "Autoriser l’appareil",
    approveDeviceDescription: "Un appareil demande l’accès à votre compte.",
    signedInAs: "Connecté en tant que",
    approve: "Autoriser",
    deny: "Refuser",
    deviceApproved: "Appareil autorisé",
    deviceApprovedDescription:
      "L’appareil peut maintenant accéder à votre compte. Vous pouvez y revenir et continuer.",
    deviceDenied: "Appareil refusé",
    deviceDeniedDescription:
      "L’appareil n’a pas obtenu l’accès à votre compte.",
    returnToApplication: "Revenir à l’application"
  } satisfies Translated<DeviceAuthorizationLocalization>,
  emailOtp: {
    emailOtp: "Code par e-mail",
    sendCode: "Envoyer le code",
    code: "Code",
    verifyCode: "Vérifier le code",
    codeSentTo: "Nous avons envoyé un code à {{email}}",
    codeLengthMismatch: "Saisissez le code à {{length}} chiffres",
    useDifferentEmail: "Utiliser une autre adresse e-mail",
    codeSent: "Code envoyé",
    emailVerified: "Adresse e-mail vérifiée",
    confirmCurrentEmail: "Confirmez votre adresse e-mail actuelle",
    confirmNewEmail: "Confirmez votre nouvelle adresse e-mail",
    confirmEmailDescription:
      "Saisissez le code envoyé à {{email}} pour terminer la modification"
  } satisfies Translated<EmailOtpLocalization>,
  lastLoginMethod: {
    lastUsed: "Utilisée en dernier",
    lastUsedShort: "Dernière"
  } satisfies Translated<LastLoginMethodLocalization>,
  magicLink: {
    magicLink: "Lien de connexion",
    sendMagicLink: "Envoyer le lien de connexion",
    magicLinkSent:
      "Consultez vos e-mails : votre lien de connexion vous attend",
    magicLinkSentTo: "Nous avons envoyé un lien de connexion à {{email}}"
  } satisfies Translated<MagicLinkLocalization>,
  multiSession: {
    switchAccount: "Changer de compte",
    addAccount: "Ajouter un compte",
    manageAccounts: "Gérer les comptes",
    manageAccountsDescription: "Gérez vos comptes pour un accès sécurisé."
  } satisfies Translated<MultiSessionLocalization>,
  oauthProvider: {
    authorize: "Autoriser {{client}}",
    authorizationDescription: "{{client}} souhaite accéder à votre compte.",
    authorizationRequest: "souhaite accéder à votre compte",
    redirectTo: "Si vous autorisez l’accès, vous serez redirigé vers",
    applicationInformation:
      "Le nom et le logo des applications sont fournis par leurs développeurs. N’autorisez que les applications de confiance.",
    requestedPermissions: "{{client}} pourra :",
    signedInAs: "Connecté en tant que",
    allow: "Autoriser",
    cancel: "Annuler",
    privacyPolicy: "Politique de confidentialité",
    termsOfService: "Conditions d’utilisation",
    invalidRequest: "Demande d’autorisation non valide",
    invalidRequestDescription:
      "Cette demande d’autorisation est incomplète ou n’est plus valide.",
    application: "Application",
    selectAccount: "Choisissez un compte",
    selectAccountDescription:
      "Choisissez le compte à utiliser avec {{client}}.",
    currentAccount: "Actuel",
    continue: "Continuer",
    noAccounts: "Aucun compte disponible",
    noAccountsDescription: "Connectez-vous pour continuer vers {{client}}.",
    accountCreated: "Compte créé",
    continuing: "Retour vers {{client}}…",
    continueFailed:
      "Votre compte est prêt, mais nous n’avons pas pu vous renvoyer vers {{client}}.",
    tryAgain: "Réessayer",
    connectedApplications: "Applications connectées",
    noConnectedApplications: "Aucune application connectée",
    connectedApplicationsDescription:
      "Les applications que vous autorisez s’afficheront ici.",
    lastAuthorized: "Dernière autorisation",
    removeAuthorization: "Retirer l’autorisation",
    removeAuthorizationTitle: "Retirer l’autorisation ?",
    removeAuthorizationDescription:
      "Cette application devra obtenir votre accord avant tout nouvel accès. Les jetons existants peuvent rester valides jusqu’à leur expiration.",
    remove: "Retirer",
    oauthClients: "Clients OAuth",
    oauthClientsDescription:
      "Créez et gérez les applications qui peuvent demander l’accès aux comptes.",
    noOAuthClients: "Aucun client OAuth",
    noOAuthClientsDescription:
      "Créez un client quand votre application est prête à utiliser OAuth.",
    createClient: "Créer un client",
    editClient: "Modifier le client",
    clientName: "Nom du client",
    applicationType: "Type d’application",
    webApplication: "Web",
    nativeApplication: "Native",
    redirectUrls: "URL de redirection",
    redirectUrlsDescription: "Saisissez une URL par ligne.",
    invalidUrl: "Saisissez une URL absolue valide.",
    applicationUrl: "URL de l’application",
    logoUrl: "URL du logo",
    permissions: "Autorisations",
    scopes: "Portées (scopes)",
    saveChanges: "Enregistrer les modifications",
    clientId: "ID client",
    clientSecret: "Secret client",
    clientSecretWarning:
      "Copiez ce secret maintenant. Il ne sera plus affiché.",
    rotateSecret: "Renouveler le secret",
    rotateSecretTitle: "Renouveler le secret client ?",
    rotateSecretDescription:
      "Le secret actuel cessera aussitôt de fonctionner.",
    deleteClient: "Supprimer le client",
    deleteClientTitle: "Supprimer le client OAuth ?",
    deleteClientDescription:
      "Le client est supprimé définitivement et ne peut plus recevoir de nouvelles demandes d’autorisation.",
    enabled: "Activé",
    disabled: "Désactivé",
    clientCreated: "Client créé",
    secretRotated: "Secret renouvelé"
  } satisfies Translated<OAuthProviderLocalization>,
  organization: {
    accept: "Accepter",
    acceptInvitationTitle: "Invitation à rejoindre une organisation",
    acceptInvitationDescription:
      "Vous êtes invité à rejoindre {{organization}} avec le rôle {{role}}.",
    accepted: "Acceptée",
    actions: "Actions",
    admin: "Administrateur",
    all: "Toutes",
    canceled: "Annulée",
    cancelInvitation: "Annuler l’invitation",
    changeLogo: "Changer de logo",
    changeMemberRole: "Changer de rôle",
    changeMemberRoleDescription:
      "Choisissez les rôles de ce membre dans l’organisation.",
    clear: "Effacer",
    createOrganization: "Créer une organisation",
    deleteLogo: "Supprimer le logo",
    deleteOrganization: "Supprimer l’organisation",
    deleteOrganizationDescription:
      "Supprimez définitivement cette organisation et toutes ses données. Tous les membres perdront l’accès. Cette action est irréversible.",
    invitations: "Invitations",
    invitationResent: "Invitation renvoyée",
    invitationUnavailable: "Invitation indisponible",
    invitationUnavailableDescription:
      "Cette invitation n’est pas valide, a expiré ou a déjà été traitée.",
    invitedAt: "Invité le",
    inviteMember: "Inviter un membre",
    inviteMemberSuccess: "Membre invité",
    inviteMemberDescription:
      "Nous lui enverrons par e-mail un lien pour rejoindre cette organisation. Choisissez le rôle qu’il aura une fois l’invitation acceptée.",
    leftOrganization: "Vous avez quitté l’organisation",
    leaveOrganization: "Quitter l’organisation",
    leaveOrganizationDescription:
      "Quittez cette organisation et perdez l’accès à ses données et ressources. Il vous faudra une nouvelle invitation pour la rejoindre.",
    logo: "Logo",
    logoChangedSuccess: "Logo modifié",
    logoDeletedSuccess: "Logo supprimé",
    manage: "Gérer",
    member: "Membre",
    memberRemoved: "Membre retiré",
    memberRoleUpdated: "Rôle du membre modifié",
    members: "Membres",
    people: "Personnes",
    name: "Nom",
    namePlaceholder: "Saisissez le nom de l’organisation",
    noInvitations: "Aucune invitation",
    noOrganizations: "Aucune organisation",
    organization: "Organisation",
    organizationDeleted: "Organisation supprimée",
    organizationInvitationsEmptyDescription:
      "Invitez un collègue à collaborer dans cette organisation.",
    organizations: "Organisations",
    organizationsDescription:
      "Créez une organisation pour collaborer avec d’autres personnes et gérer des accès partagés.",
    organizationProfile: "Profil de l’organisation",
    organizationUpdatedSuccess: "Organisation mise à jour",
    owner: "Propriétaire",
    pending: "En attente",
    nextPage: "Page suivante",
    firstPage: "Première page",
    lastPage: "Dernière page",
    pageOf: "Page {{page}} sur {{pages}}",
    rowsPerPage: "Lignes par page",
    columns: "Colonnes",
    selectedCount: "{{count}} sélectionné(s)",
    selectRow: "Sélectionner la ligne",
    selectAllRows: "Sélectionner toutes les lignes de cette page",
    cancelSelectedInvitations: "Annuler les invitations sélectionnées",
    cancelSelectedInvitationsDescription:
      "Annuler les invitations en attente sélectionnées ?",
    invitationsCanceled: "{{count}} invitations annulées",
    removeSelectedMembers: "Retirer les membres sélectionnés",
    removeSelectedMembersDescription:
      "Retirer les membres sélectionnés de cette organisation ? Ils perdront aussitôt l’accès.",
    membersRemoved: "{{count}} membres retirés",
    deleteSelectedRoles: "Supprimer les rôles sélectionnés",
    deleteSelectedRolesDescription:
      "Supprimer les rôles sélectionnés ? Les rôles attribués à des membres ne peuvent pas être supprimés.",
    rolesDeleted: "{{count}} rôles supprimés",
    personalAccount: "Compte personnel",
    previousPage: "Page précédente",
    rejected: "Refusée",
    paginationRange: "{{from}}–{{to}} sur {{total}}",
    return: "Retour",
    rejectInvitation: "Refuser l’invitation",
    removeMember: "Retirer le membre",
    removeMemberWarning:
      "Voulez-vous vraiment retirer ce membre de l’organisation ? Il perdra aussitôt l’accès.",
    resendInvitation: "Renvoyer l’invitation",
    role: "Rôle",
    search: "Rechercher…",
    selectAtLeastOneRole: "Sélectionnez au moins un rôle",
    selectRoles: "Sélectionner des rôles",
    slug: "Identifiant d’URL",
    slugPlaceholder: "identifiant-organisation",
    status: "Statut",
    uploadLogo: "Importer un logo",
    userInvitationsEmptyDescription:
      "Les invitations à rejoindre une organisation s’afficheront ici.",
    verifyEmailToViewInvitations:
      "Vérifiez votre adresse e-mail pour voir les invitations",
    verifyEmailToViewInvitationsDescription:
      "Pour votre sécurité, les invitations sont accessibles une fois votre adresse e-mail vérifiée.",
    teams: "Équipes",
    team: "Équipe",
    teamsDescription: "Créez des équipes et gérez leurs membres.",
    selectTeam: "Sélectionner une équipe",
    allTeams: "Toutes les équipes",
    selectMember: "Sélectionner un membre",
    createTeam: "Créer une équipe",
    renameTeam: "Renommer l’équipe",
    deleteTeam: "Supprimer l’équipe",
    deleteTeamDescription:
      "Supprimez cette équipe et retirez ses membres. Cette action est irréversible.",
    noTeams: "Aucune équipe",
    noTeamsDescription:
      "Créez une équipe pour organiser les accès au sein de cette organisation.",
    teamMembers: "Membres de l’équipe",
    addTeamMember: "Ajouter un membre à l’équipe",
    removeTeamMember: "Retirer de l’équipe",
    teamCreated: "Équipe créée",
    teamUpdated: "Équipe modifiée",
    teamDeleted: "Équipe supprimée",
    teamLimitReached: "Cette organisation a atteint sa limite d’équipes.",
    teamMemberLimitReached: "Cette équipe a atteint sa limite de membres.",
    lastTeamRemovalDisabled:
      "Cette organisation doit conserver au moins une équipe.",
    activeTeamRemovalDisabled:
      "Passez à une autre équipe avant de supprimer celle-ci.",
    onlyOwnerActionDisabled:
      "Transférez la propriété avant de retirer le seul propriétaire.",
    limitReached: "Limite atteinte",
    organizationLimitReached: "Vous avez atteint la limite d’organisations.",
    membershipLimitReached:
      "Cette organisation a atteint sa limite de membres.",
    invitationLimitReached:
      "Cette organisation a atteint sa limite d’invitations.",
    roles: "Rôles",
    rolesDescription:
      "Créez des rôles et choisissez ce que chacun permet de faire.",
    createRole: "Créer un rôle",
    editRole: "Modifier le rôle",
    deleteRole: "Supprimer le rôle",
    deleteRoleDescription:
      "Supprimez définitivement ce rôle. Les membres doivent d’abord recevoir un autre rôle.",
    roleName: "Nom du rôle",
    permissions: "Autorisations",
    permissionsLimitedDescription:
      "Vous ne pouvez attribuer que les autorisations incluses dans votre propre rôle.",
    noRoles: "Aucun rôle personnalisé",
    noRolesDescription:
      "Créez un rôle pour définir des accès personnalisés à l’organisation.",
    roleCreated: "Rôle créé",
    roleUpdated: "Rôle modifié",
    roleDeleted: "Rôle supprimé",
    roleInUse: "Ce rôle est attribué à {{count}} membre(s).",
    roleNamePlaceholder: "agent-support"
  } satisfies Translated<OrganizationLocalization>,
  passkey: {
    passkey: "Clé d’accès",
    addPasskey: "Ajouter une clé d’accès",
    deletePasskey: "Supprimer la clé d’accès {{name}}",
    deletePasskeyTitle: "Supprimer la clé d’accès",
    deletePasskeyWarning:
      "Cette action est irréversible. Vous devrez ajouter de nouveau cette clé d’accès pour vous en servir à la connexion.",
    passkeys: "Clés d’accès",
    passkeysDescription:
      "Créez une clé d’accès pour accéder à votre compte en toute sécurité.",
    noPasskeys: "Aucune clé d’accès",
    name: "Nom",
    renamePasskey: "Renommer la clé d’accès",
    renamePasskeySuccess: "Clé d’accès renommée"
  } satisfies Translated<PasskeyLocalization>,
  phoneNumber: {
    country: "Pays ou région",
    invalidPhoneNumber: "Saisissez un numéro de téléphone valide",
    phoneNumber: "Numéro de téléphone",
    phoneNumberPlaceholder: "+33 6 12 34 56 78",
    phoneCode: "Indicatif",
    sendCode: "Envoyer le code",
    verifyCode: "Vérifier le code",
    codeSentTo: "Nous avons envoyé un code au {{phoneNumber}}",
    codeLengthMismatch: "Saisissez le code à {{length}} chiffres",
    useDifferentPhoneNumber: "Utiliser un autre numéro de téléphone",
    usePassword: "Utiliser un mot de passe",
    useVerificationCode: "Utiliser un code de vérification",
    forgotPassword: "Mot de passe oublié ?",
    resetPassword: "Réinitialiser le mot de passe",
    changePhoneNumber: "Changer de numéro de téléphone",
    updatePhoneNumber: "Modifier le numéro de téléphone",
    phoneNumberUpdated: "Numéro de téléphone modifié",
    removePhoneNumber: "Supprimer le numéro de téléphone",
    phoneNumberRemoved: "Numéro de téléphone supprimé",
    removePhoneNumberTitle:
      "Supprimer ce numéro de téléphone de votre compte ?",
    removePhoneNumberDescription:
      "Vous ne pourrez plus l’utiliser pour vous connecter ni pour réinitialiser votre mot de passe.",
    cancel: "Annuler"
  } satisfies Translated<PhoneNumberLocalization>,
  siwe: {
    ethereum: "Ethereum",
    continueWithEthereum: "Continuer avec Ethereum",
    signMessage: "Signer le message",
    email: "E-mail",
    emailDescription: "Ajoutez une adresse e-mail à ce compte de portefeuille.",
    emailOptional: "E-mail (facultatif)",
    wallets: "Portefeuilles",
    walletsDescription:
      "Gérez les portefeuilles Ethereum connectés à votre compte.",
    connectWallet: "Connecter un portefeuille",
    noWallets: "Aucun portefeuille Ethereum n’est connecté.",
    primary: "Principal",
    setPrimary: "Définir comme principal",
    removeWallet: "Retirer le portefeuille",
    removeWalletTitle: "Retirer le portefeuille Ethereum ?",
    removeWalletWarning:
      "Vous ne pourrez plus vous connecter avec ce portefeuille tant que vous ne l’aurez pas reconnecté.",
    chain: "Chaîne {{chainId}}"
  } satisfies Translated<SiweLocalization>,
  sso: {
    addProvider: "Ajouter un fournisseur SSO",
    cancel: "Annuler",
    clientId: "ID client",
    clientSecret: "Secret client",
    continueWithEmail: "Continuer avec l’e-mail",
    continueWithSso: "Continuer avec le SSO",
    copyDnsHost: "Copier l’hôte DNS",
    copyDnsValue: "Copier la valeur DNS",
    domain: "Domaine de messagerie",
    domainVerification: "Vérification du domaine",
    domainVerificationDescription:
      "Publiez l’enregistrement TXT de chaque domaine configuré, puis vérifiez-le.",
    domainVerificationRequested: "Un nouveau jeton de vérification a été créé.",
    domainVerified: "Le domaine du fournisseur est vérifié.",
    deleteProvider: "Supprimer le fournisseur",
    deleteProviderDescription:
      "Les utilisateurs ne pourront plus se connecter avec ce fournisseur.",
    discoveryEndpoint: "Point de terminaison de découverte",
    editProvider: "Modifier le fournisseur",
    emailFirstDescription:
      "Saisissez votre adresse e-mail professionnelle pour continuer.",
    entryPoint: "URL SSO",
    identityProviderMetadata: "Métadonnées XML du fournisseur d’identité",
    invalidUrl: "Saisissez une URL absolue valide.",
    issuer: "URL de l’émetteur",
    oidc: "OIDC",
    organizationId: "ID de l’organisation",
    noProviders: "Aucun fournisseur SSO",
    noProvidersDescription:
      "Ajoutez un fournisseur d’identité pour activer la connexion via l’organisation.",
    providerDeleted: "Le fournisseur SSO a été supprimé.",
    providerList: "SSO de l’organisation",
    providerListDescription:
      "Gérez les fournisseurs d’identité et les domaines vérifiés de cette organisation.",
    providerAccessDenied:
      "Seuls les propriétaires et les administrateurs de l’organisation peuvent gérer les fournisseurs SSO.",
    providerLoadError: "Impossible de charger les fournisseurs SSO.",
    providerUpdated: "Le fournisseur SSO a été modifié.",
    providerCreated: "Le fournisseur SSO a été ajouté.",
    providerId: "ID du fournisseur",
    providerSetup: "Configuration du fournisseur SSO",
    providerSetupDescription:
      "Connectez un fournisseur d’identité OpenID Connect ou SAML.",
    requestNewToken: "Créer un nouveau jeton",
    retry: "Réessayer",
    saveProvider: "Enregistrer le fournisseur",
    saml: "SAML",
    txtRecordHost: "Hôte de l’enregistrement TXT",
    txtRecordValue: "Valeur de l’enregistrement TXT",
    useDifferentEmail: "Utiliser une autre adresse e-mail",
    verifyDomain: "Vérifier le domaine",
    noProvider:
      "Aucune connexion via une organisation n’a été trouvée. Choisissez un autre moyen de continuer.",
    ssoUnavailable:
      "La connexion via l’organisation est indisponible. Essayez une autre méthode de connexion."
  } satisfies Translated<SsoLocalization>,
  theme: {
    appearance: "Apparence",
    theme: "Thème",
    system: "Système",
    light: "Clair",
    dark: "Sombre"
  } satisfies Translated<ThemeLocalization>,
  twoFactor: {
    twoFactor: "Authentification à deux facteurs",
    twoFactorDescription:
      "Ajoutez une deuxième étape à la connexion pour qu’un mot de passe volé ne suffise pas",
    enableTwoFactor: "Activer la double authentification",
    disableTwoFactor: "Désactiver la double authentification",
    twoFactorEnabled: "L’authentification à deux facteurs est activée",
    twoFactorDisabled: "L’authentification à deux facteurs est désactivée",
    passwordConfirmation: "Saisissez votre mot de passe pour continuer",
    chooseEnrollmentMethod:
      "Choisissez comment valider vos prochaines connexions",
    authenticatorApp: "Application d’authentification",
    authenticatorAppDescription:
      "Utilisez un code renouvelé régulièrement par une application d’authentification",
    deliveredCode: "Code par e-mail ou SMS",
    deliveredCodeDescription: "Recevez un nouveau code à chaque connexion",
    scanQrCode: "Scannez ce code avec votre application d’authentification",
    setupKey:
      "Impossible de scanner ? Saisissez plutôt cette clé de configuration",
    setupKeyCopied: "Clé de configuration copiée",
    setupKeyCopyFailed:
      "Impossible de copier la clé de configuration. Sélectionnez-la et copiez-la manuellement.",
    authenticatorCode: "Code de l’application d’authentification",
    authenticatorCodeDescription:
      "Saisissez le code affiché par votre application d’authentification",
    emailedCode: "Code reçu par e-mail",
    emailedCodeDescription:
      "Nous vous avons envoyé un code par e-mail. Saisissez-le pour terminer la connexion",
    sendEmailCode: "M’envoyer un code par e-mail",
    backupCode: "Code de secours",
    backupCodeDescription:
      "Saisissez l’un des codes de secours que vous avez conservés",
    backupCodes: "Codes de secours",
    backupCodesForWebsite: "Codes de secours pour {{website}}",
    backupCodesDescription:
      "Conservez-les en lieu sûr. Si vous perdez votre application d’authentification, chacun de ces codes permet une seule connexion.",
    backupCodesCopied: "Codes de secours copiés",
    backupCodesCopyFailed:
      "Impossible de copier les codes de secours. Sélectionnez-les et copiez-les manuellement.",
    downloadBackupCodes: "Télécharger le .txt",
    printBackupCodes: "Imprimer",
    regenerateBackupCodes: "Générer de nouveaux codes de secours",
    backupCodesRegenerated:
      "Nouveaux codes de secours générés. Les anciens ne fonctionnent plus.",
    useAuthenticator: "Utiliser votre application d’authentification",
    useEmailedCode: "Utiliser un code reçu par e-mail",
    useBackupCode: "Utiliser un code de secours",
    trustDevice: "Faire confiance à cet appareil",
    trustDeviceDescription:
      "Ne plus demander la deuxième étape sur cet appareil",
    verify: "Vérifier",
    codeLengthMismatch: "Saisissez le code à {{length}} chiffres",
    backToSignIn: "Retour à la connexion",
    done: "Terminé"
  } satisfies Translated<TwoFactorLocalization>,
  username: {
    username: "Nom d’utilisateur",
    usernamePlaceholder: "Nom d’utilisateur",
    usernameOrEmailPlaceholder: "Nom d’utilisateur ou e-mail",
    usernameAvailable: "Ce nom d’utilisateur est disponible",
    usernameTaken: "Ce nom d’utilisateur est déjà pris. Essayez-en un autre.",
    displayUsername: "Nom affiché",
    displayUsernamePlaceholder: "Nom affiché"
  } satisfies Translated<UsernameLocalization>
}
