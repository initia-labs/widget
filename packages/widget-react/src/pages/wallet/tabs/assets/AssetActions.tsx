import clsx from "clsx"
import { useMutation } from "@tanstack/react-query"
import { IconCheck, IconPlus } from "@initia/icons-react"
import { useNavigate } from "@/lib/router"
import { useConfig } from "@/data/config"
import type { NormalizedChain } from "@/data/chains"
import { useAddEthereumChain } from "@/data/chains"
import { useAsset } from "@/data/assets"
import Image from "@/components/Image"
import styles from "./AssetActions.module.css"

const AssetActions = ({ denom, chain }: { denom: string; chain: NormalizedChain }) => {
  const navigate = useNavigate()
  const { defaultChainId, wallet } = useConfig()
  const { address = "", symbol, decimals, logoUrl: image } = useAsset(denom, chain)
  const addEthereumChain = useAddEthereumChain(chain)
  const { chainId } = chain

  if (!wallet) throw new Error("Wallet not connected")

  const send = () => {
    navigate("/send", { denom, chain })
  }

  const bridge = () => {
    navigate("/bridge", { srcChainId: chainId, srcDenom: denom })
  }

  const addAsset = useMutation({
    mutationFn: async () => {
      await addEthereumChain()
      const provider = await wallet.getEthereumProvider()
      await provider.request({
        method: "wallet_watchAsset",
        params: { type: "ERC20", options: { address, symbol, decimals, image } },
      })
      return true
    },
  })

  return (
    <nav className={styles.actions}>
      <button className={styles.button} onClick={send}>
        Send
      </button>

      <button className={styles.button} onClick={bridge}>
        Bridge/Swap
      </button>

      {chainId === defaultChainId && !!address && (
        <button
          className={clsx(styles.button, styles.add)}
          onClick={() => addAsset.mutate()}
          disabled={addAsset.isPending || addAsset.data}
        >
          {!addAsset.data ? <IconPlus size={10} /> : <IconCheck size={10} />}
          <Image src={wallet.meta.icon} width={16} height={16} />
        </button>
      )}
    </nav>
  )
}

export default AssetActions
