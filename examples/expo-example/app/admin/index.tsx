import { Redirect, usePathname } from "expo-router"
export default function Index() {
  const pathname = usePathname()
  return <Redirect href={`${pathname}/users`} />
}
