import { useEffect, useMemo } from "react"
import { IconChevronDown } from "@initia/icons-react"
import type { NormalizedChain } from "@/data/chains"
import AsyncBoundary from "@/components/AsyncBoundary"
import Status from "@/components/Status"
import Loader from "@/components/Loader"
import { useWithdrawals } from "./data"
import { OpWithdrawalContext } from "./context"
import { useClaimableReminders } from "./reminder"
import WithdrawalAsset from "./WithdrawalAsset"
import WithdrawalAction from "./WithdrawalAction"
import styles from "./WithdrawalList.module.css"

const WithdrawalList = ({ chain }: { chain: NormalizedChain }) => {
  const executorUrl = chain.metadata?.executor_uri
  if (!executorUrl) throw new Error("Executor URL is not defined")

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useWithdrawals(executorUrl)
  const list = useMemo(() => data?.pages.flat() ?? [], [data])

  const { syncReminders } = useClaimableReminders()
  useEffect(() => {
    const txs = list.map((withdrawalTx) => ({
      chainId: chain.chainId,
      txHash: withdrawalTx.tx_hash,
    }))
    syncReminders(txs)
  }, [chain.chainId, list, syncReminders])

  if (!list.length) {
    return <Status>No withdrawals</Status>
  }

  return (
    <>
      {list.map((withdrawalTx) => {
        const { amount } = withdrawalTx
        return (
          <div className={styles.item} key={withdrawalTx.sequence}>
            <WithdrawalAsset {...amount} />

            <AsyncBoundary suspenseFallback={null}>
              <OpWithdrawalContext.Provider value={{ chainId: chain.chainId, withdrawalTx }}>
                <WithdrawalAction />
              </OpWithdrawalContext.Provider>
            </AsyncBoundary>
          </div>
        )
      })}

      {hasNextPage && (
        <button
          className={styles.more}
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
        >
          {isFetchingNextPage ? (
            <Loader size={14} />
          ) : (
            <>
              <span>Load more</span>
              <IconChevronDown size={14} />
            </>
          )}
        </button>
      )}
    </>
  )
}

export default WithdrawalList
