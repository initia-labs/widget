import { useManageChains } from "@/data/chains"
import List from "@/components/List"

interface Props {
  onSelect: (chainId: string) => void
}

const AddedChainList = ({ onSelect }: Props) => {
  const { addedChains } = useManageChains()
  return (
    <List
      onSelect={(item) => onSelect(item.chainId)}
      list={addedChains}
      getImage={(item) => item.logoUrl}
      getName={(item) => item.name}
      getKey={(item) => item.chainId}
    />
  )
}

export default AddedChainList
