import { IconChevronDown } from "@initia/icons-react"
import Image from "../Image"
import type { BaseAsset, BaseChain } from "./types"
import styles from "./AssetOnChainButton.module.css"

interface Props {
  chain: BaseChain
  asset: BaseAsset
  readOnly?: boolean
}

const AssetOnChainButton = ({ asset, chain, readOnly }: Props) => {
  const content = (
    <div className={styles.content}>
      <div className={styles.logo}>
        <Image src={asset.logoUrl} width={36} height={36} />
        <Image src={chain.logoUrl} width={18} height={18} className={styles.chain} />
      </div>

      <div className={styles.details}>
        <div className={styles.symbol}>{asset.symbol}</div>
        <div className={styles.chain}>on {chain.name}</div>
      </div>
    </div>
  )

  if (readOnly) {
    return <div className={styles.root}>{content}</div>
  }

  return (
    <div className={styles.root}>
      {content}
      <IconChevronDown size={16} className={styles.chevron} />
    </div>
  )
}

export default AssetOnChainButton
