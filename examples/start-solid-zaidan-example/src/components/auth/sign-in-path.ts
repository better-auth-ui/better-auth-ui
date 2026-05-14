import type { SocialProvider } from "better-auth/social-providers"

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export type SignInPathInput = {
  identifier: string
  usernameAuth: boolean
}

export type SignInPath =
  | { kind: "email"; email: string }
  | { kind: "username"; username: string }

export type SubmittedSignInInput = {
  formData: FormData
  usernameAuth: boolean
}

export type SubmittedSignIn = {
  password: string
  signInPath: SignInPath
}

export type SocialAuthView = "signIn" | "signUp"

export type SocialAuthURLInput = {
  basePaths: { auth: string }
  baseURL: string
  redirectTo: string
  view: SocialAuthView
  viewPaths: { auth: { signIn: string; signUp: string } }
}

export type SocialAuthURLs = {
  callbackURL: string
  errorCallbackURL: string
  newUserCallbackURL?: string
}

export type SocialAuthParamsInput = SocialAuthURLInput & {
  provider: SocialProvider
}

export type SocialAuthParams = SocialAuthURLs & {
  provider: SocialProvider
}

const getFormValue = (formData: FormData, name: string) => {
  const value = formData.get(name)

  return typeof value === "string" ? value : ""
}

export function resolveSignInPath({
  identifier,
  usernameAuth
}: SignInPathInput): SignInPath {
  const normalizedIdentifier = identifier.trim()

  if (usernameAuth && !emailPattern.test(normalizedIdentifier)) {
    return { kind: "username", username: normalizedIdentifier }
  }

  return { kind: "email", email: normalizedIdentifier }
}

export function resolveSubmittedSignIn({
  formData,
  usernameAuth
}: SubmittedSignInInput): SubmittedSignIn {
  const identifier = usernameAuth
    ? getFormValue(formData, "username")
    : getFormValue(formData, "email")

  return {
    password: getFormValue(formData, "password"),
    signInPath: resolveSignInPath({ identifier, usernameAuth })
  }
}

export function resolveSocialAuthURLs({
  basePaths,
  baseURL,
  redirectTo,
  view,
  viewPaths
}: SocialAuthURLInput): SocialAuthURLs {
  const authViewPath =
    view === "signUp" ? viewPaths.auth.signUp : viewPaths.auth.signIn
  const urls: SocialAuthURLs = {
    callbackURL: `${baseURL}${redirectTo}`,
    errorCallbackURL: `${baseURL}${basePaths.auth}/${authViewPath}`
  }

  if (view === "signUp") {
    urls.newUserCallbackURL = `${baseURL}${redirectTo}`
  }

  return urls
}

export function resolveSocialAuthParams({
  provider,
  ...input
}: SocialAuthParamsInput): SocialAuthParams {
  return {
    provider,
    ...resolveSocialAuthURLs(input)
  }
}
