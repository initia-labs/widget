import { useState } from "react"
import { useManageChains } from "@/data/chains"
import Page from "@/components/Page"
import { filterBySearch } from "@/components/form/search"
import SearchInput from "@/components/form/SearchInput"
import Status from "@/components/Status"
import ManageChainsItem from "./ManageChainsItem"
import styles from "./ManageChains.module.css"

const ManageChains = () => {
  const [search, setSearch] = useState("")
  const { chains, addedChains, notAddedChains } = useManageChains()
  const filteredChains = filterBySearch(["chainId", "name"], search, chains)

  return (
    <Page title="Manage rollup list">
      <div className={styles.content}>
        <SearchInput value={search} onChange={setSearch} className={styles.search} />

        {!search ? (
          <>
            <div className={styles.list}>
              <h2 className={styles.title}>
                <span>Shown</span>
                <span className={styles.count}>({addedChains.length})</span>
              </h2>
              {addedChains.map((chain) => (
                <ManageChainsItem {...chain} key={chain.chainId} />
              ))}
            </div>

            <div className={styles.list}>
              <h2 className={styles.title}>
                <span>Hidden</span>
                <span className={styles.count}>({notAddedChains.length})</span>
              </h2>
              {notAddedChains.map((chain) => (
                <ManageChainsItem {...chain} key={chain.chainId} />
              ))}
            </div>
          </>
        ) : filteredChains.length === 0 ? (
          <Status>No chains</Status>
        ) : (
          filteredChains.map((chain) => <ManageChainsItem {...chain} key={chain.chainId} />)
        )}
      </div>
    </Page>
  )
}

export default ManageChains
