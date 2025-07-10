import type { NormalizedChain } from "@/data/chains"
import Status from "@/components/Status"
import { useCollections } from "./queries"
import CollectionItem from "./CollectionItem"
import styles from "./CollectionList.module.css"

const CollectionList = ({ chain }: { chain: NormalizedChain }) => {
  const collections = useCollections(chain)

  if (!collections.length) {
    return <Status>No collections</Status>
  }

  return (
    <div className={styles.list}>
      {collections.map((collection) => (
        <CollectionItem collection={collection} chain={chain} key={collection.object_addr} />
      ))}
    </div>
  )
}

export default CollectionList
