import clsx from "clsx"
import type { PropsWithChildren } from "react"
import WidgetTooltip from "../WidgetTooltip"
import Image from "../Image"
import type { BaseChain } from "./types"
import styles from "./ChainOptions.module.css"

interface Props {
  label?: string
  chains: BaseChain[]
  value: string
  onSelect: (chainId: string) => void
  getReminder?: (chainId: string) => boolean
}

const ChainOptions = ({ label, chains, value, onSelect, getReminder }: Props) => {
  return (
    <div>
      {label && <h2 className={styles.title}>{label}</h2>}
      <div className={styles.grid}>
        {chains.map(({ chainId, name, logoUrl }) => (
          <WidgetTooltip label={name} key={chainId} disableHoverableContent>
            <button
              type="button"
              className={clsx(styles.item, { [styles.active]: chainId === value })}
              onClick={() => onSelect(chainId)}
            >
              <Image src={logoUrl} width={28} height={28} circle />
              {getReminder?.(chainId) && <div className={styles.badge} />}
            </button>
          </WidgetTooltip>
        ))}
      </div>
    </div>
  )
}

const ChainOptionsStack = ({ children }: PropsWithChildren) => {
  return <div className={styles.stack}>{children}</div>
}

ChainOptions.Stack = ChainOptionsStack

export default ChainOptions
