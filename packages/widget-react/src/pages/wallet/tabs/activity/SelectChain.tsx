import clsx from "clsx"
import { IconChevronDown } from "@initia/icons-react"
import { useChain } from "@/data/chains"
import ModalTrigger from "@/components/ModalTrigger"
import AddedChainList from "../../components/AddedChainList"
import styles from "./SelectChain.module.css"

interface Props {
  value: string
  onSelect: (chainId: string) => void
}

const SelectChain = ({ value, onSelect }: Props) => {
  const { name } = useChain(value)

  return (
    <ModalTrigger
      title="Select rollup"
      content={({ onClose }) => (
        <AddedChainList
          onSelect={(chainId) => {
            onSelect(chainId)
            onClose()
          }}
        />
      )}
      className={clsx("input", styles.button)}
    >
      <span>{name}</span>
      <IconChevronDown size={16} className={styles.icon} />
    </ModalTrigger>
  )
}

export default SelectChain
