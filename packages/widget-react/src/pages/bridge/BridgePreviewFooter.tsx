import { BrowserProvider } from "ethers"
import BigNumber from "bignumber.js"
import { calculateFee, GasPrice, SigningStargateClient } from "@cosmjs/stargate"
import { useMutation } from "@tanstack/react-query"
import type { TxJson } from "@skip-go/client"
import { aminoConverters, aminoTypes } from "@initia/amino-converter"
import { useNavigate } from "@/lib/router"
import { DEFAULT_GAS_ADJUSTMENT } from "@/public/data/constants"
import { useInitiaWidget } from "@/public/data/hooks"
import { normalizeError } from "@/data/http"
import Button from "@/components/Button"
import Footer from "@/components/Footer"
import { useCosmosWallets } from "./data/cosmos"
import { useChainType, useSkipChain } from "./data/chains"
import { useBridgePreviewState } from "./data/tx"
import FooterWithError from "./FooterWithError"

const BridgePreviewFooter = ({ tx }: { tx: TxJson }) => {
  const { route, values } = useBridgePreviewState()
  const { srcChainId, sender, cosmosWalletName } = values
  const navigate = useNavigate()

  const { wallet, requestTxBlock } = useInitiaWidget()
  const { find } = useCosmosWallets()
  const srcChain = useSkipChain(srcChainId)
  const chainType = useChainType(srcChain)

  const { mutate, isPending, error } = useMutation({
    mutationFn: async () => {
      try {
        if ("cosmos_tx" in tx) {
          if (!tx.cosmos_tx.msgs) throw new Error("Invalid transaction data")
          const messages = tx.cosmos_tx.msgs.map(({ msg_type_url, msg }) => {
            if (!(msg_type_url && msg)) throw new Error("Invalid transaction data")
            // Note: `typeUrl` comes in proto format, but `msg` is in amino format.
            // Weird, but that's how the Skip API responds.
            return aminoTypes.fromAmino({
              type: aminoConverters[msg_type_url].aminoType,
              value: JSON.parse(msg),
            })
          })

          if (chainType === "initia") {
            const { transactionHash } = await requestTxBlock({
              messages,
              chainId: srcChainId,
              internal: true,
              // Override the location state with the tx hash.
              // A tx hash is required to prevent further tx requests.
              callback: (txHash: string) => navigate(-1, { route, values, tx, txHash }),
              returnPath: "/bridge", // for failed or rejected tx
            })
            return transactionHash
          }

          const provider = find(cosmosWalletName)?.getProvider()
          if (!provider) throw new Error("Wallet not connected")
          const offlineSigner = provider.getOfflineSigner(srcChainId)
          const client = await SigningStargateClient.connectWithSigner(srcChain.rpc, offlineSigner)
          const balances = await client.getAllBalances(sender)
          const availableFeeAsset = srcChain.fee_assets.find((asset) =>
            balances.some(
              (balance) => balance.denom === asset.denom && BigNumber(balance.amount).gt(0),
            ),
          )
          if (!availableFeeAsset) throw new Error("Insufficient fee balance")
          const { denom, gas_price } = availableFeeAsset
          if (!gas_price) throw new Error(`Gas price not found for ${denom}`)
          const gas = await client.simulate(sender, messages, "")
          const gasPrice = GasPrice.fromString(gas_price.average + denom)
          const fee = calculateFee(Math.ceil(gas * DEFAULT_GAS_ADJUSTMENT), gasPrice)
          const { transactionHash } = await client.signAndBroadcast(sender, messages, fee)
          return transactionHash
        }

        if ("evm_tx" in tx) {
          const { chain_id: chainId, to, value, data } = tx.evm_tx
          if (!wallet) throw new Error("Wallet not connected")
          const provider = new BrowserProvider(await wallet.getEthereumProvider())
          await provider.send("wallet_switchEthereumChain", [
            { chainId: `0x${Number(chainId).toString(16)}` },
          ])
          const signer = await provider.getSigner()
          const response = await signer.sendTransaction({ chainId, to, value, data: `0x${data}` })
          const receipt = await response.wait()
          if (!receipt) throw new Error("Transaction failed")
          const { hash } = receipt
          return hash
        }

        throw new Error("Unsupported chain type")
      } catch (error) {
        throw new Error(await normalizeError(error))
      }
    },
    onSuccess: (txHash) => {
      // Override the location state with the tx hash.
      // A tx hash is required to prevent further tx requests.
      navigate(0, { route, values, tx, txHash })
    },
    onError: (error) => {
      console.trace(error)
    },
  })

  if (error) {
    return <FooterWithError error={error} />
  }

  return (
    <Footer>
      <Button.White onClick={() => mutate()} loading={isPending && "Signing transaction..."}>
        Confirm
      </Button.White>
    </Footer>
  )
}

export default BridgePreviewFooter
