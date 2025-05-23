import { useEffect, type PropsWithChildren } from "react"
import { MemoryRouter } from "@/lib/router"
import type { Config } from "@/data/config"
import { ConfigContext } from "@/data/config"
import { useAddEthereumChain, useDefaultChain, useInitiaRegistry } from "@/data/chains"
import AsyncBoundary from "@/components/AsyncBoundary"
import { MAINNET } from "../data/constants"
import PortalProvider from "./PortalProvider"
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

const Prefetch = () => {
  useInitiaRegistry()
  const chain = useDefaultChain()

  const isEthereumChain = !!chain.evm_chain_id
  const addEthereumChain = useAddEthereumChain(chain)

  useEffect(() => {
    if (isEthereumChain) {
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
    <ConfigContext.Provider value={{ ...MAINNET, ...config }}>
      <PortalProvider>
        <Fonts />

        <AsyncBoundary suspenseFallback={null} errorFallbackRender={() => null}>
          <Prefetch />
        </AsyncBoundary>

        <MemoryRouter>
          {children}

          <Drawer>
            <Routes />
          </Drawer>
        </MemoryRouter>
      </PortalProvider>
    </ConfigContext.Provider>
  )
}

export default InitiaWidgetProvider
