import clsx from "clsx"
import type { PropsWithChildren } from "react"
import WidgetTooltip from "../WidgetTooltip"
import Image from "../Image"
import type { BaseChain } from "./types"
import styles from "./ChainOptions.module.css"
import IndicatorBadge from "../IndicatorBadge"

interface Props {
  label?: string
  chains: BaseChain[]
  value: string
  onSelect: (chainId: string) => void
  getShowIndicator?: (chainId: string) => boolean
}

const ChainOptions = ({ label, chains, value, onSelect, getShowIndicator }: Props) => {
  return (
    <div>
      {label && <h2 className={styles.title}>{label}</h2>}
      <div className={styles.grid}>
        {chains.map(({ chainId, name, logoUrl }) => (
          <IndicatorBadge hidden={!getShowIndicator?.(chainId)} className={styles.item}>
            <WidgetTooltip label={name} key={chainId} disableHoverableContent>
              <button
                type="button"
                className={clsx(styles.button, { [styles.active]: chainId === value })}
                onClick={() => onSelect(chainId)}
              >
                <Image src={logoUrl} width={28} height={28} circle />
              </button>
            </WidgetTooltip>
          </IndicatorBadge>
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
