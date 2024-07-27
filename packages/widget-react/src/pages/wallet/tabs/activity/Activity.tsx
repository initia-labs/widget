import { useState } from "react"
import { useChain } from "@/data/chains"
import { useConfig } from "@/data/config"
import AsyncBoundary from "@/components/AsyncBoundary"
import FlexEnd from "@/components/FlexEnd"
import SelectChain from "./SelectChain"
import ActivityList from "./ActivityList"

const Activity = () => {
  const { defaultChainId } = useConfig()
  const [selectedChainId, setSelectedChainId] = useState(defaultChainId)
  const selectedChain = useChain(selectedChainId)

  return (
    <>
      <FlexEnd>
        <SelectChain value={selectedChainId} onSelect={setSelectedChainId} />
      </FlexEnd>

      <AsyncBoundary key={selectedChainId}>
        <ActivityList chain={selectedChain} />
      </AsyncBoundary>
    </>
  )
}

export default Activity
