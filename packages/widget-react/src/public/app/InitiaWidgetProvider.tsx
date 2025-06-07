import { useEffect, type PropsWithChildren } from "react"
import { Tooltip } from "radix-ui"
import { MemoryRouter } from "@/lib/router"
import { LocalStorageKey } from "@/data/constants"
import type { Config } from "@/data/config"
import { ConfigContext } from "@/data/config"
import { useAddEthereumChain, useDefaultChain, useInitiaRegistry, useLayer1 } from "@/data/chains"
import AsyncBoundary from "@/components/AsyncBoundary"
import { useSkipChains } from "@/pages/bridge/data/chains"
import { useSkipAssets } from "@/pages/bridge/data/assets"
import { MAINNET } from "../data/constants"
import PortalProvider from "./PortalProvider"
import NotificationProvider from "./NotificationProvider"
import ModalProvider from "./ModalProvider"
import Drawer from "./Drawer"
import Routes from "./Routes"

const ROBOTO_MONO =
  "https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@100..700&display=swap"

const Fonts = () => {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href={ROBOTO_MONO} />
      <link rel="stylesheet" href="https://assets.initia.xyz/fonts/PilatWide.css" />
    </>
  )
}

// The widget fetches registry information and other essentials before rendering
// its children.  This keeps the UI responsive when the drawer first opens.
const Prefetch = () => {
  useInitiaRegistry()

  // bridge
  const layer1 = useLayer1()
  useSkipChains()
  useSkipAssets(localStorage.getItem(LocalStorageKey.BRIDGE_SRC_CHAIN_ID) ?? layer1.chainId)
  useSkipAssets(localStorage.getItem(LocalStorageKey.BRIDGE_DST_CHAIN_ID) ?? layer1.chainId)

  // evm
  const chain = useDefaultChain()
  const isEthereumChain = !!chain.evm_chain_id
  const addEthereumChain = useAddEthereumChain(chain)

  useEffect(() => {
    if (isEthereumChain) {
      // Prompt the wallet to add the EVM chain so users aren't asked when
      // submitting their first transaction.
      addEthereumChain()
    }
  }, [addEthereumChain, isEthereumChain])

  return null
}

const InitiaWidgetProvider = ({ children, ...config }: PropsWithChildren<Partial<Config>>) => {
  if (typeof document === "undefined") {
    return null
  }

  if (typeof window === "undefined") {
    return null
  }

  return (
    <>
      <Fonts />

      <ConfigContext.Provider value={{ ...MAINNET, ...config }}>
        <AsyncBoundary suspenseFallback={null} errorBoundaryProps={{ fallback: null }}>
          <Prefetch />
        </AsyncBoundary>

        <MemoryRouter>
          <PortalProvider>
            <NotificationProvider>
              <ModalProvider>
                <Tooltip.Provider delayDuration={0} skipDelayDuration={0}>
                  {children}

                  <Drawer>
                    <Routes />
                  </Drawer>
                </Tooltip.Provider>
              </ModalProvider>
            </NotificationProvider>
          </PortalProvider>
        </MemoryRouter>
      </ConfigContext.Provider>
    </>
  )
}

export default InitiaWidgetProvider
