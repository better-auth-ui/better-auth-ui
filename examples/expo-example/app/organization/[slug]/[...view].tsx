import { Organization } from "@better-auth-ui/react-native"
import { ScrollView } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
export default function Screen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 16, gap: 16 }}
      >
        <Organization />
      </ScrollView>
    </SafeAreaView>
  )
}
