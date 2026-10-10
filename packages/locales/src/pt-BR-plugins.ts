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

export const ptBRPlugins = {
  admin: {
    accessDenied: "Acesso negado",
    accessDeniedDescription: "Você não tem permissão para gerenciar usuários.",
    active: "Ativo",
    accountInformation: "Informações da conta",
    admin: "Administração",
    banned: "Banido",
    banDuration: "Duração do banimento (dias)",
    banDurationDescription: "Deixe em branco para um banimento permanente.",
    banExpires: "Banimento expira",
    banReason: "Motivo do banimento",
    banUser: "Banir usuário",
    cancel: "Cancelar",
    close: "Fechar",
    copyUserId: "Copiar ID do usuário",
    created: "Criado",
    createUser: "Criar usuário",
    deleteUser: "Excluir usuário",
    dangerZone: "Zona de perigo",
    email: "E-mail",
    emailVerified: "E-mail verificado",
    endsWith: "Termina com",
    filterAllStatuses: "Todos os status",
    loadUsersError: "Não foi possível carregar os usuários",
    loadUsersErrorDescription:
      "Tente novamente ou verifique a configuração do plugin Admin.",
    name: "Nome",
    moreActions: "Mais ações",
    noUsers: "Nenhum usuário encontrado",
    noUsersDescription: "Altere a pesquisa ou crie um usuário.",
    nextPage: "Próxima página",
    previousPage: "Página anterior",
    impersonateUser: "Acessar como usuário",
    overview: "Visão geral",
    password: "Senha",
    profileAndAccess: "Perfil e acesso",
    retry: "Tentar novamente",
    role: "Função",
    search: "Pesquisar",
    searchContains: "Contém",
    searchOperator: "Operador de pesquisa",
    searchByEmail: "Pesquisar por e-mail",
    searchByName: "Pesquisar por nome",
    sessions: "Sessões",
    noSessions: "Nenhuma sessão ativa",
    revoke: "Revogar",
    revokeAllSessions: "Revogar todas as sessões",
    saveChanges: "Salvar alterações",
    saveRole: "Salvar função",
    saveUser: "Salvar usuário",
    security: "Segurança",
    setPassword: "Definir senha",
    sort: "Ordenar",
    sortNameAscending: "Nome A-Z",
    sortNameDescending: "Nome Z-A",
    sortNewest: "O mais novo primeiro",
    sortOldest: "Mais antigo primeiro",
    startsWith: "Começa com",
    status: "Status",
    stopImpersonating: "Encerrar acesso como usuário",
    userDetails: "Detalhes do usuário",
    userId: "ID do usuário",
    unknownView: "Visualização de administrador desconhecida",
    unknownViewDescription:
      "Esta rota estática do painel administrativo não está registrada.",
    unbanUser: "Desbanir usuário",
    users: "Usuários",
    usersDescription:
      "Gerencie o acesso, as funções e as sessões dos usuários.",
    usersPaginationRange: "{{from}}-{{to}} de {{total}}"
  } satisfies Translated<AdminLocalization>,
  agentAuth: {
    approvalTitle: "Aprovar acesso de agente",
    approvalDescription: "Confira o que esse agente deseja fazer em seu nome.",
    requestedCapabilities: "Capacidades solicitadas",
    requestReason: "Motivo",
    constraints: "Limites",
    delegatedAgent: "Agente delegado",
    autonomousAgent: "Agente autônomo",
    approvalNone: "Sem verificação extra",
    approvalSession: "Login recente",
    approvalWebauthn: "Chave de acesso necessária",
    allow: "Permitir os recursos selecionados",
    deny: "Negar",
    approvedTitle: "Acesso aprovado",
    approvedDescription: "O agente agora pode usar os recursos selecionados.",
    deniedTitle: "Acesso negado",
    deniedDescription: "O agente não recebeu acesso.",
    noCapabilities: "Esta solicitação não possui recursos pendentes.",
    invalidRequest:
      "Este link de aprovação não contém o identificador do agente.",
    approvalError:
      "Não foi possível atualizar esta solicitação. Tente novamente.",
    agents: "Acesso do agente",
    agentsDescription:
      "Confira os agentes e revogue os acessos em que você não confia mais.",
    noAgents: "Nenhum agente tem acesso à sua conta.",
    active: "Ativo",
    pending: "Pendente",
    denied: "Negado",
    revoked: "Revogado",
    expires: "Expira {date}",
    lastUsed: "Última utilização {date}",
    neverUsed: "Nunca usado",
    revoke: "Revogar",
    revokeTitle: "Revogar acesso?",
    revokeDescription: "O agente perderá esse acesso imediatamente.",
    confirmRevoke: "Revogar acesso"
  } satisfies Translated<AgentAuthLocalization>,
  anonymous: {
    continueAsGuest: "Continuar como convidado"
  } satisfies Translated<AnonymousLocalization>,
  apiKey: {
    apiKey: "Chave de API",
    apiKeys: "Chaves de API",
    apiKeysDescription:
      "Crie uma chave de API para acessar sua conta por meio da API.",
    createApiKey: "Criar chave de API",
    noApiKeys: "Sem chaves de API",
    name: "Nome",
    expiration: "Expiração",
    day: "dia",
    days: "dias",
    never: "Nunca",
    created: "Criado",
    expires: "Expira",
    neverExpires: "Nunca expira",
    newApiKey: "Nova chave de API",
    newApiKeyWarning:
      "Esta chave de API será exibida apenas uma vez. Copie-a e guarde-a em um lugar seguro.",
    deleteApiKey: "Excluir chave de API",
    deleteApiKeyWarning:
      "Esta ação não pode ser desfeita. Qualquer serviço que use esta chave de API deixará de funcionar imediatamente.",
    dismissNewKey: "Salvei minha chave",
    editApiKey: "Editar chave de API",
    configuration: "Configuração",
    enabled: "Habilitado",
    disabled: "Desabilitado",
    requests: "Solicitações",
    remaining: "Restante",
    lastRequest: "Última solicitação",
    neverRequested: "Nunca solicitado",
    sortBy: "Ordenar por",
    newest: "Mais recente",
    oldest: "Mais antigo",
    nameAscending: "Nome A – Z",
    nameDescending: "Nome Z–A",
    previousPage: "Página anterior",
    nextPage: "Próxima página"
  } satisfies Translated<ApiKeyLocalization>,
  billing: {
    billing: "Cobrança",
    billingDescription:
      "Gerencie planos, detalhes de assinatura, licenças e uso.",
    plans: "Planos",
    currentPlan: "Plano atual",
    choosePlan: "Escolha o plano",
    changePlan: "Alterar plano",
    perMonth: "por mês",
    perYear: "por ano",
    oneTime: "uma vez",
    popular: "Popular",
    subscription: "Assinatura",
    noSubscription: "Nenhuma assinatura ativa",
    noSubscriptionDescription: "Escolha um plano para iniciar uma assinatura.",
    manageBilling: "Gerenciar cobrança",
    renewsOn: "Renova em {{date}}",
    endsOn: "Termina em {{date}}",
    cancelSubscription: "Cancelar assinatura",
    cancelSubscriptionTitle: "Cancelar assinatura?",
    cancelSubscriptionDescription:
      "Seu acesso permanece disponível até o final do período de cobrança atual.",
    restoreSubscription: "Restaurar assinatura",
    restoreSubscriptionTitle: "Restaurar assinatura?",
    restoreSubscriptionDescription:
      "Sua assinatura continuará sendo renovada no plano atual.",
    confirm: "Confirmar",
    cancel: "Cancelar",
    seats: "Licenças",
    updateSeats: "Atualizar licenças",
    usage: "Uso",
    unlimited: "Ilimitado",
    used: "{{used}} usado",
    loadingBilling: "Carregando informações de cobrança"
  } satisfies Translated<BillingLocalization>,
  dash: {
    activity: "Atividade",
    activityDescription: "Confira os logins recentes e a atividade da conta.",
    adminUserActivityDescription:
      "Confira os logins recentes e a atividade da conta deste usuário.",
    adminActivityDescription:
      "Confira a atividade nas organizações que você gerencia.",
    organizationActivityDescription:
      "Confira a atividade disponível para você nesta organização.",
    organizationWide: "Em toda a organização",
    personalOnly: "Sua atividade",
    noActivity: "Nenhuma atividade registrada",
    noActivityDescription:
      "Não há atividades registradas para esta visualização.",
    activityLoadError: "Não foi possível carregar a atividade",
    activityLoadErrorDescription:
      "Verifique a configuração do cliente Dash e tente novamente.",
    retry: "Tente novamente",
    paginationRange: "{{from}}–{{to}} de {{total}}",
    previousPage: "Página anterior",
    nextPage: "Próxima página",
    allEvents: "Todos os eventos",
    eventType: "Tipo de evento",
    identifier: "Identificador",
    identifierPlaceholder: "Filtrar por e-mail, ID de usuário ou provedor",
    unknownEvent: "Evento de atividade",
    eventLabels: {
      account_linked: "Conta vinculada",
      account_unlinked: "Conta desvinculada",
      all_sessions_revoked: "Todas as sessões revogadas",
      email_changed: "E-mail alterado",
      email_verification_sent: "E-mail de verificação enviado",
      email_verified: "E-mail verificado",
      organization_created: "Organização criada",
      organization_member_added: "Membro adicionado",
      organization_member_invite_accepted: "Convite aceito",
      organization_member_invite_canceled: "Convite cancelado",
      organization_member_invite_rejected: "Convite rejeitado",
      organization_member_invited: "Membro convidado",
      organization_member_removed: "Membro removido",
      organization_member_role_updated: "Função do membro atualizada",
      organization_team_created: "Equipe criada",
      organization_team_deleted: "Equipe excluída",
      organization_team_member_added: "Membro da equipe adicionado",
      organization_team_member_removed: "Membro da equipe removido",
      organization_team_updated: "Equipe atualizada",
      organization_updated: "Organização atualizada",
      password_changed: "Senha alterada",
      password_reset_completed: "Redefinição de senha concluída",
      password_reset_requested: "Redefinição de senha solicitada",
      profile_image_updated: "Imagem do perfil atualizada",
      profile_updated: "Perfil atualizado",
      session_created: "Sessão criada",
      session_revoked: "Sessão revogada",
      two_factor_disabled: "Autenticação de dois fatores desativada",
      two_factor_enabled: "Autenticação de dois fatores habilitada",
      two_factor_verified: "Autenticação de dois fatores verificada",
      user_banned: "Usuário banido",
      user_created: "Conta criada",
      user_deleted: "Usuário excluído",
      user_impersonated: "Acesso como usuário iniciado",
      user_impersonated_stopped: "Acesso como usuário encerrado",
      user_sign_in_failed: "Falha no login",
      user_signed_in: "Conectado",
      user_signed_out: "Desconectado",
      user_unbanned: "Usuário desbanido"
    }
  } satisfies Translated<DashLocalization>,
  deleteUser: {
    deleteAccount: "Excluir conta",
    deleteAccountDescription:
      "Remova permanentemente sua conta e todos os dados associados. Esta ação não pode ser desfeita.",
    deleteUserVerificationSent:
      "Verifique seu e-mail para confirmar a exclusão da conta.",
    deleteUserSuccess: "Sua conta foi excluída."
  } satisfies Translated<DeleteUserLocalization>,
  deviceAuthorization: {
    deviceAuthorization: "Autorização do dispositivo",
    deviceAuthorizationDescription:
      "Digite o código exibido no seu dispositivo.",
    deviceCode: "Código do dispositivo",
    invalidDeviceCode: "O código é inválido ou expirou.",
    continue: "Continuar",
    approveDevice: "Aprovar dispositivo",
    approveDeviceDescription:
      "Um dispositivo está solicitando acesso à sua conta.",
    signedInAs: "Conectado como",
    approve: "Aprovar",
    deny: "Recusar",
    deviceApproved: "Dispositivo aprovado",
    deviceApprovedDescription:
      "O dispositivo agora pode acessar sua conta. Você pode retornar a ele e continuar.",
    deviceDenied: "Dispositivo negado",
    deviceDeniedDescription: "O dispositivo não recebeu acesso à sua conta.",
    returnToApplication: "Voltar para o aplicativo"
  } satisfies Translated<DeviceAuthorizationLocalization>,
  emailOtp: {
    emailOtp: "Código de e-mail",
    sendCode: "Enviar código",
    code: "Código",
    verifyCode: "Verifique o código",
    codeSentTo: "Enviamos um código para {{email}}",
    codeLengthMismatch: "Insira um código de {{length}} dígitos",
    useDifferentEmail: "Use um e-mail diferente",
    codeSent: "Código enviado",
    emailVerified: "E-mail verificado",
    confirmCurrentEmail: "Confirme seu e-mail atual",
    confirmNewEmail: "Confirme seu novo e-mail",
    confirmEmailDescription:
      "Digite o código que enviamos para {{email}} para concluir a alteração."
  } satisfies Translated<EmailOtpLocalization>,
  lastLoginMethod: {
    lastUsed: "Usado pela última vez",
    lastUsedShort: "Último uso"
  } satisfies Translated<LastLoginMethodLocalization>,
  magicLink: {
    magicLink: "Link mágico",
    sendMagicLink: "Enviar link mágico",
    magicLinkSent: "Verifique seu e-mail para obter o link mágico",
    magicLinkSentTo: "Enviamos um link mágico para {{email}}"
  } satisfies Translated<MagicLinkLocalization>,
  multiSession: {
    switchAccount: "Trocar de conta",
    addAccount: "Adicionar conta",
    manageAccounts: "Gerenciar contas",
    manageAccountsDescription: "Gerencie suas contas para acesso seguro."
  } satisfies Translated<MultiSessionLocalization>,
  oauthProvider: {
    authorize: "Autorizar {{client}}",
    authorizationDescription: "{{client}} deseja acessar sua conta.",
    authorizationRequest: "deseja acessar sua conta",
    redirectTo: "Ao autorizar, você será redirecionado para",
    applicationInformation:
      "Os nomes e logotipos dos aplicativos são fornecidos por seus desenvolvedores. Autorize apenas aplicativos em que você confia.",
    requestedPermissions: "Isso permitirá que {{client}}:",
    signedInAs: "Conectado como",
    allow: "Autorizar",
    cancel: "Cancelar",
    privacyPolicy: "Política de privacidade",
    termsOfService: "Termos de uso",
    invalidRequest: "Solicitação de autorização inválida",
    invalidRequestDescription:
      "Esta solicitação de autorização não contém informações obrigatórias ou não é mais válida.",
    application: "Aplicativo",
    selectAccount: "Escolha uma conta",
    selectAccountDescription: "Escolha a conta que deseja usar com {{client}}.",
    currentAccount: "Atual",
    continue: "Continuar",
    noAccounts: "Nenhuma conta disponível",
    noAccountsDescription: "Faça login para continuar para {{client}}.",
    accountCreated: "Conta criada",
    continuing: "Levando você de volta para {{client}}.",
    continueFailed:
      "Sua conta está pronta, mas não foi possível redirecionar você para {{client}}.",
    tryAgain: "Tente novamente",
    connectedApplications: "Aplicativos conectados",
    noConnectedApplications: "Nenhum aplicativo conectado",
    connectedApplicationsDescription:
      "Os aplicativos que você autoriza aparecerão aqui.",
    lastAuthorized: "Última autorização",
    removeAuthorization: "Remover autorização",
    removeAuthorizationTitle: "Remover autorização?",
    removeAuthorizationDescription:
      "Este aplicativo precisará de sua aprovação antes de receber novo acesso. Os tokens existentes podem permanecer válidos até expirarem.",
    remove: "Remover",
    oauthClients: "Clientes OAuth",
    oauthClientsDescription:
      "Crie e gerencie aplicativos que podem solicitar acesso a contas.",
    noOAuthClients: "Nenhum cliente OAuth",
    noOAuthClientsDescription:
      "Crie um cliente quando seu aplicativo estiver pronto para usar o OAuth.",
    createClient: "Criar cliente",
    editClient: "Editar cliente",
    clientName: "Nome do cliente",
    applicationType: "Tipo de aplicativo",
    webApplication: "Aplicativo web",
    nativeApplication: "Aplicativo nativo",
    redirectUrls: "URLs de redirecionamento",
    redirectUrlsDescription: "Insira um URL por linha.",
    invalidUrl: "Insira um URL absoluto válido.",
    applicationUrl: "URL do aplicativo",
    logoUrl: "URL do logotipo",
    scopes: "Escopos",
    saveChanges: "Salvar alterações",
    clientId: "ID do cliente",
    clientSecret: "Segredo do cliente",
    clientSecretWarning:
      "Copie este segredo agora. Não será mostrado novamente.",
    rotateSecret: "Gerar novo segredo",
    rotateSecretTitle: "Gerar um novo segredo do cliente?",
    rotateSecretDescription:
      "O segredo atual irá parar de funcionar imediatamente.",
    deleteClient: "Excluir cliente",
    deleteClientTitle: "Excluir cliente OAuth?",
    deleteClientDescription:
      "Isso remove permanentemente o cliente e interrompe novas solicitações de autorização.",
    enabled: "Habilitado",
    disabled: "Desabilitado",
    clientCreated: "Cliente criado",
    secretRotated: "Segredo atualizado"
  } satisfies Translated<OAuthProviderLocalization>,
  organization: {
    accept: "Aceitar",
    acceptInvitationTitle: "Convite da organização",
    acceptInvitationDescription:
      "Você recebeu um convite para participar de {{organization}} como {{role}}.",
    accepted: "Aceito",
    actions: "Ações",
    admin: "Administrador",
    all: "Todos",
    canceled: "Cancelado",
    cancelInvitation: "Cancelar convite",
    changeLogo: "Alterar logotipo",
    changeMemberRole: "Mudar função",
    changeMemberRoleDescription:
      "Escolha as funções que este membro deve ter na organização.",
    clear: "Limpar",
    createOrganization: "Criar organização",
    deleteLogo: "Excluir logotipo",
    deleteOrganization: "Excluir organização",
    deleteOrganizationDescription:
      "Exclua permanentemente esta organização e todos os seus dados. Todos os membros perderão o acesso e isso não poderá ser desfeito.",
    invitations: "Convites",
    invitationResent: "Convite reenviado",
    invitationUnavailable: "Convite indisponível",
    invitationUnavailableDescription:
      "Este convite é inválido, expirou ou já foi processado.",
    invitedAt: "Convidado em",
    inviteMember: "Convidar membro",
    inviteMemberSuccess: "Membro convidado com sucesso",
    inviteMemberDescription:
      "Enviaremos um link por e-mail para participar desta organização. Escolha a função que a pessoa terá ao aceitar o convite.",
    leftOrganization: "Você saiu da organização",
    leaveOrganization: "Sair da organização",
    leaveOrganizationDescription:
      "Saia desta organização e perca o acesso aos seus dados e recursos. Você precisará de um novo convite para voltar a participar.",
    logo: "Logotipo",
    logoChangedSuccess: "Logotipo atualizado com sucesso",
    logoDeletedSuccess: "Logotipo removido com sucesso",
    manage: "Gerenciar",
    member: "Membro",
    memberRemoved: "Membro removido",
    memberRoleUpdated: "Função do membro atualizada",
    members: "Membros",
    people: "Pessoas",
    name: "Nome",
    namePlaceholder: "Insira o nome da organização",
    noInvitations: "Sem convites",
    noOrganizations: "Nenhuma organização",
    organization: "Organização",
    organizationDeleted: "Organização excluída",
    organizationInvitationsEmptyDescription:
      "Convide alguém da sua equipe para colaborar nesta organização.",
    organizations: "Organizações",
    organizationsDescription:
      "Crie uma organização para colaborar com outras pessoas e gerenciar o acesso compartilhado.",
    organizationProfile: "Perfil da organização",
    organizationUpdatedSuccess: "Organização atualizada com sucesso",
    owner: "Proprietário",
    pending: "Pendente",
    nextPage: "Próxima página",
    firstPage: "Primeira página",
    lastPage: "Última página",
    pageOf: "Página {{page}} de {{pages}}",
    rowsPerPage: "Linhas por página",
    columns: "Colunas",
    selectedCount: "{{count}} itens selecionados",
    selectRow: "Selecione a linha",
    selectAllRows: "Selecione todas as linhas desta página",
    cancelSelectedInvitations: "Cancelar convites selecionados",
    cancelSelectedInvitationsDescription:
      "Cancelar os convites pendentes selecionados?",
    invitationsCanceled: "{{count}} convites cancelados",
    removeSelectedMembers: "Remover membros selecionados",
    removeSelectedMembersDescription:
      "Remover os membros selecionados desta organização? Eles perderão o acesso imediatamente.",
    membersRemoved: "{{count}} membros removidos",
    deleteSelectedRoles: "Excluir funções selecionadas",
    deleteSelectedRolesDescription:
      "Excluir as funções selecionadas? As funções atribuídas aos membros não podem ser excluídas.",
    rolesDeleted: "{{count}} funções excluídas",
    personalAccount: "Conta pessoal",
    previousPage: "Página anterior",
    rejected: "Rejeitado",
    paginationRange: "{{from}}–{{to}} de {{total}}",
    return: "Retornar",
    rejectInvitation: "Rejeitar convite",
    removeMember: "Remover membro",
    removeMemberWarning:
      "Tem certeza de que deseja remover este membro da organização? Essa pessoa perderá o acesso imediatamente.",
    resendInvitation: "Reenviar convite",
    role: "Função",
    search: "Pesquisar...",
    selectAtLeastOneRole: "Selecione pelo menos uma função",
    selectRoles: "Selecione funções",
    slug: "Slug",
    slugPlaceholder: "minha-organizacao",
    status: "Status",
    uploadLogo: "Carregar logotipo",
    userInvitationsEmptyDescription:
      "Os convites para ingressar em uma organização aparecerão aqui.",
    verifyEmailToViewInvitations: "Verifique seu e-mail para ver os convites",
    verifyEmailToViewInvitationsDescription:
      "Para sua segurança, os convites estarão disponíveis após você verificar seu endereço de e-mail.",
    teams: "Equipes",
    team: "Equipe",
    teamsDescription: "Crie equipes e gerencie seus membros.",
    selectTeam: "Selecione uma equipe",
    allTeams: "Todas as equipes",
    selectMember: "Selecione um membro",
    createTeam: "Criar equipe",
    renameTeam: "Renomear equipe",
    deleteTeam: "Excluir equipe",
    deleteTeamDescription:
      "Exclua esta equipe e remova os membros dela. Esta ação não pode ser desfeita.",
    noTeams: "Nenhuma equipe",
    noTeamsDescription:
      "Crie uma equipe para organizar o acesso nesta organização.",
    teamMembers: "Membros da equipe",
    addTeamMember: "Adicionar membro da equipe",
    removeTeamMember: "Remover da equipe",
    teamCreated: "Equipe criada",
    teamUpdated: "Equipe atualizada",
    teamDeleted: "Equipe excluída",
    teamLimitReached: "Esta organização atingiu o limite de equipes.",
    teamMemberLimitReached: "Esta equipe atingiu seu limite de membros.",
    lastTeamRemovalDisabled:
      "Esta organização deve manter pelo menos uma equipe.",
    activeTeamRemovalDisabled: "Mude para outra equipe antes de excluí-la.",
    onlyOwnerActionDisabled:
      "Transfira a propriedade antes de remover o único proprietário.",
    limitReached: "Limite atingido",
    organizationLimitReached: "Você atingiu o limite da organização.",
    membershipLimitReached: "Esta organização atingiu seu limite de membros.",
    invitationLimitReached: "Esta organização atingiu o limite de convites.",
    roles: "Funções",
    rolesDescription: "Crie funções e escolha o que cada função pode fazer.",
    createRole: "Criar função",
    editRole: "Editar função",
    deleteRole: "Excluir função",
    deleteRoleDescription:
      "Exclua esta função permanentemente. Os membros devem primeiro passar para outra função.",
    roleName: "Nome da função",
    permissions: "Permissões",
    permissionsLimitedDescription:
      "Você pode atribuir apenas permissões incluídas na sua própria função.",
    noRoles: "Sem funções personalizadas",
    noRolesDescription:
      "Crie uma função para definir o acesso personalizado à organização.",
    roleCreated: "Função criada",
    roleUpdated: "Função atualizada",
    roleDeleted: "Função excluída",
    roleInUse: "{{count}} membros usam esta função.",
    roleNamePlaceholder: "agente de suporte"
  } satisfies Translated<OrganizationLocalization>,
  passkey: {
    passkey: "Chave de acesso",
    addPasskey: "Adicionar chave de acesso",
    deletePasskey: "Excluir chave de acesso {{name}}",
    deletePasskeyTitle: "Excluir chave de acesso",
    deletePasskeyWarning:
      "Esta ação não pode ser desfeita. Você precisará adicionar esta chave de acesso novamente antes de poder usá-la para fazer login.",
    passkeys: "Chaves de acesso",
    passkeysDescription:
      "Crie uma chave de acesso para fazer login na sua conta com segurança.",
    noPasskeys: "Sem chaves de acesso",
    name: "Nome",
    renamePasskey: "Renomear chave de acesso",
    renamePasskeySuccess: "Chave de acesso renomeada"
  } satisfies Translated<PasskeyLocalization>,
  phoneNumber: {
    country: "País ou região",
    invalidPhoneNumber: "Insira um número de telefone válido",
    phoneNumber: "Número de telefone",
    phoneNumberPlaceholder: "+55 11 91234-5678",
    phoneCode: "Código do telefone",
    sendCode: "Enviar código",
    verifyCode: "Verifique o código",
    codeSentTo: "Enviamos um código para {{phoneNumber}}",
    codeLengthMismatch: "Insira um código de {{length}} dígitos",
    useDifferentPhoneNumber: "Usar outro número de telefone",
    usePassword: "Usar senha",
    useVerificationCode: "Usar código de verificação",
    forgotPassword: "Esqueceu sua senha?",
    resetPassword: "Redefinir senha",
    changePhoneNumber: "Alterar número de telefone",
    updatePhoneNumber: "Atualizar número de telefone",
    phoneNumberUpdated: "Número de telefone atualizado",
    removePhoneNumber: "Remover número de telefone",
    phoneNumberRemoved: "Número de telefone removido",
    removePhoneNumberTitle: "Remover este número de telefone da sua conta?",
    removePhoneNumberDescription:
      "Você não poderá mais usá-lo para fazer login ou redefinir sua senha.",
    cancel: "Cancelar"
  } satisfies Translated<PhoneNumberLocalization>,
  siwe: {
    ethereum: "Ethereum",
    continueWithEthereum: "Continuar com Ethereum",
    signMessage: "Assinar mensagem",
    email: "E-mail",
    emailDescription:
      "Adicione um endereço de e-mail a esta conta da carteira.",
    emailOptional: "E-mail (opcional)",
    wallets: "Carteiras",
    walletsDescription:
      "Gerencie as carteiras Ethereum conectadas à sua conta.",
    connectWallet: "Conectar carteira",
    noWallets: "Nenhuma carteira Ethereum conectada.",
    primary: "Primário",
    setPrimary: "Definir como principal",
    removeWallet: "Remover carteira",
    removeWalletTitle: "Remover carteira Ethereum?",
    removeWalletWarning:
      "Você não poderá fazer login com esta carteira até conectá-la novamente.",
    chain: "Rede {{chainId}}"
  } satisfies Translated<SiweLocalization>,
  sso: {
    addProvider: "Adicionar provedor de SSO",
    cancel: "Cancelar",
    clientId: "ID do cliente",
    clientSecret: "Segredo do cliente",
    continueWithEmail: "Continuar com e-mail",
    continueWithSso: "Continuar com SSO",
    copyDnsHost: "Copiar host DNS",
    copyDnsValue: "Copiar valor DNS",
    domain: "Domínio de e-mail",
    domainVerification: "Verificação de domínio",
    domainVerificationDescription:
      "Publique o registro TXT para cada domínio configurado e verifique-o.",
    domainVerificationRequested: "Um novo token de verificação foi gerado.",
    domainVerified: "O domínio do provedor foi verificado.",
    deleteProvider: "Excluir provedor",
    deleteProviderDescription:
      "Os usuários não poderão mais fazer login por meio deste provedor.",
    discoveryEndpoint: "Ponto de extremidade de descoberta",
    editProvider: "Editar provedor",
    emailFirstDescription: "Digite seu e-mail comercial para continuar.",
    entryPoint: "URL do SSO",
    identityProviderMetadata: "XML de metadados do provedor de identidade",
    invalidUrl: "Insira um URL absoluto válido.",
    issuer: "URL do emissor",
    oidc: "OIDC",
    noProviders: "Nenhum provedor de SSO",
    noProvidersDescription:
      "Adicione um provedor de identidade para permitir a entrada na organização.",
    organizationId: "ID da organização",
    providerCreated: "O provedor SSO foi adicionado.",
    providerDeleted: "O provedor de SSO foi excluído.",
    providerId: "ID do provedor",
    providerSetup: "Configuração do provedor de SSO",
    providerSetupDescription:
      "Conecte um provedor de identidade OpenID Connect ou SAML.",
    providerList: "SSO da organização",
    providerListDescription:
      "Gerencie provedores de identidade e domínios verificados para esta organização.",
    providerAccessDenied:
      "Somente proprietários e administradores da organização podem gerenciar provedores de SSO.",
    providerLoadError: "Não foi possível carregar os provedores de SSO.",
    providerUpdated: "O provedor de SSO foi atualizado.",
    requestNewToken: "Criar novo token",
    retry: "Tentar novamente",
    saml: "SAML",
    saveProvider: "Salvar provedor",
    txtRecordHost: "Host de registro TXT",
    txtRecordValue: "Valor do registro TXT",
    useDifferentEmail: "Use um e-mail diferente",
    verifyDomain: "Verifique o domínio",
    noProvider:
      "Nenhum login da organização foi encontrado. Escolha outra maneira de continuar.",
    ssoUnavailable:
      "O login da organização não está disponível. Tente outro método de login."
  } satisfies Translated<SsoLocalization>,
  theme: {
    appearance: "Aparência",
    theme: "Tema",
    system: "Sistema",
    light: "Claro",
    dark: "Escuro"
  } satisfies Translated<ThemeLocalization>,
  twoFactor: {
    twoFactor: "Autenticação de dois fatores",
    twoFactorDescription:
      "Adicione uma segunda etapa ao login para que uma senha roubada não seja suficiente.",
    enableTwoFactor: "Ativar autenticação de dois fatores",
    disableTwoFactor: "Desativar autenticação de dois fatores",
    twoFactorEnabled: "A autenticação de dois fatores está ativada",
    twoFactorDisabled: "A autenticação de dois fatores está desativada",
    passwordConfirmation: "Digite sua senha para continuar",
    chooseEnrollmentMethod: "Escolha como você deseja verificar logins futuros",
    authenticatorApp: "Aplicativo autenticador",
    authenticatorAppDescription:
      "Use um código rotativo de um aplicativo autenticador",
    deliveredCode: "Código de e-mail ou SMS",
    deliveredCodeDescription: "Receba um novo código sempre que fizer login",
    scanQrCode: "Escaneie este QR code com seu aplicativo autenticador",
    setupKey: "Não consegue escanear? Digite esta chave de configuração",
    setupKeyCopied: "Chave de configuração copiada",
    setupKeyCopyFailed:
      "Não foi possível copiar a chave de configuração. Selecione-a e copie-a manualmente.",
    authenticatorCode: "Código autenticador",
    authenticatorCodeDescription:
      "Insira o código do seu aplicativo autenticador",
    emailedCode: "Código enviado por e-mail",
    emailedCodeDescription:
      "Enviamos um código para você por e-mail. Digite-o para concluir o login",
    sendEmailCode: "Enviar código por e-mail",
    backupCode: "Código de recuperação",
    backupCodeDescription: "Digite um dos seus códigos de recuperação salvos.",
    backupCodes: "Códigos de recuperação",
    backupCodesForWebsite: "Códigos de recuperação para {{website}}",
    backupCodesDescription:
      "Guarde esses códigos em um lugar seguro. Cada código só pode ser usado uma vez se você perder o acesso ao autenticador.",
    backupCodesCopied: "Códigos de recuperação copiados",
    backupCodesCopyFailed:
      "Não foi possível copiar os códigos de recuperação. Selecione-os e copie-os manualmente.",
    downloadBackupCodes: "Baixar .txt",
    printBackupCodes: "Imprimir",
    regenerateBackupCodes: "Gerar novos códigos de recuperação",
    backupCodesRegenerated:
      "Novos códigos de recuperação foram gerados. Os códigos antigos não funcionam mais.",
    useAuthenticator: "Usar aplicativo autenticador",
    useEmailedCode: "Usar código enviado por e-mail",
    useBackupCode: "Usar código de recuperação",
    trustDevice: "Confiar neste dispositivo",
    trustDeviceDescription:
      "Pular esta etapa da autenticação neste dispositivo nos próximos logins.",
    verify: "Verificar",
    codeLengthMismatch: "Insira um código de {{length}} dígitos",
    backToSignIn: "Voltar para fazer login",
    done: "Feito"
  } satisfies Translated<TwoFactorLocalization>,
  username: {
    username: "Nome de usuário",
    usernamePlaceholder: "Nome de usuário",
    usernameOrEmailPlaceholder: "Nome de usuário ou e-mail",
    usernameAvailable: "O nome de usuário está disponível",
    usernameTaken: "Este nome de usuário já está em uso. Tente outro.",
    displayUsername: "Nome de exibição",
    displayUsernamePlaceholder: "Nome de exibição"
  } satisfies Translated<UsernameLocalization>
}
