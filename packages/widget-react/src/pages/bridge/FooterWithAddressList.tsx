import { encodeSecp256k1Pubkey, pubkeyToAddress } from "@cosmjs/amino"
import { fromBech32, toBech32 } from "@cosmjs/encoding"
import type { ReactNode } from "react"
import { useAsync } from "react-use"
import { useInitiaWidget } from "@/public/data/hooks"
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
  const { srcChainId, sender, recipient } = values

  const { initiaAddress, hexAddress } = useInitiaWidget()
  const signer = useOfflineSigner()

  const findSkipChain = useFindSkipChain()
  const findChainType = useFindChainType()

  const { value, loading, error } = useAsync(() =>
    Promise.all(
      required_chain_addresses.map(async (chainId, index) => {
        if (index === required_chain_addresses.length - 1) {
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
            if (!signer) throw new Error("Wallet not connected")
            const [{ pubkey }] = await signer.getAccounts()
            return pubkeyToAddress(encodeSecp256k1Pubkey(pubkey), chain.bech32_prefix)
          }
          default:
            throw new Error("Unsupported chain type")
        }
      }),
    ),
  )

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

  if (value) {
    return children(value)
  }

  return <FooterWithError error={new Error("Failed to generate intermediary addresses")} />
}

export default FooterWithAddressList
