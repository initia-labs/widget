import { BrowserProvider } from "ethers"
import BigNumber from "bignumber.js"
import { calculateFee, GasPrice, SigningStargateClient } from "@cosmjs/stargate"
import { useMutation } from "@tanstack/react-query"
import type { TxJson } from "@skip-go/client"
import { aminoConverters, aminoTypes } from "@initia/amino-converter"
import { Link, useNavigate } from "@/lib/router"
import { DEFAULT_GAS_ADJUSTMENT } from "@/public/data/constants"
import { useInitiaWidget } from "@/public/data/hooks"
import { useNotification } from "@/public/app/NotificationContext"
import { useConfig } from "@/data/config"
import { normalizeError } from "@/data/http"
import Button from "@/components/Button"
import Footer from "@/components/Footer"
import { useCosmosWallets } from "./data/cosmos"
import { useChainType, useSkipChain } from "./data/chains"
import { useFindSkipAsset } from "./data/assets"
import { useBridgeHistory, useBridgePreviewState } from "./data/tx"
import FooterWithError from "./FooterWithError"
import styles from "./BridgePreviewFooter.module.css"

interface Props {
  tx: TxJson
}

const BridgePreviewFooter = ({ tx }: Props) => {
  const navigate = useNavigate()
  const { showNotification, hideNotification } = useNotification()
  const [, setBridgeHistory] = useBridgeHistory()

  const { route, values } = useBridgePreviewState()
  const { srcChainId, sender, cosmosWalletName } = values

  const { wallet } = useConfig()
  const { requestTxSync } = useInitiaWidget()
  const { find } = useCosmosWallets()
  const srcChain = useSkipChain(srcChainId)
  const srcChainType = useChainType(srcChain)
  const findAsset = useFindSkipAsset(srcChainId)

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

          if (srcChainType === "initia") {
            return await requestTxSync({ messages, chainId: srcChainId, internal: 1 })
          }

          const provider = find(cosmosWalletName)?.getProvider()
          if (!provider) throw new Error("Wallet not connected")
          const offlineSigner = provider.getOfflineSignerOnlyAmino(srcChainId)
          const client = await SigningStargateClient.connectWithSigner(srcChain.rpc, offlineSigner)
          const balances = await client.getAllBalances(sender)
          const availableFeeAsset = srcChain.fee_assets.find((asset) =>
            balances.some(
              (balance) => balance.denom === asset.denom && BigNumber(balance.amount).gt(0),
            ),
          )
          if (!availableFeeAsset) {
            const feeSymbols = srcChain.fee_assets.map((asset) => findAsset(asset.denom).symbol)
            const errorMessage = [
              `Insufficient balance for fees.`,
              `Available fee assets: ${feeSymbols.join(", ")}`,
              `(note: asset symbols may refer to different tokens across chains)`,
            ].join(" ")
            throw new Error(errorMessage)
          }
          const { denom, gas_price } = availableFeeAsset
          if (!gas_price) throw new Error(`Gas price not found for ${denom}`)
          const gas = await client.simulate(sender, messages, "")
          const gasPrice = GasPrice.fromString(gas_price.average + denom)
          const fee = calculateFee(Math.ceil(gas * DEFAULT_GAS_ADJUSTMENT), gasPrice)
          return await client.signAndBroadcastSync(sender, messages, fee)
        }

        if ("evm_tx" in tx) {
          const { chain_id: chainId, to, value, data } = tx.evm_tx
          if (!wallet) throw new Error("Wallet not connected")
          const provider = new BrowserProvider(await wallet.getEthereumProvider())
          await provider.send("wallet_switchEthereumChain", [
            { chainId: `0x${Number(chainId).toString(16)}` },
          ])
          const signer = await provider.getSigner()
          const { hash } = await signer.sendTransaction({ chainId, to, value, data: `0x${data}` })
          return hash
        }

        throw new Error("Unsupported chain type")
      } catch (error) {
        throw new Error(await normalizeError(error))
      }
    },
    onSuccess: (txHash: string) => {
      navigate(-1)
      setBridgeHistory((prev = []) => [
        ...prev,
        { timestamp: Date.now(), chainId: srcChainId, txHash, route, values },
      ])
      const link = (
        <Link to="/bridge/history" className={styles.link} onClick={hideNotification}>
          the history page
        </Link>
      )
      showNotification({
        type: "success",
        title: "Transaction sent",
        description: <>Check {link} for transaction status</>,
      })
    },
    onError: (error) => {
      navigate(-1)
      showNotification({
        type: "error",
        title: "Transaction failed",
        description: error.message,
      })
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
