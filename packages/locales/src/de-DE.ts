import { deepmerge, defineAuthLocale, localization } from "@better-auth-ui/core"
import { deDEPlugins } from "./de-DE-plugins"

const deLocalization = deepmerge(localization, {
  auth: {
    callbackAccountLinkedTitle: "Konto verknüpft",
    callbackAccountLinkedDescription: "Dein Konto ist jetzt verbunden.",
    callbackAccountLinkConflictTitle: "Dieses Konto ist bereits verbunden",
    callbackAccountLinkConflictDescription:
      "Das Anbieterkonto gehört zu einem anderen Benutzer oder kann nicht sicher verknüpft werden.",
    callbackCancelledTitle: "Authentifizierung abgebrochen",
    callbackCancelledDescription:
      "Es wurden keine Änderungen vorgenommen. Du kannst es erneut versuchen, wenn du bereit bist.",
    callbackFailedTitle:
      "Die Authentifizierung konnte nicht abgeschlossen werden",
    callbackFailedDescription:
      "Der Rückruf konnte nicht geprüft werden. Kehre zur Anmeldung zurück und versuche es erneut.",
    callbackContinue: "Weiter",
    callbackEmailVerifiedTitle: "E-Mail-Adresse bestätigt",
    callbackEmailVerifiedDescription:
      "Deine E-Mail-Adresse ist bestätigt. Du kannst mit deinem Konto fortfahren.",
    callbackEmailNotVerifiedTitle: "Bestätige zuerst deine E-Mail-Adresse",
    callbackEmailNotVerifiedDescription:
      "Prüfe vor der Anmeldung deinen Posteingang auf einen Bestätigungslink.",
    callbackExpiredLinkTitle: "Dieser Link ist abgelaufen",
    callbackExpiredLinkDescription:
      "Fordere einen neuen Link an und verwende die neueste Nachricht in deinem Posteingang.",
    callbackGenericErrorTitle: "Etwas ist schiefgelaufen",
    callbackGenericErrorDescription:
      "Die Anfrage konnte nicht abgeschlossen werden. Kehre zur Anmeldung zurück und versuche es erneut.",
    callbackGenericSuccessTitle: "Alles erledigt",
    callbackGenericSuccessDescription:
      "Die Authentifizierung wurde erfolgreich abgeschlossen.",
    callbackMissingEmailTitle: "E-Mail-Adresse nicht verfügbar",
    callbackMissingEmailDescription:
      "Der Anbieter hat keine E-Mail-Adresse übermittelt. Versuche eine andere Anmeldemethode.",
    callbackPasswordResetTitle: "Passwort zurückgesetzt",
    callbackPasswordResetDescription:
      "Dein Passwort wurde zurückgesetzt. Melde dich mit deinem neuen Passwort an.",
    callbackSignupCompleteTitle: "Konto erstellt",
    callbackSignupCompleteDescription:
      "Dein Konto ist bereit. Du kannst fortfahren.",
    callbackSignupDisabledTitle: "Registrierung nicht verfügbar",
    callbackSignupDisabledDescription:
      "Mit dieser Anmeldemethode können keine neuen Konten erstellt werden. Versuche stattdessen, dich anzumelden.",
    callbackViewAccountSettings: "Kontoeinstellungen",
    account: "Konto",
    alreadyHaveAnAccount: "Du hast bereits ein Konto?",
    alreadyVerifiedYourEmail: "E-Mail-Adresse bereits bestätigt?",
    confirmPassword: "Passwort bestätigen",
    confirmPasswordPlaceholder: "Bestätige dein Passwort",
    checkYourEmail: "Prüfe deine E-Mails auf einen Bestätigungslink",
    checkYourEmailTitle: "Prüfe deine E-Mails",
    continueWith: "Mit {{provider}} fortfahren",
    email: "E-Mail-Adresse",
    emailPlaceholder: "name@beispiel.de",
    fieldRequired: "Dieses Feld ist erforderlich",
    forgotPassword: "Passwort vergessen",
    forgotPasswordLink: "Passwort vergessen?",
    hidePassword: "Passwort ausblenden",
    invalidEmail: "Gib eine gültige E-Mail-Adresse ein",
    invalidResetPasswordToken:
      "Ungültiger Token zum Zurücksetzen des Passworts",
    name: "Name",
    namePlaceholder: "Name",
    needToCreateAnAccount: "Du benötigst ein Konto?",
    newPassword: "Neues Passwort",
    newPasswordPlaceholder: "Neues Passwort",
    openEmailProvider: "{{provider}} öffnen",
    or: "ODER",
    optional: " (optional)",
    password: "Passwort",
    passwordCompromised:
      "Dieses Passwort ist in einem Datenleck aufgetaucht. Wähle ein anderes Passwort.",
    passwordFair: "Mittel",
    passwordGood: "Gut",
    passwordPlaceholder: "Passwort",
    passwordResetEmailSent: "E-Mail zum Zurücksetzen des Passworts gesendet",
    passwordResetErrorDescription:
      "Dein Passwort konnte nicht zurückgesetzt werden. Versuche es erneut.",
    passwordResetSuccess: "Passwort erfolgreich zurückgesetzt",
    passwordResetSuccessDescription:
      "Das Passwort wurde erfolgreich zurückgesetzt. Du kannst dich mit deinem neuen Passwort anmelden.",
    passwordStrength: "Passwortstärke",
    passwordStrong: "Stark",
    passwordWeak: "Schwach",
    passwordsDoNotMatch: "Die Passwörter stimmen nicht überein",
    rememberMe: "Angemeldet bleiben",
    tooLong: "Darf höchstens {{max}} Zeichen lang sein",
    tooShort: "Muss mindestens {{min}} Zeichen lang sein",
    rememberYourPassword: "Du kennst dein Passwort wieder?",
    resend: "Erneut senden",
    resendIn: "In {{seconds}} s erneut senden",
    resetLinkSentTo:
      "Wir haben einen Link zum Zurücksetzen des Passworts an {{email}} gesendet",
    resetPassword: "Passwort zurücksetzen",
    sendResetLink: "Link zum Zurücksetzen senden",
    scanToOpenEmailProvider:
      "Scanne den Code, um {{provider}} auf deinem Mobiltelefon zu öffnen",
    showPassword: "Passwort anzeigen",
    signIn: "Anmelden",
    signOut: "Abmelden",
    signUp: "Registrieren",
    verificationEmailSent: "Bestätigungs-E-Mail gesendet!",
    verifyEmail: "E-Mail-Adresse bestätigen"
  },
  settings: {
    account: "Konto",
    accountUnlinked: "Kontoverknüpfung aufgehoben",
    active: "Aktiv",
    activeSessions: "Aktive Sitzungen",
    freshSessionTitle: "Bestätige deine Identität",
    freshSessionDescription:
      "Gib dein Passwort erneut ein, um diese sensible Einstellung zu verwalten.",
    freshSessionSubmit: "Bestätigen und fortfahren",
    freshSessionSignIn: "Erneut anmelden",
    freshSessionSuccess: "Deine Identität wurde bestätigt.",
    avatar: "Profilbild",
    currentSession: "Aktuelle Sitzung",
    avatarChangedSuccess: "Profilbild erfolgreich geändert",
    avatarDeletedSuccess: "Profilbild erfolgreich gelöscht",
    changeAvatar: "Profilbild ändern",
    deleteAvatar: "Profilbild löschen",
    link: "Verknüpfen",
    linkedAccounts: "Verknüpfte Konten",
    linkProvider: "{{provider}}-Konto verknüpfen",
    cancel: "Abbrechen",
    copyToClipboard: "In die Zwischenablage kopieren",
    copiedToClipboard: "In die Zwischenablage kopiert",
    changeEmail: "E-Mail-Adresse ändern",
    changeEmailSuccess: "Prüfe deine E-Mails, um die Änderung zu bestätigen",
    changePassword: "Passwort ändern",
    changePasswordSuccess: "Passwort erfolgreich geändert",
    currentPassword: "Aktuelles Passwort",
    currentPasswordPlaceholder: "Gib dein aktuelles Passwort ein",
    dangerZone: "Gefahrenbereich",
    delete: "Löschen",
    optional: "Optional",
    profileUpdatedSuccess: "Profil erfolgreich aktualisiert",
    revoke: "Widerrufen",
    revokeSession: "Sitzung widerrufen",
    revokeSessionSuccess: "Sitzung erfolgreich widerrufen",
    signOutOtherDevices: "Von anderen Geräten abmelden",
    signOutOtherDevicesDescription:
      "Du wirst auf allen Geräten außer diesem abgemeldet.",
    signOutOtherDevicesSuccess: "Andere Geräte wurden erfolgreich abgemeldet",
    signOutEverywhere: "Überall abmelden",
    signOutEverywhereDescription:
      "Du wirst auf diesem und allen anderen Geräten abgemeldet.",
    saveChanges: "Änderungen speichern",
    setPassword: "Passwort festlegen",
    setPasswordDescription:
      "Du hast noch kein Passwort. Fordere einen Link zum Zurücksetzen an, um ein Passwort festzulegen.",
    security: "Sicherheit",
    settings: "Einstellungen",
    time: "Zeit",
    unlinkProvider: "Verknüpfung mit {{provider}} aufheben",
    updateEmail: "E-Mail-Adresse aktualisieren",
    updatePassword: "Passwort aktualisieren",
    uploadAvatar: "Profilbild hochladen",
    userProfile: "Benutzerprofil"
  }
})

export const deDE = defineAuthLocale({
  languageTag: "de-DE",
  direction: "ltr",
  localization: deLocalization,
  plugins: deDEPlugins
})
