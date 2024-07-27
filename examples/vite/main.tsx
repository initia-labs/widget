import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import App from "./src/App"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { PrivyProvider } from "@privy-io/react-auth"
import { WagmiProvider } from "@privy-io/wagmi"
import { createConfig, http } from "wagmi"
import { mainnet } from "wagmi/chains"
import { injectStyles, PRIVY_APP_ID } from "@initia/widget-react"
import css from "@initia/widget-react/styles.css?inline"

injectStyles(css)
const privyConfig = { appearance: { walletList: ["detected_wallets" as const] } }
const wagmiConfig = createConfig({ chains: [mainnet], transports: { [mainnet.id]: http() } })
const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PrivyProvider appId={PRIVY_APP_ID} config={privyConfig}>
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          <App />
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  </StrictMode>,
)
