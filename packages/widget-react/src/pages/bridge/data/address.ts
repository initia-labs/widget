import { isAddress } from "ethers"
import { fromBech32 } from "@cosmjs/encoding"
import { Address } from "@/public/utils"
import { useInitiaWidget } from "@/public/data/hooks"
import { useFindSkipChain, useFindChainType } from "./chains"

export function useGetDefaultAddress() {
  const { initiaAddress, hexAddress } = useInitiaWidget()
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
        return Address.validate(address)
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
      return Address.toBech32(initialAddress)
    }
    if (initialChainType === "initia" && chainType === "evm") {
      return Address.toPrefixedHex(initialAddress)
    }
    if (initialChainType === chainType) {
      return initialAddress
    }
    if (fallbackAddress) {
      if (chainType === "initia") return Address.toBech32(fallbackAddress)
      if (chainType === "evm") return Address.toPrefixedHex(fallbackAddress)
    }
    return ""
  }
}
