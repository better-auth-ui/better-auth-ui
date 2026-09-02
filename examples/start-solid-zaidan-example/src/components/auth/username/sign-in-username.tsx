import { authQueryKeys } from "@better-auth-ui/core"
import {
  isPasskeyAutoFillEnabled,
  withPasskeyAutoFill
} from "@better-auth-ui/core/plugins/passkey"
import type { UsernameAuthClient } from "@better-auth-ui/core/plugins/username"
import {
  type UsernameLocalization,
  usernameLocalization
} from "@better-auth-ui/core/plugins/username"
import {
  AuthLink,
  type AuthPlugin,
  AuthPrompts,
  useAuth,
  useFetchOptions,
  useSignInEmail
} from "@better-auth-ui/solid"
import { useSignInUsername } from "@better-auth-ui/solid/plugins/username"
import { useQueryClient } from "@tanstack/solid-query"
import type { BetterFetchError } from "better-auth/client"
import { Eye, EyeOff } from "lucide-solid"
import { type Component, createSignal, For, Show } from "solid-js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useSignInContinuation } from "@/lib/auth/use-sign-in-continuation"
import { cn } from "@/lib/utils"
import { createAuthForm, isAuthFormFieldInvalid } from "../auth-form"
import { LastUsedBadge } from "../last-login-method/last-used-badge"
import type { SocialLayout } from "../provider-buttons"
import { ProviderButtons } from "../provider-buttons"
import { resolveSubmittedSignIn } from "../sign-in-path"

export type SignInUsernameProps = {
  class?: string
  socialLayout?: SocialLayout
  socialPosition?: "top" | "bottom"
}

type AuthButtonComponent = Component<{ view?: string }>

type AuthPluginWithButtons = {
  authButtons?: AuthButtonComponent[]
  id: string
}

export function SignInUsername(props: SignInUsernameProps) {
  const auth = useAuth<UsernameAuthClient>()
  const { fetchOptions, resetFetchOptions } = useFetchOptions()
  const queryClient = useQueryClient()
  const [isPasswordVisible, setIsPasswordVisible] = createSignal(false)
  const continueSignIn = useSignInContinuation()
  const onSignInSuccess = (data: unknown) => {
    queryClient.invalidateQueries({ queryKey: authQueryKeys.session })
    continueSignIn(data)
  }
  const signIn = useSignInEmail(auth.authClient, () => ({
    onError: (error, variables) => {
      if ((error as BetterFetchError).error?.code === "EMAIL_NOT_VERIFIED") {
        sessionStorage.setItem("better-auth-ui.verify-email", variables.email)
        auth.navigate({
          to: `${auth.basePaths.auth}/${auth.viewPaths.auth.verifyEmail}`
        })
      }

      resetFetchOptions()
    },
    onSuccess: onSignInSuccess
  }))
  const signInUsername = useSignInUsername(auth.authClient, () => ({
    onError: () => {
      resetFetchOptions()
    },
    onSuccess: onSignInSuccess
  }))
  const usernamePlugin = auth.plugins.find((plugin) => plugin.id === "username")
  const usernameAuth = Boolean(usernamePlugin)
  const usernameLabels: UsernameLocalization = {
    ...usernameLocalization,
    ...(usernamePlugin?.localization as
      | Partial<UsernameLocalization>
      | undefined)
  }
  const captchaComponent = () =>
    (auth.plugins as AuthPlugin[]).find((plugin) => plugin.captchaComponent)
      ?.captchaComponent
  const passkeyAutoFill = isPasskeyAutoFillEnabled(auth.plugins)
  const socialPosition = () => props.socialPosition ?? "bottom"
  const showSeparator = () =>
    Boolean(auth.emailAndPassword?.enabled && auth.socialProviders?.length)

  const form = createAuthForm(() => ({
    defaultValues: { identifier: "", password: "" },
    onSubmit: async ({ value }) => {
      const formData = new FormData()
      formData.set(usernameAuth ? "username" : "email", value.identifier)
      formData.set("password", value.password)
      const { password: submittedPassword, signInPath } =
        resolveSubmittedSignIn({
          formData,
          usernameAuth
        })
      if (signInPath.kind === "username") {
        await signInUsername.mutateAsync({
          fetchOptions: fetchOptions(),
          password: submittedPassword,
          username: signInPath.username
        })
        return
      }
      await signIn.mutateAsync({
        email: signInPath.email,
        fetchOptions: fetchOptions(),
        password: submittedPassword
      })
    }
  }))

  return (
    <Card class={cn("w-full max-w-sm", props.class)}>
      <AuthPrompts view="signIn" />
      <CardHeader>
        <CardTitle class="text-xl font-semibold">
          {auth.localization.auth.signIn}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Show when={socialPosition() === "top"}>
          <Show when={auth.socialProviders?.length}>
            <ProviderButtons socialLayout={props.socialLayout} view="signIn" />
          </Show>
          <Show when={showSeparator()}>
            <div class="my-4 text-center text-muted-foreground text-xs">
              {auth.localization.auth.or}
            </div>
          </Show>
        </Show>

        <form.AppForm>
          <form.AuthFormRoot aria-label="Sign in">
            <div class="flex flex-col gap-6">
              <form.AppField
                name="identifier"
                validators={{
                  onChange: ({ value }) =>
                    value.trim()
                      ? undefined
                      : auth.localization.auth.fieldRequired
                }}
              >
                {(field) => (
                  <Field
                    data-invalid={isAuthFormFieldInvalid(field().state.meta)}
                  >
                    <FieldLabel for="sign-in-email">
                      {usernameAuth
                        ? usernameLabels.username
                        : auth.localization.auth.email}
                    </FieldLabel>
                    <Input
                      aria-invalid={isAuthFormFieldInvalid(field().state.meta)}
                      autocomplete={withPasskeyAutoFill(
                        usernameAuth ? "username" : "email",
                        passkeyAutoFill
                      )}
                      id="sign-in-email"
                      name={field().name}
                      onBlur={field().handleBlur}
                      onInput={(event) =>
                        field().handleChange(event.currentTarget.value)
                      }
                      placeholder={
                        usernameAuth
                          ? usernameLabels.usernameOrEmailPlaceholder
                          : auth.localization.auth.emailPlaceholder
                      }
                      type={usernameAuth ? "text" : "email"}
                      value={field().state.value}
                    />
                    <field.AuthFormFieldError />
                  </Field>
                )}
              </form.AppField>

              <form.AppField
                name="password"
                validators={{
                  onChange: ({ value }) =>
                    value ? undefined : auth.localization.auth.fieldRequired
                }}
              >
                {(field) => (
                  <Field
                    data-invalid={isAuthFormFieldInvalid(field().state.meta)}
                  >
                    <FieldLabel for="sign-in-password">
                      {auth.localization.auth.password}
                    </FieldLabel>
                    <div class="relative">
                      <Input
                        aria-invalid={isAuthFormFieldInvalid(
                          field().state.meta
                        )}
                        autocomplete={withPasskeyAutoFill(
                          "current-password",
                          passkeyAutoFill
                        )}
                        class="pr-12"
                        id="sign-in-password"
                        maxLength={auth.emailAndPassword.maxPasswordLength}
                        minLength={auth.emailAndPassword.minPasswordLength}
                        name={field().name}
                        onBlur={field().handleBlur}
                        onInput={(event) =>
                          field().handleChange(event.currentTarget.value)
                        }
                        placeholder={auth.localization.auth.passwordPlaceholder}
                        type={isPasswordVisible() ? "text" : "password"}
                        value={field().state.value}
                      />

                      <Button
                        aria-label={
                          isPasswordVisible()
                            ? auth.localization.auth.hidePassword
                            : auth.localization.auth.showPassword
                        }
                        class="absolute right-1 top-1/2 -translate-y-1/2"
                        onClick={() =>
                          setIsPasswordVisible((visible) => !visible)
                        }
                        size="icon-sm"
                        title={
                          isPasswordVisible()
                            ? auth.localization.auth.hidePassword
                            : auth.localization.auth.showPassword
                        }
                        type="button"
                        variant="ghost"
                      >
                        {isPasswordVisible() ? (
                          <EyeOff aria-hidden class="size-4" />
                        ) : (
                          <Eye aria-hidden class="size-4" />
                        )}
                      </Button>
                    </div>

                    <field.AuthFormFieldError />
                  </Field>
                )}
              </form.AppField>

              <Show when={captchaComponent()} keyed>
                {(Captcha) => <Captcha />}
              </Show>

              <form.AuthFormSubmitButton
                class="relative overflow-visible"
                disabled={signIn.isPending || signInUsername.isPending}
              >
                {auth.localization.auth.signIn}

                <LastUsedBadge floating method={["email", "username"]} />
              </form.AuthFormSubmitButton>

              <For
                each={(auth.plugins as AuthPluginWithButtons[]).flatMap(
                  (plugin) =>
                    (plugin.authButtons ?? []).map((AuthButton, index) => ({
                      AuthButton,
                      key: `${plugin.id}-${index.toString()}`
                    }))
                )}
              >
                {({ AuthButton }) => <AuthButton view="signIn" />}
              </For>

              <form.AuthFormServerError />
            </div>
          </form.AuthFormRoot>
        </form.AppForm>

        <Show
          when={socialPosition() === "bottom" && auth.socialProviders?.length}
        >
          <div class="my-4 text-center text-muted-foreground text-xs">
            {auth.localization.auth.or}
          </div>
          <ProviderButtons socialLayout={props.socialLayout} view="signIn" />
        </Show>

        <div class="mt-4 flex w-full flex-col items-center gap-3">
          <Show when={auth.emailAndPassword.forgotPassword}>
            <AuthLink
              class="text-sm underline-offset-4 hover:underline"
              href={`${auth.basePaths.auth}/${auth.viewPaths.auth.forgotPassword}`}
            >
              {auth.localization.auth.forgotPasswordLink}
            </AuthLink>
          </Show>

          <p class="text-center text-sm text-muted-foreground">
            {auth.localization.auth.needToCreateAnAccount}{" "}
            <AuthLink
              class="underline underline-offset-4"
              href={`${auth.basePaths.auth}/${auth.viewPaths.auth.signUp}`}
            >
              {auth.localization.auth.signUp}
            </AuthLink>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
