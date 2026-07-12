import { AuthProvider, UserButton } from "@better-auth-ui/react-native"
import { Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { authClient } from "../../src/auth-client"

/** Protected dashboard, reached automatically once the session is set. */
export default function Dashboard() {
  return (
    <AuthProvider authClient={authClient}>
      <SafeAreaView className="flex-1 bg-white dark:bg-neutral-950">
        <View className="flex-row items-center justify-between p-4">
          <Text className="text-xl font-semibold text-neutral-900 dark:text-neutral-50">
            Dashboard
          </Text>
          <UserButton size="icon" />
        </View>

        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-base text-neutral-500 dark:text-neutral-400">
            You're signed in 🎉
          </Text>
        </View>
      </SafeAreaView>
    </AuthProvider>
  )
}
