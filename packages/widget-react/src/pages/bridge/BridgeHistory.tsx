import { useToggle } from "react-use"
import { useInitiaWidget } from "@/public/data/hooks"
import { LocalStorageKey } from "@/data/constants"
import Page from "@/components/Page"
import Status from "@/components/Status"
import AsyncBoundary from "@/components/AsyncBoundary"
import CheckboxButton from "@/components/CheckboxButton"
import type { BridgeHistoryDetailedItem } from "./data/tx"
import { useBridgeHistory } from "./data/tx"
import BridgeHistoryItem from "./BridgeHistoryItem"
import styles from "./BridgeHistory.module.css"

const BridgeHistory = () => {
  const { initiaAddress, hexAddress } = useInitiaWidget()
  const [allHistory = []] = useBridgeHistory()
  const myHistory = allHistory.filter(({ chainId, txHash }) => {
    const storedHistoryItem = localStorage.getItem(
      `${LocalStorageKey.BRIDGE_HISTORY}:${chainId}:${txHash}`,
    )
    if (!storedHistoryItem) return false
    const { values } = JSON.parse(storedHistoryItem) as BridgeHistoryDetailedItem
    return [values.sender, values.recipient].some((address) =>
      [initiaAddress, hexAddress].includes(address),
    )
  })

  const [showAll, toggleShowAll] = useToggle(!myHistory.length)
  const filteredHistory = showAll ? allHistory : myHistory

  return (
    <Page title="Bridge/Swap history">
      <div className={styles.list}>
        {allHistory.length > 0 && allHistory.length !== myHistory.length && (
          <header className={styles.header}>
            <CheckboxButton
              checked={showAll}
              onClick={toggleShowAll}
              label="Show all transactions stored in this browser"
              className={styles.checkbox}
            />
          </header>
        )}

        {filteredHistory.length === 0 ? (
          <Status>No bridge/swap history</Status>
        ) : (
          filteredHistory.map((historyItem, index) => (
            <div className={styles.item} key={index}>
              <AsyncBoundary>
                <BridgeHistoryItem {...historyItem} />
              </AsyncBoundary>
            </div>
          ))
        )}
      </div>
    </Page>
  )
}

export default BridgeHistory
