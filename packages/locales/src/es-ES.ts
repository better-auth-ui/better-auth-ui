import { deepmerge, defineAuthLocale, localization } from "@better-auth-ui/core"
import { esESPlugins } from "./es-ES-plugins"

const esLocalization = deepmerge(localization, {
  auth: {
    callbackAccountLinkedTitle: "Cuenta vinculada",
    callbackAccountLinkedDescription: "Tu cuenta ahora está conectada.",
    callbackAccountLinkConflictTitle: "Esta cuenta ya está vinculada",
    callbackAccountLinkConflictDescription:
      "La cuenta del proveedor pertenece a otro usuario o no se puede vincular de forma segura.",
    callbackCancelledTitle: "Autenticación cancelada",
    callbackCancelledDescription:
      "No se realizó ningún cambio. Puedes volver a intentarlo cuando quieras.",
    callbackFailedTitle: "No se pudo completar la autenticación",
    callbackFailedDescription:
      "No se pudo verificar la respuesta. Vuelve a la pantalla de inicio de sesión e inténtalo de nuevo.",
    callbackContinue: "Continuar",
    callbackEmailVerifiedTitle: "Correo electrónico verificado",
    callbackEmailVerifiedDescription:
      "Tu correo electrónico está verificado. Puedes continuar con tu cuenta.",
    callbackEmailNotVerifiedTitle: "Verifica primero tu correo electrónico",
    callbackEmailNotVerifiedDescription:
      "Antes de iniciar sesión, revisa tu bandeja de entrada en busca de un enlace de verificación.",
    callbackExpiredLinkTitle: "Este enlace ha caducado",
    callbackExpiredLinkDescription:
      "Solicita un nuevo enlace y usa el mensaje más reciente de tu bandeja de entrada.",
    callbackGenericErrorTitle: "Algo salió mal",
    callbackGenericErrorDescription:
      "No se pudo completar la solicitud. Vuelve a la pantalla de inicio de sesión e inténtalo de nuevo.",
    callbackGenericSuccessTitle: "Todo listo",
    callbackGenericSuccessDescription:
      "La autenticación se completó correctamente.",
    callbackMissingEmailTitle: "Correo electrónico no disponible",
    callbackMissingEmailDescription:
      "El proveedor no proporcionó un correo electrónico. Prueba con otro método de inicio de sesión.",
    callbackPasswordResetTitle: "Contraseña restablecida",
    callbackPasswordResetDescription:
      "Tu contraseña ha sido restablecida. Inicia sesión con tu nueva contraseña.",
    callbackSignupCompleteTitle: "Cuenta creada",
    callbackSignupCompleteDescription:
      "Tu cuenta está lista. Puedes continuar.",
    callbackSignupDisabledTitle: "Registro no disponible",
    callbackSignupDisabledDescription:
      "No se pueden crear cuentas nuevas con este método de inicio de sesión. Prueba a iniciar sesión en su lugar.",
    callbackViewAccountSettings: "Ajustes de la cuenta",
    account: "Cuenta",
    alreadyHaveAnAccount: "¿Ya tienes una cuenta?",
    alreadyVerifiedYourEmail: "¿Ya verificaste tu correo electrónico?",
    confirmPassword: "Confirmar contraseña",
    confirmPasswordPlaceholder: "Confirma tu contraseña",
    checkYourEmail:
      "Revisa tu correo electrónico para ver el enlace de verificación",
    checkYourEmailTitle: "Revisa tu correo electrónico",
    continueWith: "Continuar con {{provider}}",
    email: "Correo electrónico",
    emailPlaceholder: "nombre@ejemplo.com",
    fieldRequired: "Este campo es obligatorio",
    forgotPassword: "Olvidé mi contraseña",
    forgotPasswordLink: "¿Olvidaste tu contraseña?",
    hidePassword: "Ocultar contraseña",
    invalidEmail: "Introduce un correo electrónico válido",
    invalidResetPasswordToken:
      "Token de restablecimiento de contraseña no válido",
    name: "Nombre",
    namePlaceholder: "Nombre",
    needToCreateAnAccount: "¿Necesitas crear una cuenta?",
    newPassword: "Nueva contraseña",
    newPasswordPlaceholder: "Nueva contraseña",
    openEmailProvider: "Abrir {{provider}}",
    or: "O",
    optional: " (opcional)",
    password: "Contraseña",
    passwordCompromised:
      "Esta contraseña ha aparecido en una filtración de datos. Elige otra contraseña.",
    passwordFair: "Aceptable",
    passwordGood: "Buena",
    passwordPlaceholder: "Contraseña",
    passwordResetEmailSent: "Correo de restablecimiento de contraseña enviado",
    passwordResetErrorDescription:
      "No se pudo restablecer tu contraseña. Inténtalo de nuevo.",
    passwordResetSuccess: "Contraseña restablecida correctamente",
    passwordResetSuccessDescription:
      "La contraseña se restableció correctamente. Ya puedes iniciar sesión con tu nueva contraseña.",
    passwordStrength: "Seguridad de la contraseña",
    passwordStrong: "Fuerte",
    passwordWeak: "Débil",
    passwordsDoNotMatch: "Las contraseñas no coinciden",
    rememberMe: "Mantener sesión iniciada",
    tooLong: "No puede tener más de {{max}} caracteres",
    tooShort: "Debe tener al menos {{min}} caracteres",
    rememberYourPassword: "¿Recordaste tu contraseña?",
    resend: "Reenviar",
    resendIn: "Reenviar en {{seconds}} s",
    resetLinkSentTo:
      "Hemos enviado un enlace de restablecimiento de contraseña a {{email}}",
    resetPassword: "Restablecer contraseña",
    sendResetLink: "Enviar enlace de restablecimiento",
    scanToOpenEmailProvider:
      "Escanea el código para abrir {{provider}} en tu teléfono",
    showPassword: "Mostrar contraseña",
    signIn: "Iniciar sesión",
    signOut: "Cerrar sesión",
    signUp: "Registrarse",
    verificationEmailSent: "¡Correo de verificación enviado!",
    verifyEmail: "Verificar correo electrónico"
  },
  settings: {
    account: "Cuenta",
    accountUnlinked: "Vinculación de cuenta eliminada",
    active: "Activo",
    activeSessions: "Sesiones activas",
    freshSessionTitle: "Confirma tu identidad",
    freshSessionDescription:
      "Vuelve a introducir tu contraseña para gestionar este ajuste sensible.",
    freshSessionSubmit: "Confirmar y continuar",
    freshSessionSignIn: "Iniciar sesión de nuevo",
    freshSessionSuccess: "Tu identidad ha sido confirmada.",
    avatar: "Avatar",
    currentSession: "Sesión actual",
    avatarChangedSuccess: "Avatar cambiado correctamente",
    avatarDeletedSuccess: "Avatar eliminado correctamente",
    changeAvatar: "Cambiar avatar",
    deleteAvatar: "Eliminar avatar",
    link: "Vincular",
    linkedAccounts: "Cuentas vinculadas",
    lastAccountUnlinkingDisabled:
      "Vincula otro método de inicio de sesión antes de desvincular esta cuenta.",
    linkProvider: "Vincular cuenta de {{provider}}",
    cancel: "Cancelar",
    copyToClipboard: "Copiar al portapapeles",
    copiedToClipboard: "Copiado al portapapeles",
    changeEmail: "Cambiar correo electrónico",
    changeEmailSuccess: "Revisa tu correo electrónico para confirmar el cambio",
    changePassword: "Cambiar contraseña",
    changePasswordSuccess: "Contraseña cambiada correctamente",
    currentPassword: "Contraseña actual",
    currentPasswordPlaceholder: "Introduce tu contraseña actual",
    dangerZone: "Zona de peligro",
    delete: "Eliminar",
    optional: "Opcional",
    profileUpdatedSuccess: "Perfil actualizado correctamente",
    revoke: "Revocar",
    revokeSession: "Revocar sesión",
    revokeSessionSuccess: "Sesión revocada correctamente",
    signOutOtherDevices: "Cerrar sesión en otros dispositivos",
    signOutOtherDevicesDescription:
      "Se cerrará tu sesión en todos los dispositivos excepto en este.",
    signOutOtherDevicesSuccess:
      "Se cerró correctamente la sesión en otros dispositivos",
    signOutEverywhere: "Cerrar sesión en todas partes",
    signOutEverywhereDescription:
      "Se cerrará tu sesión en este dispositivo y en todos los demás.",
    saveChanges: "Guardar cambios",
    setPassword: "Establecer contraseña",
    setPasswordDescription:
      "Todavía no tienes una contraseña. Solicita un enlace de restablecimiento para establecer una.",
    security: "Seguridad",
    settings: "Ajustes",
    time: "Hora",
    unlinkProvider: "Desvincular {{provider}}",
    updateEmail: "Actualizar correo electrónico",
    updatePassword: "Actualizar contraseña",
    uploadAvatar: "Subir avatar",
    userProfile: "Perfil de usuario"
  }
})

export const esES = defineAuthLocale({
  languageTag: "es-ES",
  direction: "ltr",
  localization: esLocalization,
  plugins: esESPlugins
})
