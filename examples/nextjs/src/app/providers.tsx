"use client"

import type { PropsWithChildren } from "react"
import { useEffect } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { PrivyProvider, useWallets } from "@privy-io/react-auth"
import { WagmiProvider } from "@privy-io/wagmi"
import { createConfig, http, useAccount, useDisconnect } from "wagmi"
import { mainnet } from "wagmi/chains"
import { injectStyles, PRIVY_APP_ID, TESTNET, InitiaWidgetProvider } from "@initia/widget-react"
import initiaWidgetStyles from "@initia/widget-react/styles.js"

const privyConfig = { appearance: { walletList: ["detected_wallets" as const] } }
const wagmiConfig = createConfig({ chains: [mainnet], transports: { [mainnet.id]: http() } })
const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

const WithInitiaWidget = ({ children }: PropsWithChildren) => {
  const { address } = useAccount()
  const { disconnect } = useDisconnect()
  const { wallets } = useWallets()
  const wallet = wallets[0]

  useEffect(() => {
    injectStyles(initiaWidgetStyles)
  }, [])

  return (
    <InitiaWidgetProvider
      {...TESTNET}
      wallet={address ? { ...wallet, address, disconnect } : undefined}
    >
      {children}
    </InitiaWidgetProvider>
  )
}

export default function Providers({ children }: PropsWithChildren) {
  return (
    <PrivyProvider appId={PRIVY_APP_ID} config={privyConfig}>
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          <WithInitiaWidget>{children}</WithInitiaWidget>
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  )
}
