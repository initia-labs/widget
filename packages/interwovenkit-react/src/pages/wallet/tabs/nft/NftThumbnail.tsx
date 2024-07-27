import clsx from "clsx"
import Image from "@/components/Image"
import type { NormalizedChain } from "@/data/chains"
import type { NormalizedCollection, NormalizedNft } from "./queries"
import styles from "./NftThumbnail.module.css"

interface Props {
  chain: NormalizedChain
  collection: NormalizedCollection
  nft: NormalizedNft
  size?: number
  onClick?: () => void
}

const NftThumbnail = ({ chain, collection, nft, size, onClick }: Props) => {
  const src = new URL(
    `/v1/${chain.chainId}/${collection.object_addr}/${nft.object_addr || nft.token_id}`,
    "https://glyph.initia.xyz",
  ).toString()

  if (onClick) {
    return (
      <button
        className={clsx(styles.thumbnail, styles.clickable)}
        onClick={onClick}
        style={{ width: size, height: size }}
      >
        <Image src={src} classNames={{ placeholder: styles.placeholder }} />
      </button>
    )
  }

  return (
    <div className={styles.thumbnail} style={{ width: size, height: size }}>
      <Image src={src} classNames={{ placeholder: styles.placeholder }} />
    </div>
  )
}

export default NftThumbnail
