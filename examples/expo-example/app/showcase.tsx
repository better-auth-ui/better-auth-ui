import {
  ApiKeys,
  Appearance,
  AuthProvider,
  DangerZone,
  ManageAccounts,
  Organization,
  OrganizationSwitcher,
  Organizations,
  Settings,
  UserButton
} from "@better-auth-ui/react-native"
import {
  apiKeyPlugin,
  deleteUserPlugin,
  magicLinkPlugin,
  multiSessionPlugin,
  organizationPlugin,
  themePlugin,
  usernamePlugin
} from "@better-auth-ui/react-native/plugins"
import type { ReactNode } from "react"
import { ScrollView, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { authClient } from "../src/auth-client"

/**
 * Kitchen-sink screen: mounts every @better-auth-ui/react-native subsystem at
 * once so the full component surface can be rendered and eyeballed via
 * `expo start --web`. With no live backend / session the data-driven screens
 * render their pending / skeleton / empty states — enough to confirm every
 * component mounts, themes, and lays out without crashing.
 */
export default function Showcase() {
  return (
    <AuthProvider
      authClient={authClient}
      socialProviders={["github", "google"]}
      plugins={[
        organizationPlugin(),
        apiKeyPlugin(),
        multiSessionPlugin(),
        magicLinkPlugin(),
        usernamePlugin(),
        deleteUserPlugin(),
        themePlugin()
      ]}
    >
      <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-neutral-950">
        <View className="flex-row items-center justify-between border-b border-neutral-200 p-4 dark:border-neutral-800">
          <Text className="text-xl font-semibold text-neutral-900 dark:text-neutral-50">
            Showcase
          </Text>
          <View className="flex-row items-center gap-3">
            <OrganizationSwitcher />
            <UserButton size="icon" />
          </View>
        </View>

        <ScrollView contentContainerClassName="gap-8 p-4 pb-24">
          <Section title="Settings (account + security)">
            <Settings />
          </Section>

          <Section title="Appearance / theme">
            <Appearance />
          </Section>

          <Section title="Organization">
            <Organization />
          </Section>

          <Section title="Organizations (list)">
            <Organizations />
          </Section>

          <Section title="API keys">
            <ApiKeys />
          </Section>

          <Section title="Multi-session — manage accounts">
            <ManageAccounts />
          </Section>

          <Section title="Danger zone (delete account)">
            <DangerZone />
          </Section>
        </ScrollView>
      </SafeAreaView>
    </AuthProvider>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="gap-3">
      <Text className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
        {title}
      </Text>
      {children}
    </View>
  )
}
