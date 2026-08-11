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
 * once. The app itself uses ONLY plain RN styles — there is NO nativewind /
 * uniwind / tailwind / babel-transform / metro config anywhere in this project.
 * The components style themselves, which proves zero-setup consumption.
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
      <SafeAreaView style={{ flex: 1 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottomWidth: 1,
            borderColor: "#e5e5e5",
            padding: 16
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: "600" }}>Showcase</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <OrganizationSwitcher />
            <UserButton size="icon" />
          </View>
        </View>

        <ScrollView
          contentContainerStyle={{ gap: 32, padding: 16, paddingBottom: 96 }}
        >
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
    <View style={{ gap: 12 }}>
      <Text
        style={{
          fontSize: 12,
          fontWeight: "600",
          textTransform: "uppercase",
          letterSpacing: 0.5,
          color: "#a3a3a3"
        }}
      >
        {title}
      </Text>
      {children}
    </View>
  )
}
