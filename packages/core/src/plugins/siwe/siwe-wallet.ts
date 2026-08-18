export type SiweConnectedWallet = {
  address: string
  chainId: number
}

/** Adapts an injected wallet, Wagmi, RainbowKit, or another wallet client. */
export interface SiweWalletConnector {
  readonly id: string
  readonly label: string
  connect(): Promise<SiweConnectedWallet>
  signMessage(input: { address: string; message: string }): Promise<string>
}

export type Eip1193Request = {
  method: string
  params?: readonly unknown[] | object
}

export interface Eip1193Provider {
  request(request: Eip1193Request): Promise<unknown>
}

const resolveInjectedProvider = (provider?: Eip1193Provider) => {
  if (provider) return provider
  const injected = (globalThis as { ethereum?: Eip1193Provider }).ethereum
  if (!injected) throw new Error("No injected Ethereum wallet was found.")
  return injected
}

const stringToHex = (value: string) => {
  const bytes = new TextEncoder().encode(value)
  return `0x${Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("")}`
}

/** Creates a connector for EIP-1193 providers such as `window.ethereum`. */
export function createEip1193WalletConnector(
  options: { provider?: Eip1193Provider; id?: string; label?: string } = {}
): SiweWalletConnector {
  return {
    id: options.id ?? "injected",
    label: options.label ?? "Ethereum wallet",
    async connect() {
      const provider = resolveInjectedProvider(options.provider)
      const accounts = await provider.request({ method: "eth_requestAccounts" })
      const chainId = await provider.request({ method: "eth_chainId" })
      const address = Array.isArray(accounts) ? accounts[0] : undefined

      if (typeof address !== "string" || typeof chainId !== "string") {
        throw new Error("The wallet returned an invalid account or chain.")
      }

      return { address, chainId: Number.parseInt(chainId, 16) }
    },
    async signMessage({ address, message }) {
      const provider = resolveInjectedProvider(options.provider)
      const signature = await provider.request({
        method: "personal_sign",
        params: [stringToHex(message), address]
      })

      if (typeof signature !== "string") {
        throw new Error("The wallet returned an invalid signature.")
      }

      return signature
    }
  }
}

export type SiweMessageInput = SiweConnectedWallet & {
  domain: string
  uri: string
  nonce: string
  statement?: string
  issuedAt?: Date
  expirationTime?: Date
  notBefore?: Date
  requestId?: string
  resources?: string[]
}

/** Builds an ERC-4361 Sign-In with Ethereum message. */
export function createSiweMessage(input: SiweMessageInput) {
  const header = `${input.domain} wants you to sign in with your Ethereum account:`
  const fields = [
    `URI: ${input.uri}`,
    "Version: 1",
    `Chain ID: ${input.chainId}`,
    `Nonce: ${input.nonce}`,
    `Issued At: ${(input.issuedAt ?? new Date()).toISOString()}`
  ]

  if (input.expirationTime) {
    fields.push(`Expiration Time: ${input.expirationTime.toISOString()}`)
  }
  if (input.notBefore)
    fields.push(`Not Before: ${input.notBefore.toISOString()}`)
  if (input.requestId) fields.push(`Request ID: ${input.requestId}`)
  if (input.resources?.length) {
    fields.push(
      "Resources:",
      ...input.resources.map((resource) => `- ${resource}`)
    )
  }

  return [header, input.address, input.statement, fields.join("\n")]
    .filter((part): part is string => part !== undefined)
    .join("\n\n")
}

export type SiweWalletAccount = {
  id: string
  address: string
  chainId: number
  isPrimary: boolean
  createdAt: Date
}

export type SiweWalletLinkChallenge = {
  message: string
}

export type SiweWalletLinkInput = SiweConnectedWallet & {
  message: string
  signature: string
}

/**
 * Application-owned, server-backed wallet operations.
 * Implementations must authorize every operation from the server session.
 */
export interface SiweWalletManager {
  list(signal?: AbortSignal): Promise<SiweWalletAccount[]>
  createLinkChallenge(
    wallet: SiweConnectedWallet
  ): Promise<SiweWalletLinkChallenge>
  link(input: SiweWalletLinkInput): Promise<void>
  unlink(walletId: string): Promise<void>
  setPrimary(walletId: string): Promise<void>
}
