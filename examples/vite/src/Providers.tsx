import type { PropsWithChildren } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createConfig, http, WagmiProvider } from "wagmi"
import { mainnet } from "wagmi/chains"
import { InterwovenKitProvider, injectStyles, TESTNET } from "@initia/widget-react"
import css from "@initia/widget-react/styles.css?inline"
import { isTestnet, useTheme } from "./data"

injectStyles(css)
const wagmiConfig = createConfig({ chains: [mainnet], transports: { [mainnet.id]: http() } })
const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

const WithInitiaWidget = ({ children }: PropsWithChildren) => {
  const theme = useTheme()

  return (
    <InterwovenKitProvider {...(isTestnet ? TESTNET : {})} theme={theme}>
      {children}
    </InterwovenKitProvider>
  )
}

const Providers = ({ children }: PropsWithChildren) => {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <WithInitiaWidget>{children}</WithInitiaWidget>
      </WagmiProvider>
    </QueryClientProvider>
  )
}

export default Providers
