import {
  ApiKeys,
  Appearance,
  DangerZone,
  ManageAccounts,
  Organization,
  OrganizationSwitcher,
  Organizations,
  Settings,
  UserButton
} from "@better-auth-ui/react-native"
import type { ReactNode } from "react"
import { ScrollView, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

export default function Showcase() {
  return (
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

        <Section title="Manage accounts">
          <ManageAccounts />
        </Section>

        <Section title="Danger zone (delete account)">
          <DangerZone />
        </Section>
      </ScrollView>
    </SafeAreaView>
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
