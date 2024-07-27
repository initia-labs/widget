import clsx from "clsx"
import { useToggle } from "react-use"
import { IconCheck } from "@initia/icons-react"
import { useInitiaWidget } from "@/public/data/hooks"
import Page from "@/components/Page"
import Status from "@/components/Status"
import AsyncBoundary from "@/components/AsyncBoundary"
import type { BridgeHistory } from "./data/tx"
import { useBridgeHistory } from "./data/tx"
import BridgeHistoryItem from "./BridgeHistoryItem"
import styles from "./BridgeHistory.module.css"

const BridgeHistory = () => {
  const { initiaAddress, hexAddress } = useInitiaWidget()
  const [allHistory = []] = useBridgeHistory()
  const myHistory = allHistory.filter((item) =>
    [item.values.sender, item.values.recipient].some((address) =>
      [initiaAddress, hexAddress].includes(address),
    ),
  )

  const [showAll, toggleShowAll] = useToggle(!myHistory.length)
  const filteredHistory = showAll ? allHistory : myHistory

  return (
    <Page title="Bridge/Swap history">
      <div className={styles.list}>
        {allHistory.length > 0 && allHistory.length !== myHistory.length && (
          <header className={styles.header}>
            <button className={styles.toggle} onClick={toggleShowAll}>
              <div className={clsx(styles.checkbox, { [styles.checked]: showAll })}>
                {showAll && <IconCheck size={12} />}
              </div>
              <span>Show all transactions stored in this browser</span>
            </button>
          </header>
        )}

        {filteredHistory.length === 0 ? (
          <Status>No bridge/swap history</Status>
        ) : (
          filteredHistory.toReversed().map((item, index) => (
            <div className={styles.item} key={index}>
              <AsyncBoundary>
                <BridgeHistoryItem {...item} />
              </AsyncBoundary>
            </div>
          ))
        )}
      </div>
    </Page>
  )
}

export default BridgeHistory
