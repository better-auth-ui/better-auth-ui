import { OrganizationSwitcher, UserButton } from "@better-auth-ui/react-native"
import { useAuth, useSession } from "@better-auth-ui/react"
import { Link, useRouter } from "expo-router"
import { useEffect } from "react"
import { Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
export default function Dashboard() {
  const { authClient } = useAuth()
  const session = useSession(authClient)
  const router = useRouter()
  useEffect(() => {
    if (!session.isPending && !session.error && !session.data)
      router.replace("/auth/sign-in")
  }, [session.isPending, session.error, session.data, router])
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ padding: 24, gap: 16 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: "600" }}>Dashboard</Text>
          <UserButton size="icon" />
        </View>
        <OrganizationSwitcher />
        <Link href="/settings/account">Account settings</Link>
        <Link href="/settings/security">Security settings</Link>
        <Link href="/settings/organizations">Organizations</Link>
        <Link href="/admin/users">User administration</Link>
        <Link href="/showcase">Component showcase</Link>
      </View>
    </SafeAreaView>
  )
}
