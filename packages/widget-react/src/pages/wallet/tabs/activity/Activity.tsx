import { useState } from "react"
import { useChain } from "@/data/chains"
import { useConfig } from "@/data/config"
import AsyncBoundary from "@/components/AsyncBoundary"
import SelectChain from "./SelectChain"
import ActivityList from "./ActivityList"

const Activity = () => {
  const { defaultChainId } = useConfig()
  const [selectedChainId, setSelectedChainId] = useState(defaultChainId)
  const selectedChain = useChain(selectedChainId)

  return (
    <>
      <SelectChain value={selectedChainId} onSelect={setSelectedChainId} />

      <AsyncBoundary key={selectedChainId}>
        <ActivityList chain={selectedChain} />
      </AsyncBoundary>
    </>
  )
}

export default Activity
