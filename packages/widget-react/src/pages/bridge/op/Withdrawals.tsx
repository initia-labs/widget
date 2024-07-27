import { useState } from "react"
import { useDefaultChain, useFindChain, useInitiaRegistry } from "@/data/chains"
import Page from "@/components/Page"
import FormHelp from "@/components/form/FormHelp"
import AsyncBoundary from "@/components/AsyncBoundary"
import ChainOptions from "@/components/form/ChainOptions"
import WithdrawalList from "./WithdrawalList"
import styles from "./Withdrawals.module.css"

const Withdrawals = () => {
  const chains = useInitiaRegistry()
  const defaultChain = useDefaultChain()
  const [chainId, setChainId] = useState(defaultChain.metadata?.is_l1 ? "" : defaultChain.chainId)
  const findChain = useFindChain()
  const chain = chainId ? findChain(chainId) : undefined

  return (
    <Page title="Optimistic bridge withdrawals">
      <ChainOptions
        chains={chains.filter(({ metadata }) => !metadata?.is_l1 && metadata?.executor_uri)}
        value={chainId}
        onSelect={setChainId}
      />

      <div className={styles.content}>
        {!chain ? (
          <FormHelp level="info">
            Select a chain to display your optimistic bridge withdrawals
          </FormHelp>
        ) : (
          <>
            <h2 className={styles.title}>{chain.name}</h2>
            <AsyncBoundary key={chainId}>
              <WithdrawalList chain={chain} />
            </AsyncBoundary>
          </>
        )}
      </div>
    </Page>
  )
}

export default Withdrawals
