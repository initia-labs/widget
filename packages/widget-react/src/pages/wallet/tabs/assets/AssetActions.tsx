import clsx from "clsx"
import { useWatchAsset } from "wagmi"
import { IconCheck, IconPlus } from "@initia/icons-react"
import { useNavigate } from "@/lib/router"
import { useInitiaWidget } from "@/public/data/hooks"
import { useConfig } from "@/data/config"
import type { NormalizedChain } from "@/data/chains"
import { useAddEthereumChain } from "@/data/chains"
import { useAsset } from "@/data/assets"
import Image from "@/components/Image"
import styles from "./AssetActions.module.css"

const AssetActions = ({ denom, chain }: { denom: string; chain: NormalizedChain }) => {
  const navigate = useNavigate()
  const { defaultChainId } = useConfig()
  const { address = "", symbol, decimals } = useAsset(denom, chain)
  const { wallet } = useInitiaWidget()
  const { watchAsset, data } = useWatchAsset()
  const addEthereumChain = useAddEthereumChain(chain)

  const send = () => {
    navigate("/send", { denom, chain })
  }

  const bridge = () => {
    navigate("/bridge", { srcChainId: chain.chainId, srcDenom: denom })
  }

  if (!wallet) return null

  return (
    <nav className={styles.actions}>
      <button className={styles.button} onClick={send}>
        Send
      </button>

      <button className={styles.button} onClick={bridge}>
        Bridge/Swap
      </button>

      {chain.chainId === defaultChainId && !!address && (
        <button
          className={clsx(styles.button, styles.add)}
          onClick={async () => {
            await addEthereumChain()
            watchAsset({ type: "ERC20", options: { address, symbol, decimals } })
          }}
        >
          {!data ? <IconPlus size={10} /> : <IconCheck size={10} />}
          <Image src={wallet.meta.icon} width={16} height={16} />
        </button>
      )}
    </nav>
  )
}

export default AssetActions
