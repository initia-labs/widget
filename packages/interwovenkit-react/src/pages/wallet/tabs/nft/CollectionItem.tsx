import { IconChevronRight } from "@initia/icons-react"
import { Link } from "@/lib/router"
import type { NormalizedChain } from "@/data/chains"
import { parsePaginatedResponse } from "@/data/pagination"
import { useNfts, type NormalizedCollection } from "./queries"
import WithNormalizedNft from "./WithNormalizedNft"
import NftThumbnail from "./NftThumbnail"
import styles from "./CollectionItem.module.css"

interface Props {
  chain: NormalizedChain
  collection: NormalizedCollection
}

const CollectionItem = ({ chain, collection }: Props) => {
  const { data } = useNfts({ chain, collection })
  const { list, count } = parsePaginatedResponse("tokens", data)
  const [primaryToken] = list

  return (
    <Link className={styles.item} to="/collection" state={{ collection, chain }}>
      {primaryToken && (
        <WithNormalizedNft nftResponse={primaryToken}>
          {(nft) => <NftThumbnail chain={chain} collection={collection} nft={nft} size={58} />}
        </WithNormalizedNft>
      )}

      <div className={styles.content}>
        <div className={styles.name}>{collection.name}</div>
        {count > 0 && <div className={styles.count}>{count}</div>}
      </div>

      <div className={styles.chevron}>
        <IconChevronRight />
      </div>
    </Link>
  )
}

export default CollectionItem
