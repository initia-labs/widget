import type { Eip1193Provider } from "ethers"
import type { GeneratedType } from "@cosmjs/proto-signing"
import type { AminoConverters } from "@cosmjs/stargate"
import { createContext, useContext } from "react"
import type { Chain } from "@initia/initia-registry-types"

export interface Config {
  wallet?: {
    meta: { icon?: string }
    getEthereumProvider: () => Promise<Eip1193Provider>
    sign: (message: string) => Promise<string>
  }

  defaultChainId: string
  customChain?: Chain
  protoTypes?: Iterable<[string, GeneratedType]>
  aminoConverters?: AminoConverters

  registryUrl: string
  routerApiUrl: string
  usernamesModuleAddress: string

  theme: "light" | "dark"
}

export const ConfigContext = createContext<Config>(null!)

export function useConfig() {
  return useContext(ConfigContext)
}
