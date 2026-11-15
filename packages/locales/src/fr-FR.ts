import { deepmerge, defineAuthLocale, localization } from "@better-auth-ui/core"
import { frFRPlugins } from "./fr-FR-plugins"

const frFRLocalization = deepmerge(localization, {
  errors: {
    generic: "Une erreur s’est produite. Veuillez réessayer.",
    sessionExpired: "Reconnectez-vous pour continuer.",
    permissionDenied:
      "Vous n’avez pas l’autorisation d’effectuer cette action.",
    rateLimited: "Trop de tentatives. Patientez un instant, puis réessayez.",
    popupBlocked:
      "Autorisez les fenêtres pop-up dans votre navigateur, puis essayez de vous reconnecter.",
    popupTimeout: "La connexion a expiré. Veuillez réessayer.",
    passkeyFailed:
      "Impossible de vous connecter avec votre clé d’accès. Réessayez ou utilisez une autre méthode de connexion.",
    walletFailed:
      "Impossible de finaliser la demande au portefeuille. Vérifiez votre portefeuille, puis réessayez.",
    copyFailed: "Impossible de copier. Réessayez.",
    imageUploadFailed:
      "Impossible d’importer cette image. Essayez avec une autre image.",
    imageDeleteFailed: "Impossible de supprimer l’image. Veuillez réessayer.",
    roleHasMembers:
      "Attribuez un autre rôle aux membres avant de supprimer ce rôle."
  },
  auth: {
    callbackAccountLinkedTitle: "Compte associé",
    callbackAccountLinkedDescription: "Votre compte est maintenant connecté.",
    callbackAccountLinkConflictTitle: "Ce compte est déjà connecté",
    callbackAccountLinkConflictDescription:
      "Le compte du fournisseur appartient à un autre utilisateur ou ne peut pas être associé en toute sécurité.",
    callbackCancelledTitle: "Authentification annulée",
    callbackCancelledDescription:
      "Aucune modification n’a été effectuée. Vous pouvez réessayer quand vous voulez.",
    callbackFailedTitle: "Impossible de finaliser l’authentification",
    callbackFailedDescription:
      "Le retour d’authentification n’a pas pu être vérifié. Revenez à la connexion et réessayez.",
    callbackContinue: "Continuer",
    callbackEmailVerifiedTitle: "Adresse e-mail vérifiée",
    callbackEmailVerifiedDescription:
      "Votre adresse e-mail est vérifiée. Vous pouvez accéder à votre compte.",
    callbackEmailNotVerifiedTitle: "Vérifiez d’abord votre adresse e-mail",
    callbackEmailNotVerifiedDescription:
      "Avant de vous connecter, cherchez le lien de vérification dans votre boîte de réception.",
    callbackExpiredLinkTitle: "Ce lien a expiré",
    callbackExpiredLinkDescription:
      "Demandez un nouveau lien et utilisez le message le plus récent de votre boîte de réception.",
    callbackGenericErrorTitle: "Une erreur s’est produite",
    callbackGenericErrorDescription:
      "Impossible de finaliser cette demande. Revenez à la connexion et réessayez.",
    callbackGenericSuccessTitle: "C’est fait",
    callbackGenericSuccessDescription: "Authentification réussie.",
    callbackMissingEmailTitle: "Adresse e-mail indisponible",
    callbackMissingEmailDescription:
      "Le fournisseur n’a pas communiqué d’adresse e-mail. Essayez une autre méthode de connexion.",
    callbackPasswordResetTitle: "Mot de passe réinitialisé",
    callbackPasswordResetDescription:
      "Votre mot de passe a été réinitialisé. Connectez-vous avec votre nouveau mot de passe.",
    callbackSignupCompleteTitle: "Compte créé",
    callbackSignupCompleteDescription:
      "Votre compte est prêt. Vous pouvez continuer.",
    callbackSignupDisabledTitle: "Inscription indisponible",
    callbackSignupDisabledDescription:
      "Cette méthode de connexion ne permet pas de créer de compte. Essayez plutôt de vous connecter.",
    callbackViewAccountSettings: "Paramètres du compte",
    account: "Compte",
    alreadyHaveAnAccount: "Vous avez déjà un compte ?",
    alreadyVerifiedYourEmail: "Vous avez déjà vérifié votre adresse e-mail ?",
    confirmPassword: "Confirmer le mot de passe",
    confirmPasswordPlaceholder: "Confirmez votre mot de passe",
    checkYourEmail:
      "Consultez vos e-mails : un lien de vérification vous attend",
    checkYourEmailTitle: "Consultez vos e-mails",
    continueWith: "Continuer avec {{provider}}",
    email: "E-mail",
    emailPlaceholder: "nom@exemple.fr",
    fieldRequired: "Ce champ est obligatoire",
    forgotPassword: "Mot de passe oublié",
    forgotPasswordLink: "Mot de passe oublié ?",
    hidePassword: "Masquer le mot de passe",
    invalidEmail: "Saisissez une adresse e-mail valide",
    invalidResetPasswordToken:
      "Jeton de réinitialisation du mot de passe non valide",
    name: "Nom",
    namePlaceholder: "Nom",
    needToCreateAnAccount: "Vous n’avez pas encore de compte ?",
    newPassword: "Nouveau mot de passe",
    newPasswordPlaceholder: "Nouveau mot de passe",
    openEmailProvider: "Ouvrir {{provider}}",
    or: "OU",
    optional: " (facultatif)",
    password: "Mot de passe",
    passwordCompromised:
      "Ce mot de passe figure dans une fuite de données. Choisissez-en un autre.",
    passwordFair: "Moyen",
    passwordGood: "Bon",
    passwordPlaceholder: "Mot de passe",
    passwordResetEmailSent: "E-mail de réinitialisation du mot de passe envoyé",
    passwordResetErrorDescription:
      "Impossible de réinitialiser votre mot de passe. Réessayez.",
    passwordResetSuccess: "Mot de passe réinitialisé",
    passwordResetSuccessDescription:
      "Votre mot de passe a été réinitialisé. Vous pouvez vous connecter avec votre nouveau mot de passe.",
    passwordStrength: "Robustesse du mot de passe",
    passwordStrong: "Fort",
    passwordWeak: "Faible",
    passwordsDoNotMatch: "Les mots de passe ne correspondent pas",
    rememberMe: "Rester connecté",
    tooLong: "{{max}} caractères maximum",
    tooShort: "{{min}} caractères minimum",
    rememberYourPassword: "Vous vous souvenez de votre mot de passe ?",
    resend: "Renvoyer",
    resendIn: "Renvoyer dans {{seconds}} s",
    resetLinkSentTo:
      "Nous avons envoyé un lien de réinitialisation du mot de passe à {{email}}",
    resetPassword: "Réinitialiser le mot de passe",
    sendResetLink: "Envoyer le lien de réinitialisation",
    scanToOpenEmailProvider:
      "Scannez pour ouvrir {{provider}} sur votre téléphone",
    showPassword: "Afficher le mot de passe",
    signIn: "Se connecter",
    signOut: "Se déconnecter",
    signUp: "S’inscrire",
    verificationEmailSent: "E-mail de vérification envoyé !",
    verifyEmail: "Vérifier l’adresse e-mail"
  },
  settings: {
    account: "Compte",
    accountUnlinked: "Compte dissocié",
    active: "Active",
    activeSessions: "Sessions actives",
    reauthenticationTitle: "Reconnectez-vous",
    reauthenticationDescription:
      "Reconnectez-vous pour confirmer votre identité avant de continuer.",
    reauthenticationAction: "Se reconnecter",
    avatar: "Avatar",
    currentSession: "Session en cours",
    avatarChangedSuccess: "Avatar modifié",
    avatarDeletedSuccess: "Avatar supprimé",
    changeAvatar: "Changer d’avatar",
    deleteAvatar: "Supprimer l’avatar",
    link: "Associer",
    linkedAccounts: "Comptes associés",
    lastAccountUnlinkingDisabled:
      "Associez une autre méthode de connexion avant de dissocier ce compte.",
    linkProvider: "Associer votre compte {{provider}}",
    cancel: "Annuler",
    copyToClipboard: "Copier dans le presse-papiers",
    copiedToClipboard: "Copié dans le presse-papiers",
    changeEmail: "Changer d’adresse e-mail",
    changeEmailSuccess: "Consultez vos e-mails pour confirmer la modification",
    changePassword: "Changer de mot de passe",
    changePasswordSuccess: "Mot de passe modifié",
    currentPassword: "Mot de passe actuel",
    currentPasswordPlaceholder: "Saisissez votre mot de passe actuel",
    dangerZone: "Zone de danger",
    delete: "Supprimer",
    optional: "Facultatif",
    profileUpdatedSuccess: "Profil mis à jour",
    revoke: "Révoquer",
    revokeSession: "Révoquer la session",
    revokeSessionSuccess: "Session révoquée",
    signOutOtherDevices: "Déconnecter les autres appareils",
    signOutOtherDevicesDescription:
      "Vous serez déconnecté de tous vos appareils, sauf celui-ci.",
    signOutOtherDevicesSuccess: "Les autres appareils ont été déconnectés",
    signOutEverywhere: "Se déconnecter partout",
    signOutEverywhereDescription:
      "Vous serez déconnecté de cet appareil et de tous les autres.",
    saveChanges: "Enregistrer les modifications",
    setPassword: "Définir un mot de passe",
    setPasswordDescription:
      "Vous n’avez pas encore de mot de passe. Demandez un e-mail de réinitialisation pour en définir un.",
    security: "Sécurité",
    settings: "Paramètres",
    time: "Heure",
    unlinkProvider: "Dissocier {{provider}}",
    updateEmail: "Modifier l’adresse e-mail",
    updatePassword: "Modifier le mot de passe",
    uploadAvatar: "Importer un avatar",
    userProfile: "Profil utilisateur"
  }
})

export const frFR = defineAuthLocale({
  languageTag: "fr-FR",
  direction: "ltr",
  localization: frFRLocalization,
  plugins: frFRPlugins
})
