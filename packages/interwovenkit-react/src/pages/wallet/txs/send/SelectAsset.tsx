import type { NormalizedChain } from "@/data/chains"
import { useSortedBalancesWithValue } from "@/data/account"
import AssetOptions from "@/components/form/AssetOptions"
import Status from "@/components/Status"
import WithMoveResource from "../../tabs/assets/WithMoveResource"

interface Props {
  chain: NormalizedChain
  onSelect: (denom: string) => void
}

const SelectAsset = ({ chain, onSelect }: Props) => {
  const balances = useSortedBalancesWithValue(chain)
  if (balances.length === 0) return <Status>No assets</Status>
  return (
    <AssetOptions
      assets={balances}
      onSelect={onSelect}
      renderAsset={(asset, children) => (
        <WithMoveResource asset={asset} chain={chain}>
          {(asset) => children(asset)}
        </WithMoveResource>
      )}
    />
  )
}

export default SelectAsset
