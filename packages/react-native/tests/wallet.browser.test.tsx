import { cleanup, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, expect, it, vi } from "vitest"
import { SignInEthereumButton } from "../src/components/auth/siwe/sign-in-ethereum-button"
import { siwePlugin } from "../src/lib/auth/siwe-plugin"
import { nativeApp } from "./support/native-app"
vi.mock("expo-clipboard", () => ({ setStringAsync: vi.fn() }))
vi.mock("expo-image-picker", () => ({ launchImageLibraryAsync: vi.fn() }))
vi.mock("expo-image-manipulator", () => ({ SaveFormat: { PNG: "png" } }))
afterEach(cleanup)
it("signs a fresh server nonce through the native wallet and exposes cancellation outside an email modal", async () => {
  const connect = vi.fn(async () => ({ address: "0xabc", chainId: 1 }))
  const signMessage = vi.fn(async () => "signed-message")
  const nonce = vi.fn(async () => ({ nonce: "fresh-nonce" }))
  const verify = vi.fn(async () => ({ success: true }))
  const app = nativeApp({
    plugins: [
      siwePlugin({
        email: "none",
        domain: "app.example",
        uri: "https://app.example",
        connector: { id: "native", label: "Wallet", connect, signMessage }
      })
    ],
    client: { siwe: { nonce, verify } }
  })
  app.render(<SignInEthereumButton view="signIn" />)
  const user = userEvent.setup()
  await user.click(
    screen.getByRole("button", { name: "Continue with Ethereum", exact: true })
  )
  await waitFor(() =>
    expect(verify).toHaveBeenCalledWith(
      expect.objectContaining({
        signature: "signed-message",
        message: expect.stringContaining("Nonce: fresh-nonce")
      })
    )
  )
  expect(signMessage).toHaveBeenCalledWith(
    expect.objectContaining({
      address: "0xabc",
      message: expect.stringContaining("URI: https://app.example")
    })
  )
  connect.mockRejectedValueOnce(new Error("Wallet connection cancelled"))
  await user.click(
    screen.getByRole("button", { name: "Continue with Ethereum", exact: true })
  )
  await screen.findByText("Wallet connection cancelled")
  expect(verify).toHaveBeenCalledTimes(1)
})
