import AsyncBoundary from "@/components/AsyncBoundary"
import ChainAccordion from "../../components/ChainAccordion"
import AssetList from "./AssetList"

const Assets = () => {
  return (
    <ChainAccordion
      renderContent={(chain) => (
        <AsyncBoundary>
          <AssetList {...chain} />
        </AsyncBoundary>
      )}
      storageKey="assets"
    />
  )
}

export default Assets
