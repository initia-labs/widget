import { isAddress } from "ethers"
import { fromBech32 } from "@cosmjs/encoding"
import { AddressUtils } from "@/public/utils"
import { useInitiaWidget } from "@/public/data/hooks"
import { useFindSkipChain, useFindChainType } from "./chains"
import { useCosmosAddress } from "./cosmos"

export function useGetDefaultAddress() {
  const { initiaAddress, hexAddress } = useInitiaWidget()
  const cosmosAddress = useCosmosAddress()
  const findSkipChain = useFindSkipChain()
  const findChainType = useFindChainType()
  return (chainId: string) => {
    const chain = findSkipChain(chainId)
    const chainType = findChainType(chain)
    switch (chainType) {
      case "initia":
        // FIXME: If the field is a recipient address and the rollup is based on MiniEVM,
        // it might be desirable to auto-fill the hex address.
        // However, since this address is also used as the sender, it's safer to use initiaAddress for now.
        return initiaAddress
      case "evm":
        return hexAddress
      case "cosmos":
        return cosmosAddress(chain.bech32_prefix)
      default:
        return ""
    }
  }
}

export function useValidateAddress() {
  const findChain = useFindSkipChain()
  const findChainType = useFindChainType()

  return (address: string, chainId: string) => {
    const chain = findChain(chainId)
    const chainType = findChainType(chain)
    switch (chainType) {
      case "initia":
        return AddressUtils.validate(address)
      case "evm":
        return isAddress(address)
      case "cosmos": {
        try {
          return fromBech32(address).prefix === chain.bech32_prefix
        } catch {
          return false
        }
      }
      default:
        return false
    }
  }
}

export function useGetAddressForBalance() {
  const findChain = useFindSkipChain()
  const findChainType = useFindChainType()

  return ({
    initialAddress,
    initialChainId,
    chainId,
    fallbackAddress,
  }: {
    initialAddress: string
    initialChainId: string
    chainId: string
    fallbackAddress?: string
  }) => {
    const initialChain = findChain(initialChainId)
    const initialChainType = findChainType(initialChain)
    const chain = findChain(chainId)
    const chainType = findChainType(chain)
    if (initialChainType === "evm" && chainType === "initia") {
      return AddressUtils.toBech32(initialAddress)
    }
    if (initialChainType === "initia" && chainType === "evm") {
      return AddressUtils.toPrefixedHex(initialAddress)
    }
    if (initialChainType === chainType) {
      return initialAddress
    }
    if (fallbackAddress) {
      if (chainType === "initia") return AddressUtils.toBech32(fallbackAddress)
      if (chainType === "evm") return AddressUtils.toPrefixedHex(fallbackAddress)
    }
    return ""
  }
}
