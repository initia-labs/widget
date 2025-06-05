"use client"

import type { PropsWithChildren } from "react"
import { useEffect } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createConfig, http, WagmiProvider } from "wagmi"
import { mainnet } from "wagmi/chains"
import { injectStyles, InitiaWidgetProvider } from "@initia/widget-react"
import initiaWidgetStyles from "@initia/widget-react/styles.js"

const wagmiConfig = createConfig({ chains: [mainnet], transports: { [mainnet.id]: http() } })
const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

const WithInitiaWidget = ({ children }: PropsWithChildren) => {
  useEffect(() => {
    injectStyles(initiaWidgetStyles)
  }, [])

  return <InitiaWidgetProvider>{children}</InitiaWidgetProvider>
}

export default function Providers({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <WithInitiaWidget>{children}</WithInitiaWidget>
      </WagmiProvider>
    </QueryClientProvider>
  )
}
