import { encodeSecp256k1Pubkey, pubkeyToAddress } from "@cosmjs/amino"
import { fromBech32, toBech32 } from "@cosmjs/encoding"
import type { ReactNode } from "react"
import { useAsync } from "react-use"
import { AddressUtils } from "@/public/utils"
import { useInitiaWidget } from "@/public/data/hooks"
import { normalizeError } from "@/data/http"
import { useOfflineSigner } from "@/data/signer"
import Footer from "@/components/Footer"
import Button from "@/components/Button"
import { useFindChainType, useFindSkipChain } from "./data/chains"
import { useBridgePreviewState } from "./data/tx"
import FooterWithError from "./FooterWithError"

interface Props {
  children: (addressList: string[]) => ReactNode
}

const FooterWithAddressList = ({ children }: Props) => {
  const state = useBridgePreviewState()
  const { route, values } = state
  const { required_chain_addresses } = route
  const { srcChainId, dstChainId, sender, recipient } = values

  const { initiaAddress, hexAddress } = useInitiaWidget()
  const signer = useOfflineSigner()

  const findSkipChain = useFindSkipChain()
  const findChainType = useFindChainType()

  const srcChain = findSkipChain(srcChainId)
  const srcChainType = findChainType(srcChain)
  const isPubkeyRequired =
    required_chain_addresses.slice(0, -1).some((chainId) => {
      const chain = findSkipChain(chainId)
      const chainType = findChainType(chain)
      return chainType === "cosmos"
    }) && srcChainType !== "cosmos"

  const {
    value: pubkey,
    loading,
    error,
  } = useAsync(async () => {
    try {
      if (!isPubkeyRequired) return
      if (!signer) throw new Error("Wallet not connected")
      const [{ pubkey }] = await signer.getAccounts()
      return pubkey
    } catch (error) {
      throw new Error(await normalizeError(error))
    }
  })

  if (error) {
    return <FooterWithError error={error} />
  }

  if (loading) {
    return (
      <Footer>
        <Button.White loading={loading && "Generating intermediary addresses..."} />
      </Footer>
    )
  }

  if (!isPubkeyRequired || pubkey) {
    const addressList = required_chain_addresses.map((chainId, index) => {
      if (index === required_chain_addresses.length - 1) {
        const dstChain = findSkipChain(dstChainId)
        const findSkipChainType = findChainType(dstChain)
        if (findSkipChainType === "initia") return AddressUtils.toBech32(recipient)
        return recipient
      }

      const chain = findSkipChain(chainId)
      const chainType = findChainType(chain)
      const srcChain = findSkipChain(srcChainId)
      const srcChainType = findChainType(srcChain)

      switch (chainType) {
        case "initia":
          return initiaAddress
        case "evm":
          return hexAddress
        case "cosmos": {
          if (srcChainType === "cosmos") {
            return toBech32(chain.bech32_prefix, fromBech32(sender).data)
          }
          if (!pubkey) throw new Error("Pubkey not found")
          return pubkeyToAddress(encodeSecp256k1Pubkey(pubkey), chain.bech32_prefix)
        }
        default:
          throw new Error("Unsupported chain type")
      }
    })

    return children(addressList)
  }

  return <FooterWithError error={new Error("Failed to generate intermediary addresses")} />
}

export default FooterWithAddressList
