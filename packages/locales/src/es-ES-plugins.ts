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

export const esESPlugins = {
  admin: {
    accessDenied: "Acceso denegado",
    accessDeniedDescription: "No tienes permiso para gestionar usuarios.",
    active: "Activo",
    accountInformation: "Información de la cuenta",
    admin: "Administración",
    banned: "Suspendido",
    banDuration: "Duración de la suspensión (días)",
    banDurationDescription:
      "Deja en blanco para suspender de forma permanente.",
    banExpires: "Suspendido hasta",
    banReason: "Motivo de la suspensión",
    banUser: "Suspender usuario",
    cancel: "Cancelar",
    close: "Cerrar",
    copyUserId: "Copiar ID de usuario",
    created: "Creado",
    createUser: "Crear usuario",
    deleteUser: "Eliminar usuario",
    dangerZone: "Zona de peligro",
    email: "Correo electrónico",
    emailVerified: "Correo verificado",
    endsWith: "Termina con",
    filterAllStatuses: "Todos los estados",
    loadUsersError: "No se pudieron cargar los usuarios",
    loadUsersErrorDescription:
      "Inténtalo de nuevo o revisa la configuración del complemento de administración.",
    name: "Nombre",
    moreActions: "Más acciones",
    noUsers: "No se encontraron usuarios",
    noUsersDescription: "Cambia la búsqueda o crea un usuario.",
    nextPage: "Página siguiente",
    previousPage: "Página anterior",
    impersonateUser: "Suplantar usuario",
    overview: "Resumen",
    password: "Contraseña",
    profileAndAccess: "Perfil y acceso",
    retry: "Reintentar",
    role: "Rol",
    search: "Buscar",
    searchContains: "Contiene",
    searchOperator: "Operador de búsqueda",
    searchByEmail: "Buscar por correo electrónico",
    searchByName: "Buscar por nombre",
    sessions: "Sesiones",
    noSessions: "No hay sesiones activas",
    revoke: "Revocar",
    revokeAllSessions: "Revocar todas las sesiones",
    saveChanges: "Guardar cambios",
    saveRole: "Guardar rol",
    saveUser: "Guardar usuario",
    security: "Seguridad",
    setPassword: "Establecer contraseña",
    sort: "Orden",
    sortNameAscending: "Nombre A-Z",
    sortNameDescending: "Nombre Z-A",
    sortNewest: "Más recientes primero",
    sortOldest: "Más antiguos primero",
    startsWith: "Empieza con",
    status: "Estado",
    stopImpersonating: "Dejar de suplantar",
    userDetails: "Detalles del usuario",
    userId: "ID de usuario",
    unknownView: "Vista de administración desconocida",
    unknownViewDescription:
      "Esta ruta de administración estática no está registrada.",
    unbanUser: "Levantar suspensión",
    users: "Usuarios",
    usersDescription:
      "Gestiona el acceso, los roles y las sesiones de los usuarios.",
    usersPaginationRange: "{{from}}-{{to}} de {{total}}"
  } satisfies Translated<AdminLocalization>,
  agentAuth: {
    approvalTitle: "Aprobar acceso del agente",
    approvalDescription: "Revisa lo que este agente quiere hacer en tu nombre.",
    requestedCapabilities: "Permisos solicitados",
    requestReason: "Motivo",
    constraints: "Restricciones",
    delegatedAgent: "Agente delegado",
    autonomousAgent: "Agente autónomo",
    approvalNone: "Sin verificación adicional",
    approvalSession: "Inicio de sesión reciente",
    approvalWebauthn: "Se requiere passkey",
    allow: "Permitir selección",
    deny: "Denegar",
    approvedTitle: "Acceso aprobado",
    approvedDescription: "El agente ya puede usar los permisos seleccionados.",
    deniedTitle: "Acceso denegado",
    deniedDescription: "El agente no recibió acceso.",
    noCapabilities: "Esta solicitud no contiene permisos pendientes.",
    invalidRequest:
      "A este enlace de aprobación le falta el identificador del agente.",
    approvalError: "No se pudo actualizar esta solicitud. Inténtalo de nuevo.",
    agents: "Acceso de agentes",
    agentsDescription:
      "Revisa los agentes y revoca los permisos en los que ya no confíes.",
    noAgents: "Ningún agente tiene acceso a tu cuenta.",
    active: "Activo",
    pending: "Pendiente",
    denied: "Denegado",
    revoked: "Revocado",
    expires: "Caduca el {date}",
    lastUsed: "Usado por última vez el {date}",
    neverUsed: "Nunca usado",
    revoke: "Revocar",
    revokeTitle: "¿Revocar permiso?",
    revokeDescription: "El agente perderá este permiso de inmediato.",
    confirmRevoke: "Revocar permiso"
  } satisfies Translated<AgentAuthLocalization>,
  anonymous: {
    continueAsGuest: "Continuar como invitado"
  } satisfies Translated<AnonymousLocalization>,
  apiKey: {
    apiKey: "Clave de API",
    apiKeys: "Claves de API",
    apiKeysDescription:
      "Crea una clave de API para el acceso programático a tu cuenta.",
    createApiKey: "Crear clave de API",
    noApiKeys: "No hay claves de API",
    name: "Nombre",
    expiration: "Caducidad",
    day: "Día",
    days: "Días",
    never: "Nunca",
    created: "Creada",
    expires: "Caduca",
    neverExpires: "Nunca caduca",
    newApiKey: "Nueva clave de API",
    newApiKeyWarning:
      "Esta clave de API solo se mostrará ahora. Cópiala y guárdala en un lugar seguro.",
    deleteApiKey: "Eliminar clave de API",
    deleteApiKeyWarning:
      "Esta acción no se puede deshacer. Cualquier servicio que use esta clave de API dejará de funcionar de inmediato.",
    dismissNewKey: "He guardado mi clave",
    editApiKey: "Editar clave de API",
    configuration: "Configuración",
    enabled: "Habilitada",
    disabled: "Deshabilitada",
    requests: "Solicitudes",
    remaining: "Restantes",
    lastRequest: "Última solicitud",
    neverRequested: "Nunca solicitada",
    sortBy: "Ordenar por",
    newest: "Más recientes",
    oldest: "Más antiguas",
    nameAscending: "Nombre A-Z",
    nameDescending: "Nombre Z-A",
    previousPage: "Página anterior",
    nextPage: "Página siguiente"
  } satisfies Translated<ApiKeyLocalization>,
  billing: {
    billing: "Facturación",
    billingDescription:
      "Gestiona planes, detalles de suscripción, plazas y uso.",
    plans: "Planes",
    currentPlan: "Plan actual",
    choosePlan: "Elegir plan",
    changePlan: "Cambiar plan",
    perMonth: "por mes",
    perYear: "por año",
    oneTime: "pago único",
    popular: "Popular",
    subscription: "Suscripción",
    noSubscription: "Sin suscripción activa",
    noSubscriptionDescription: "Elige un plan para iniciar una suscripción.",
    manageBilling: "Gestionar facturación",
    renewsOn: "Se renueva el {{date}}",
    endsOn: "Finaliza el {{date}}",
    cancelSubscription: "Cancelar suscripción",
    cancelSubscriptionTitle: "¿Cancelar suscripción?",
    cancelSubscriptionDescription:
      "Tu acceso se mantendrá hasta el final del período de facturación actual.",
    restoreSubscription: "Restaurar suscripción",
    restoreSubscriptionTitle: "¿Restaurar suscripción?",
    restoreSubscriptionDescription:
      "Tu suscripción seguirá renovándose con el plan actual.",
    confirm: "Confirmar",
    cancel: "Cancelar",
    seats: "Plazas",
    updateSeats: "Actualizar plazas",
    usage: "Uso",
    unlimited: "Ilimitado",
    used: "{{used}} usado",
    loadingBilling: "Cargando datos de facturación"
  } satisfies Translated<BillingLocalization>,
  dash: {
    activity: "Actividad",
    activityDescription:
      "Revisa la actividad reciente de autenticación y de la cuenta.",
    adminUserActivityDescription:
      "Revisa la actividad reciente de autenticación y de la cuenta de este usuario.",
    adminActivityDescription:
      "Revisa la actividad de las organizaciones que administras.",
    organizationActivityDescription:
      "Revisa la actividad de esta organización que puedes ver.",
    organizationWide: "Toda la organización",
    personalOnly: "Tu actividad",
    noActivity: "No hay actividad registrada",
    noActivityDescription:
      "Ninguna actividad registrada coincide con esta vista.",
    activityLoadError: "No se pudo cargar la actividad",
    activityLoadErrorDescription:
      "Revisa la configuración del cliente de Dash e inténtalo de nuevo.",
    retry: "Reintentar",
    paginationRange: "{{from}}–{{to}} de {{total}}",
    previousPage: "Página anterior",
    nextPage: "Página siguiente",
    allEvents: "Todos los eventos",
    eventType: "Tipo de evento",
    identifier: "Identificador",
    identifierPlaceholder:
      "Filtrar por correo electrónico, ID de usuario o proveedor",
    unknownEvent: "Evento de actividad",
    eventLabels: {
      account_linked: "Cuenta vinculada",
      account_unlinked: "Vinculación de cuenta eliminada",
      all_sessions_revoked: "Todas las sesiones revocadas",
      email_changed: "Correo electrónico cambiado",
      email_verification_sent: "Correo de verificación enviado",
      email_verified: "Correo electrónico verificado",
      organization_created: "Organización creada",
      organization_member_added: "Miembro añadido",
      organization_member_invite_accepted: "Invitación aceptada",
      organization_member_invite_canceled: "Invitación cancelada",
      organization_member_invite_rejected: "Invitación rechazada",
      organization_member_invited: "Miembro invitado",
      organization_member_removed: "Miembro eliminado",
      organization_member_role_updated: "Rol de miembro actualizado",
      organization_team_created: "Equipo creado",
      organization_team_deleted: "Equipo eliminado",
      organization_team_member_added: "Miembro de equipo añadido",
      organization_team_member_removed: "Miembro de equipo eliminado",
      organization_team_updated: "Equipo actualizado",
      organization_updated: "Organización actualizada",
      password_changed: "Contraseña cambiada",
      password_reset_completed: "Contraseña restablecida",
      password_reset_requested: "Restablecimiento de contraseña solicitado",
      profile_image_updated: "Imagen de perfil actualizada",
      profile_updated: "Perfil actualizado",
      session_created: "Sesión creada",
      session_revoked: "Sesión revocada",
      two_factor_disabled: "Autenticación de dos factores deshabilitada",
      two_factor_enabled: "Autenticación de dos factores habilitada",
      two_factor_verified: "Autenticación de dos factores verificada",
      user_banned: "Usuario suspendido",
      user_created: "Cuenta creada",
      user_deleted: "Usuario eliminado",
      user_impersonated: "Usuario suplantado",
      user_impersonated_stopped: "Suplantación finalizada",
      user_sign_in_failed: "Inicio de sesión fallido",
      user_signed_in: "Sesión iniciada",
      user_signed_out: "Sesión cerrada",
      user_unbanned: "Suspensión de usuario levantada"
    }
  } satisfies Translated<DashLocalization>,
  deleteUser: {
    deleteAccount: "Eliminar cuenta",
    deleteAccountDescription:
      "Elimina tu cuenta y todos los datos asociados de forma permanente. Esta acción no se puede deshacer.",
    deleteUserVerificationSent:
      "Revisa tu correo electrónico para confirmar la eliminación de la cuenta.",
    deleteUserSuccess: "Tu cuenta ha sido eliminada."
  } satisfies Translated<DeleteUserLocalization>,
  deviceAuthorization: {
    deviceAuthorization: "Autorización de dispositivo",
    deviceAuthorizationDescription:
      "Introduce el código que aparece en tu dispositivo.",
    deviceCode: "Código de dispositivo",
    invalidDeviceCode: "El código no es válido o ha caducado.",
    continue: "Continuar",
    approveDevice: "Aprobar dispositivo",
    approveDeviceDescription:
      "Un dispositivo está solicitando acceso a tu cuenta.",
    signedInAs: "Sesión iniciada como",
    approve: "Aprobar",
    deny: "Denegar",
    deviceApproved: "Dispositivo aprobado",
    deviceApprovedDescription:
      "El dispositivo ya puede acceder a tu cuenta. Vuelve al dispositivo para continuar.",
    deviceDenied: "Dispositivo denegado",
    deviceDeniedDescription: "El dispositivo no recibió acceso a tu cuenta.",
    returnToApplication: "Volver a la aplicación"
  } satisfies Translated<DeviceAuthorizationLocalization>,
  emailOtp: {
    emailOtp: "Código por correo electrónico",
    sendCode: "Enviar código",
    code: "Código",
    verifyCode: "Verificar código",
    codeSentTo: "Hemos enviado un código a {{email}}",
    codeLengthMismatch: "Introduce el código de {{length}} dígitos",
    useDifferentEmail: "Usar otro correo electrónico",
    codeSent: "Código enviado",
    emailVerified: "Correo electrónico verificado",
    confirmCurrentEmail: "Confirmar correo electrónico actual",
    confirmNewEmail: "Confirmar nuevo correo electrónico",
    confirmEmailDescription:
      "Introduce el código enviado a {{email}} para completar el cambio"
  } satisfies Translated<EmailOtpLocalization>,
  lastLoginMethod: {
    lastUsed: "Usado por última vez",
    lastUsedShort: "Última vez"
  } satisfies Translated<LastLoginMethodLocalization>,
  magicLink: {
    magicLink: "Enlace mágico",
    sendMagicLink: "Enviar enlace mágico",
    magicLinkSent: "Revisa tu correo electrónico para ver el enlace mágico",
    magicLinkSentTo: "Hemos enviado un enlace mágico a {{email}}"
  } satisfies Translated<MagicLinkLocalization>,
  multiSession: {
    switchAccount: "Cambiar de cuenta",
    addAccount: "Añadir cuenta",
    manageAccounts: "Gestionar cuentas",
    manageAccountsDescription: "Gestiona tus cuentas para un acceso seguro."
  } satisfies Translated<MultiSessionLocalization>,
  oauthProvider: {
    authorize: "Autorizar a {{client}}",
    authorizationDescription: "{{client}} quiere acceder a tu cuenta.",
    requestedPermissions: "Esto permitirá a {{client}} lo siguiente:",
    signedInAs: "Sesión iniciada como",
    allow: "Permitir",
    cancel: "Cancelar",
    privacyPolicy: "Política de privacidad",
    termsOfService: "Términos del servicio",
    invalidRequest: "Solicitud de autorización no válida",
    invalidRequestDescription:
      "A esta solicitud de autorización le faltan datos requeridos o ya no es válida.",
    application: "Aplicación",
    selectAccount: "Seleccionar cuenta",
    selectAccountDescription:
      "Elige la cuenta que quieres usar con {{client}}.",
    currentAccount: "Actual",
    continue: "Continuar",
    noAccounts: "No hay cuentas disponibles",
    noAccountsDescription: "Inicia sesión para continuar con {{client}}.",
    accountCreated: "Cuenta creada",
    continuing: "Se te redirigirá a {{client}}.",
    continueFailed:
      "Tu cuenta está lista, pero no se te pudo redirigir a {{client}}.",
    tryAgain: "Reintentar",
    connectedApplications: "Aplicaciones conectadas",
    noConnectedApplications: "No hay aplicaciones conectadas",
    connectedApplicationsDescription:
      "Las aplicaciones que hayas autorizado aparecerán aquí.",
    lastAuthorized: "Última autorización",
    removeAuthorization: "Eliminar autorización",
    removeAuthorizationTitle: "¿Eliminar autorización?",
    removeAuthorizationDescription:
      "Esta aplicación necesitará tu aprobación antes de obtener acceso nuevamente. Los tokens existentes pueden seguir siendo válidos hasta que caduquen.",
    remove: "Eliminar",
    oauthClients: "Clientes OAuth",
    oauthClientsDescription:
      "Crea y gestiona aplicaciones que puedan solicitar acceso a la cuenta.",
    noOAuthClients: "No hay clientes OAuth",
    noOAuthClientsDescription:
      "Crea un cliente si tu aplicación puede usar OAuth.",
    createClient: "Crear cliente",
    editClient: "Editar cliente",
    clientName: "Nombre del cliente",
    applicationType: "Tipo de aplicación",
    webApplication: "Web",
    nativeApplication: "Nativa",
    redirectUrls: "URL de redirección",
    redirectUrlsDescription: "Introduce una URL por línea.",
    applicationUrl: "URL de la aplicación",
    logoUrl: "URL del logotipo",
    scopes: "Ámbitos",
    saveChanges: "Guardar cambios",
    clientId: "ID de cliente",
    clientSecret: "Secreto de cliente",
    clientSecretWarning: "Copia este secreto ahora. No se volverá a mostrar.",
    rotateSecret: "Rotar secreto",
    rotateSecretTitle: "¿Rotar secreto del cliente?",
    rotateSecretDescription:
      "El secreto actual dejará de funcionar de inmediato.",
    deleteClient: "Eliminar cliente",
    deleteClientTitle: "¿Eliminar cliente OAuth?",
    deleteClientDescription:
      "Esto eliminará el cliente de forma permanente y detendrá las nuevas solicitudes de autorización.",
    enabled: "Habilitado",
    disabled: "Deshabilitado",
    clientCreated: "Cliente creado",
    secretRotated: "Secreto rotado"
  } satisfies Translated<OAuthProviderLocalization>,
  organization: {
    accept: "Aceptar",
    acceptInvitationTitle: "Invitación a la organización",
    acceptInvitationDescription:
      "Se te ha invitado a unirte a {{organization}} como {{role}}.",
    accepted: "Aceptada",
    actions: "Acciones",
    admin: "Administrador",
    all: "Todos",
    canceled: "Cancelada",
    cancelInvitation: "Cancelar invitación",
    changeLogo: "Cambiar logotipo",
    changeMemberRole: "Cambiar rol",
    changeMemberRoleDescription:
      "Elige los roles que debería tener este miembro en la organización.",
    clear: "Borrar",
    createOrganization: "Crear organización",
    deleteLogo: "Eliminar logotipo",
    deleteOrganization: "Eliminar organización",
    deleteOrganizationDescription:
      "Elimina esta organización y todos los datos asociados de forma permanente. Todos los miembros perderán el acceso. Esta acción no se puede deshacer.",
    invitations: "Invitaciones",
    invitationResent: "Invitación reenviada",
    invitationUnavailable: "Invitación no disponible",
    invitationUnavailableDescription:
      "Esta invitación no es válida, ha caducado o ya se procesó.",
    invitedAt: "Invitado el",
    inviteMember: "Invitar miembro",
    inviteMemberSuccess: "Miembro invitado correctamente",
    inviteMemberDescription:
      "Enviaremos un enlace para unirse por correo electrónico. Elige el rol que tendrá una vez aceptada.",
    leftOrganization: "Has dejado la organización",
    leaveOrganization: "Dejar la organización",
    leaveOrganizationDescription:
      "Dejarás esta organización y perderás el acceso a sus datos y recursos. Necesitarás una nueva invitación para volver a unirte.",
    logo: "Logotipo",
    logoChangedSuccess: "Logotipo actualizado correctamente",
    logoDeletedSuccess: "Logotipo eliminado correctamente",
    manage: "Gestionar",
    member: "Miembro",
    memberRemoved: "Miembro eliminado",
    memberRoleUpdated: "Rol de miembro actualizado",
    members: "Miembros",
    people: "Personas",
    name: "Nombre",
    namePlaceholder: "Introduce el nombre de la organización",
    noInvitations: "No hay invitaciones",
    noOrganizations: "No hay organizaciones",
    organization: "Organización",
    organizationDeleted: "Organización eliminada",
    organizationInvitationsEmptyDescription:
      "Invita a un miembro del equipo a colaborar en esta organización.",
    organizations: "Organizaciones",
    organizationsDescription:
      "Crea una organización para colaborar con otras personas y gestionar el acceso compartido.",
    organizationProfile: "Perfil de la organización",
    organizationUpdatedSuccess: "Organización actualizada correctamente",
    owner: "Propietario",
    pending: "Pendiente",
    nextPage: "Página siguiente",
    firstPage: "Primera página",
    lastPage: "Última página",
    pageOf: "Página {{page}} de {{pages}}",
    rowsPerPage: "Filas por página",
    columns: "Columnas",
    selectedCount: "{{count}} seleccionados",
    selectRow: "Seleccionar fila",
    selectAllRows: "Seleccionar todas las filas de esta página",
    cancelSelectedInvitations: "Cancelar invitaciones seleccionadas",
    cancelSelectedInvitationsDescription:
      "¿Quieres cancelar las invitaciones pendientes seleccionadas?",
    invitationsCanceled: "{{count}} invitaciones canceladas",
    removeSelectedMembers: "Eliminar miembros seleccionados",
    removeSelectedMembersDescription:
      "¿Quieres eliminar a los miembros seleccionados de esta organización? El acceso se perderá de inmediato.",
    membersRemoved: "{{count}} miembros eliminados",
    deleteSelectedRoles: "Eliminar roles seleccionados",
    deleteSelectedRolesDescription:
      "¿Quieres eliminar los roles seleccionados? Los roles asignados a miembros no se pueden eliminar.",
    rolesDeleted: "{{count}} roles eliminados",
    personalAccount: "Cuenta personal",
    previousPage: "Página anterior",
    rejected: "Rechazada",
    paginationRange: "{{from}}–{{to}} de {{total}}",
    return: "Volver",
    rejectInvitation: "Rechazar invitación",
    removeMember: "Eliminar miembro",
    removeMemberWarning:
      "¿Quieres eliminar a este miembro de la organización? El acceso se perderá de inmediato.",
    resendInvitation: "Reenviar invitación",
    role: "Rol",
    search: "Buscar...",
    selectRoles: "Seleccionar roles",
    slug: "Slug",
    slugPlaceholder: "slug-de-la-organizacion",
    status: "Estado",
    uploadLogo: "Subir logotipo",
    userInvitationsEmptyDescription:
      "Las invitaciones para unirte a una organización aparecerán aquí.",
    verifyEmailToViewInvitations:
      "Verifica tu correo electrónico para ver las invitaciones",
    verifyEmailToViewInvitationsDescription:
      "Por motivos de seguridad, las invitaciones solo están disponibles después de verificar tu correo electrónico.",
    teams: "Equipos",
    team: "Equipo",
    teamsDescription: "Crea equipos y gestiona sus miembros.",
    selectTeam: "Seleccionar equipo",
    allTeams: "Todos los equipos",
    selectMember: "Seleccionar miembro",
    createTeam: "Crear equipo",
    renameTeam: "Renombrar equipo",
    deleteTeam: "Eliminar equipo",
    deleteTeamDescription:
      "Elimina este equipo y quita las asignaciones de sus miembros. Esto no se puede deshacer.",
    noTeams: "No hay equipos",
    noTeamsDescription:
      "Crea un equipo para organizar el acceso dentro de esta organización.",
    teamMembers: "Miembros del equipo",
    addTeamMember: "Añadir miembro al equipo",
    removeTeamMember: "Quitar del equipo",
    teamCreated: "Equipo creado",
    teamUpdated: "Equipo actualizado",
    teamDeleted: "Equipo eliminado",
    teamLimitReached: "Esta organización ha alcanzado su límite de equipos.",
    teamMemberLimitReached: "Este equipo ha alcanzado su límite de miembros.",
    lastTeamRemovalDisabled:
      "Esta organización debe conservar al menos un equipo.",
    activeTeamRemovalDisabled:
      "Cambia a otro equipo antes de eliminar este equipo.",
    onlyOwnerActionDisabled:
      "Transfiere la propiedad antes de eliminar al único propietario.",
    limitReached: "Límite alcanzado",
    organizationLimitReached: "Has alcanzado el límite de organizaciones.",
    membershipLimitReached:
      "Esta organización ha alcanzado su límite de miembros.",
    invitationLimitReached:
      "Esta organización ha alcanzado su límite de invitaciones.",
    roles: "Roles",
    rolesDescription: "Crea roles y define lo que puede hacer cada uno.",
    createRole: "Crear rol",
    editRole: "Editar rol",
    deleteRole: "Eliminar rol",
    deleteRoleDescription:
      "Elimina este rol de forma permanente. Los miembros deben asignarse primero a otro rol.",
    roleName: "Nombre del rol",
    permissions: "Permisos",
    permissionsLimitedDescription:
      "Solo puedes asignar permisos incluidos en tu propio rol.",
    noRoles: "No hay roles personalizados",
    noRolesDescription:
      "Crea un rol para definir un acceso personalizado a la organización.",
    roleCreated: "Rol creado",
    roleUpdated: "Rol actualizado",
    roleDeleted: "Rol eliminado",
    roleInUse: "Este rol está asignado a {{count}} miembros.",
    roleNamePlaceholder: "agente-de-soporte"
  } satisfies Translated<OrganizationLocalization>,
  passkey: {
    passkey: "Passkey",
    addPasskey: "Añadir passkey",
    deletePasskey: "Eliminar passkey {{name}}",
    deletePasskeyTitle: "Eliminar passkey",
    deletePasskeyWarning:
      "Esta acción no se puede deshacer. Tendrás que añadir este passkey de nuevo antes de poder usarlo otra vez para iniciar sesión.",
    passkeys: "Passkeys",
    passkeysDescription: "Crea un passkey para el acceso seguro a tu cuenta.",
    noPasskeys: "No hay passkeys",
    name: "Nombre",
    renamePasskey: "Renombrar passkey",
    renamePasskeySuccess: "Passkey renombrado"
  } satisfies Translated<PasskeyLocalization>,
  phoneNumber: {
    country: "País o región",
    invalidPhoneNumber: "Introduce un número de teléfono válido",
    phoneNumber: "Número de teléfono",
    phoneNumberPlaceholder: "+34 612 345 678",
    phoneCode: "Código telefónico",
    sendCode: "Enviar código",
    verifyCode: "Verificar código",
    codeSentTo: "Hemos enviado un código a {{phoneNumber}}",
    codeLengthMismatch: "Introduce el código de {{length}} dígitos",
    useDifferentPhoneNumber: "Usar otro número de teléfono",
    usePassword: "Usar contraseña",
    useVerificationCode: "Usar código de verificación",
    forgotPassword: "¿Olvidaste tu contraseña?",
    resetPassword: "Restablecer contraseña",
    changePhoneNumber: "Cambiar número de teléfono",
    updatePhoneNumber: "Actualizar número de teléfono",
    phoneNumberUpdated: "Número de teléfono actualizado",
    removePhoneNumber: "Eliminar número de teléfono",
    phoneNumberRemoved: "Número de teléfono eliminado",
    removePhoneNumberTitle: "¿Eliminar este número de teléfono de tu cuenta?",
    removePhoneNumberDescription:
      "Después no podrás usarlo para iniciar sesión ni para restablecer tu contraseña.",
    cancel: "Cancelar"
  } satisfies Translated<PhoneNumberLocalization>,
  siwe: {
    ethereum: "Ethereum",
    continueWithEthereum: "Continuar con Ethereum",
    signMessage: "Firmar mensaje",
    email: "Correo electrónico",
    emailDescription: "Añade un correo electrónico a esta cuenta de wallet.",
    emailOptional: "Correo electrónico (opcional)",
    wallets: "Wallets",
    walletsDescription:
      "Gestiona las wallets de Ethereum vinculadas a tu cuenta.",
    connectWallet: "Conectar wallet",
    noWallets: "No hay wallets de Ethereum conectadas.",
    primary: "Principal",
    setPrimary: "Establecer como principal",
    removeWallet: "Eliminar wallet",
    removeWalletTitle: "¿Eliminar wallet de Ethereum?",
    removeWalletWarning:
      "No podrás iniciar sesión con esta wallet hasta que la vuelvas a conectar.",
    chain: "Cadena {{chainId}}"
  } satisfies Translated<SiweLocalization>,
  sso: {
    addProvider: "Añadir proveedor SSO",
    cancel: "Cancelar",
    clientId: "ID de cliente",
    clientSecret: "Secreto de cliente",
    continueWithEmail: "Continuar con correo electrónico",
    continueWithSso: "Continuar con SSO",
    copyDnsHost: "Copiar host DNS",
    copyDnsValue: "Copiar valor DNS",
    domain: "Dominio de correo electrónico",
    domainVerification: "Verificación de dominio",
    domainVerificationDescription:
      "Publica el registro TXT de cada dominio configurado y verifícalo a continuación.",
    domainVerificationRequested: "Se ha creado un nuevo token de verificación.",
    domainVerified: "El dominio del proveedor ha sido verificado.",
    deleteProvider: "Eliminar proveedor",
    deleteProviderDescription:
      "Los usuarios ya no podrán iniciar sesión con este proveedor.",
    discoveryEndpoint: "Punto de conexión de descubrimiento",
    editProvider: "Editar proveedor",
    emailFirstDescription:
      "Introduce tu correo electrónico corporativo para continuar.",
    entryPoint: "URL de SSO",
    identityProviderMetadata: "XML de metadatos del proveedor de identidad",
    issuer: "URL del emisor",
    oidc: "OIDC",
    noProviders: "No hay proveedores SSO",
    noProvidersDescription:
      "Añade un proveedor de identidad para habilitar el inicio de sesión de la organización.",
    organizationId: "ID de la organización",
    providerCreated: "Se ha añadido el proveedor SSO.",
    providerDeleted: "Se ha eliminado el proveedor SSO.",
    providerId: "ID del proveedor",
    providerSetup: "Configurar proveedor SSO",
    providerSetupDescription:
      "Conecta un proveedor de identidad OpenID Connect o SAML.",
    providerList: "SSO de la organización",
    providerListDescription:
      "Gestiona los proveedores de identidad y los dominios verificados de esta organización.",
    providerAccessDenied:
      "Solo los propietarios y administradores de la organización pueden gestionar proveedores SSO.",
    providerLoadError: "No se pudieron cargar los proveedores SSO.",
    providerUpdated: "Se ha actualizado el proveedor SSO.",
    requestNewToken: "Crear nuevo token",
    retry: "Reintentar",
    saml: "SAML",
    saveProvider: "Guardar proveedor",
    txtRecordHost: "Host del registro TXT",
    txtRecordValue: "Valor del registro TXT",
    useDifferentEmail: "Usar otro correo electrónico",
    verifyDomain: "Verificar dominio",
    noProvider:
      "No se encontró inicio de sesión de la organización. Elige otro método para continuar.",
    ssoUnavailable:
      "El inicio de sesión de la organización no está disponible. Prueba otro método de inicio de sesión."
  } satisfies Translated<SsoLocalization>,
  theme: {
    appearance: "Apariencia",
    theme: "Tema",
    system: "Sistema",
    light: "Claro",
    dark: "Oscuro"
  } satisfies Translated<ThemeLocalization>,
  twoFactor: {
    twoFactor: "Autenticación de dos factores",
    twoFactorDescription:
      "Añade un segundo paso al inicio de sesión para que una contraseña robada no sea suficiente",
    enableTwoFactor: "Activar autenticación de dos factores",
    disableTwoFactor: "Desactivar autenticación de dos factores",
    twoFactorEnabled: "La autenticación de dos factores está activada",
    twoFactorDisabled: "La autenticación de dos factores está desactivada",
    passwordConfirmation: "Introduce tu contraseña para continuar",
    chooseEnrollmentMethod:
      "Elige cómo quieres confirmar tus futuros inicios de sesión",
    authenticatorApp: "Aplicación de autenticación",
    authenticatorAppDescription:
      "Usa un código cambiante de una aplicación de autenticación",
    deliveredCode: "Código por correo electrónico o SMS",
    deliveredCodeDescription:
      "Recibe un código nuevo cada vez que inicies sesión",
    scanQrCode: "Escanea esto con tu aplicación de autenticación",
    setupKey: "¿No puedes escanear? Introduce esta clave en su lugar",
    setupKeyCopied: "Clave de configuración copiada",
    setupKeyCopyFailed:
      "No se pudo copiar la clave de configuración. Selecciónala y cópiala manualmente.",
    authenticatorCode: "Código de autenticación",
    authenticatorCodeDescription:
      "Introduce el código de tu aplicación de autenticación",
    emailedCode: "Código por correo electrónico",
    emailedCodeDescription:
      "Te hemos enviado un código por correo electrónico. Introdúcelo para completar el inicio de sesión",
    sendEmailCode: "Enviar código por correo electrónico",
    backupCode: "Código de recuperación",
    backupCodeDescription:
      "Introduce uno de tus códigos de recuperación guardados",
    backupCodes: "Códigos de recuperación",
    backupCodesForWebsite: "Códigos de recuperación para {{website}}",
    backupCodesDescription:
      "Guarda estos códigos en un lugar seguro. Cada código funciona una vez si pierdes tu autenticador.",
    backupCodesCopied: "Códigos de recuperación copiados",
    backupCodesCopyFailed:
      "No se pudieron copiar los códigos de recuperación. Selecciónalos y cópialos manualmente.",
    downloadBackupCodes: "Descargar .txt",
    printBackupCodes: "Imprimir",
    regenerateBackupCodes: "Regenerar códigos de recuperación",
    backupCodesRegenerated:
      "Se han creado nuevos códigos de recuperación. Los códigos antiguos ya no funcionan.",
    useAuthenticator: "Usar aplicación de autenticación",
    useEmailedCode: "Usar código por correo electrónico",
    useBackupCode: "Usar código de recuperación",
    trustDevice: "Confiar en este dispositivo",
    trustDeviceDescription:
      "Omitir el segundo paso en este dispositivo en el futuro",
    verify: "Verificar",
    codeLengthMismatch: "Introduce el código de {{length}} dígitos",
    backToSignIn: "Volver a iniciar sesión",
    done: "Listo"
  } satisfies Translated<TwoFactorLocalization>,
  username: {
    username: "Nombre de usuario",
    usernamePlaceholder: "Nombre de usuario",
    usernameOrEmailPlaceholder: "Nombre de usuario o correo electrónico",
    usernameAvailable: "El nombre de usuario está disponible",
    usernameTaken: "El nombre de usuario ya está en uso. Prueba con otro.",
    displayUsername: "Nombre para mostrar",
    displayUsernamePlaceholder: "Nombre para mostrar"
  } satisfies Translated<UsernameLocalization>
}
