import { deepmerge, defineAuthLocale, localization } from "@better-auth-ui/core"
import { ptBRPlugins } from "./pt-BR-plugins"

const ptBRLocalization = deepmerge(localization, {
  errors: {
    generic: "Algo deu errado. Tente novamente.",
    invalidCredentials: "Os dados de login estão incorretos. Tente novamente.",
    invalidCode: "Este código é inválido ou expirou. Solicite um novo código.",
    sessionExpired: "Faça login novamente para continuar.",
    permissionDenied: "Você não tem permissão para fazer isso.",
    rateLimited:
      "Muitas tentativas. Aguarde um pouco antes de tentar novamente.",
    passwordTooShort: "Sua senha é muito curta.",
    passwordTooLong: "Sua senha é muito longa.",
    accountExists: "Já existe uma conta com esses detalhes. Tente fazer login.",
    popupBlocked:
      "Permita pop-ups no seu navegador e tente fazer login novamente.",
    popupTimeout: "O tempo para fazer login expirou. Tente novamente.",
    passkeyFailed:
      "Não foi possível entrar com sua chave de acesso. Tente novamente ou use outro método de entrada.",
    walletFailed:
      "Não foi possível concluir a solicitação da carteira. Verifique sua carteira e tente novamente.",
    copyFailed: "Não foi possível copiar. Tente novamente.",
    imageUploadFailed:
      "Não foi possível enviar esta imagem. Tente outra imagem.",
    imageDeleteFailed: "Não foi possível excluir a imagem. Tente novamente.",
    roleHasMembers:
      "Mova os membros para outra função antes de excluir esta função."
  },
  auth: {
    callbackAccountLinkedTitle: "Conta vinculada",
    callbackAccountLinkedDescription: "Sua conta foi vinculada.",
    callbackAccountLinkConflictTitle: "Esta conta já está conectada",
    callbackAccountLinkConflictDescription:
      "A conta do provedor pertence a outro usuário ou não pode ser vinculada com segurança.",
    callbackCancelledTitle: "A autenticação foi cancelada",
    callbackCancelledDescription:
      "Nenhuma alteração foi feita. Você pode tentar novamente quando quiser.",
    callbackFailedTitle: "Não foi possível concluir a autenticação",
    callbackFailedDescription:
      "Não foi possível verificar o retorno da autenticação. Volte à tela de login e tente novamente.",
    callbackContinue: "Continuar",
    callbackEmailVerifiedTitle: "E-mail verificado",
    callbackEmailVerifiedDescription:
      "Seu endereço de e-mail foi verificado. Você pode continuar para sua conta.",
    callbackEmailNotVerifiedTitle: "Verifique seu e-mail primeiro",
    callbackEmailNotVerifiedDescription:
      "Confira sua caixa de entrada e use o link de verificação antes de fazer login.",
    callbackExpiredLinkTitle: "Este link expirou",
    callbackExpiredLinkDescription:
      "Solicite um novo link e use a mensagem mais recente em sua caixa de entrada.",
    callbackGenericErrorTitle: "Algo deu errado",
    callbackGenericErrorDescription:
      "Não foi possível concluir esta solicitação. Volte à tela de login e tente novamente.",
    callbackGenericSuccessTitle: "Tudo pronto",
    callbackGenericSuccessDescription: "Autenticação concluída com sucesso.",
    callbackMissingEmailTitle: "Endereço de e-mail indisponível",
    callbackMissingEmailDescription:
      "O provedor não compartilhou seu endereço de e-mail. Tente outro método de login.",
    callbackPasswordResetTitle: "Redefinição de senha",
    callbackPasswordResetDescription:
      "Sua senha foi redefinida. Faça login com sua nova senha.",
    callbackSignupCompleteTitle: "Conta criada",
    callbackSignupCompleteDescription:
      "Sua conta está pronta. Você pode continuar.",
    callbackSignupDisabledTitle: "O cadastro não está disponível",
    callbackSignupDisabledDescription:
      "Não é possível criar contas com este método de entrada. Tente fazer login.",
    callbackViewAccountSettings: "Configurações da conta",
    account: "Conta",
    alreadyHaveAnAccount: "Já tem uma conta?",
    alreadyVerifiedYourEmail: "Já verificou seu e-mail?",
    confirmPassword: "Confirme sua senha",
    confirmPasswordPlaceholder: "Confirme sua senha",
    checkYourEmail: "Verifique seu e-mail para obter um link de verificação",
    checkYourEmailTitle: "Verifique seu e-mail",
    continueWith: "Continue com {{provider}}",
    email: "E-mail",
    emailPlaceholder: "nome@exemplo.com",
    fieldRequired: "Este campo é obrigatório",
    forgotPassword: "Esqueceu sua senha",
    forgotPasswordLink: "Esqueceu sua senha?",
    hidePassword: "Ocultar senha",
    invalidEmail: "Digite um endereço de e-mail válido.",
    invalidResetPasswordToken: "Token de redefinição de senha inválido",
    name: "Nome",
    namePlaceholder: "Nome",
    needToCreateAnAccount: "Precisa criar uma conta?",
    newPassword: "Nova senha",
    newPasswordPlaceholder: "Nova senha",
    openEmailProvider: "Abrir {{provider}}",
    or: "Ou",
    optional: " (opcional)",
    password: "Senha",
    passwordCompromised:
      "Esta senha apareceu em um vazamento de dados. Escolha outra senha.",
    passwordFair: "Regular",
    passwordGood: "Boa",
    passwordPlaceholder: "Senha",
    passwordResetEmailSent: "E-mail de redefinição de senha enviado",
    passwordResetErrorDescription:
      "Não foi possível redefinir sua senha. Tente novamente.",
    passwordResetSuccess: "Senha redefinida com sucesso",
    passwordResetSuccessDescription:
      "Sua senha foi redefinida. Agora você pode fazer login com ela.",
    passwordStrength: "Força da senha",
    passwordStrong: "Forte",
    passwordWeak: "Fraca",
    passwordsDoNotMatch: "As senhas não coincidem",
    rememberMe: "Manter conectado",
    tooLong: "Deve ter no máximo {{max}} caracteres",
    tooShort: "Deve ter pelo menos {{min}} caracteres",
    rememberYourPassword: "Lembra da sua senha?",
    resend: "Reenviar",
    resendIn: "Reenviar em {{seconds}} s",
    resetLinkSentTo: "Enviamos um link de redefinição de senha para {{email}}",
    resetPassword: "Redefinir senha",
    sendResetLink: "Enviar link de redefinição",
    scanToOpenEmailProvider: "Escaneie para abrir {{provider}} no seu celular",
    showPassword: "Mostrar senha",
    signIn: "Entrar",
    signOut: "Sair",
    signUp: "Criar conta",
    verificationEmailSent: "E-mail de verificação enviado!",
    verifyEmail: "Verificar e-mail"
  },
  settings: {
    account: "Conta",
    accountUnlinked: "Conta desvinculada",
    active: "Ativo",
    activeSessions: "Sessões ativas",
    reauthenticationTitle: "Faça login novamente",
    reauthenticationDescription:
      "Faça login novamente para verificar sua identidade antes de continuar.",
    reauthenticationAction: "Faça login novamente",
    avatar: "Avatar",
    currentSession: "Sessão atual",
    avatarChangedSuccess: "Avatar alterado com sucesso",
    avatarDeletedSuccess: "Avatar excluído com sucesso",
    changeAvatar: "Alterar avatar",
    deleteAvatar: "Excluir avatar",
    link: "Vincular",
    linkedAccounts: "Contas vinculadas",
    lastAccountUnlinkingDisabled:
      "Vincule outro método de login antes de desvincular esta conta.",
    linkProvider: "Vincule sua conta {{provider}}",
    cancel: "Cancelar",
    copyToClipboard: "Copiar para a área de transferência",
    copiedToClipboard: "Copiado para a área de transferência",
    changeEmail: "Alterar e-mail",
    changeEmailSuccess: "Verifique seu e-mail para confirmar a alteração",
    changePassword: "Alterar a senha",
    changePasswordSuccess: "Senha alterada com sucesso",
    currentPassword: "Senha atual",
    currentPasswordPlaceholder: "Digite sua senha atual",
    dangerZone: "Zona de perigo",
    delete: "Excluir",
    optional: "Opcional",
    profileUpdatedSuccess: "Perfil atualizado com sucesso",
    revoke: "Revogar",
    revokeSession: "Revogar sessão",
    revokeSessionSuccess: "Sessão revogada com sucesso",
    signOutOtherDevices: "Sair de outros dispositivos",
    signOutOtherDevicesDescription:
      "Você sairá de todos os dispositivos, exceto deste.",
    signOutOtherDevicesSuccess: "Você saiu dos outros dispositivos.",
    signOutEverywhere: "Sair de todos os dispositivos",
    signOutEverywhereDescription:
      "Você sairá deste dispositivo e de todos os outros.",
    saveChanges: "Salvar alterações",
    setPassword: "Definir senha",
    setPasswordDescription:
      "Você ainda não tem uma senha. Solicite um link de redefinição para configurar um.",
    security: "Segurança",
    settings: "Configurações",
    time: "Hora",
    unlinkProvider: "Desvincular {{provider}}",
    updateEmail: "Atualizar e-mail",
    updatePassword: "Atualizar senha",
    uploadAvatar: "Enviar avatar",
    userProfile: "Perfil de usuário"
  }
})

export const ptBR = defineAuthLocale({
  languageTag: "pt-BR",
  direction: "ltr",
  localization: ptBRLocalization,
  plugins: ptBRPlugins
})
