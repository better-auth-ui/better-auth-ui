import { Auth } from "@better-auth-ui/react-native"
import { ScrollView } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
export default function AuthScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          padding: 24
        }}
      >
        <Auth />
      </ScrollView>
    </SafeAreaView>
  )
}
