import type { ReactNode } from "react"
import { IconChevronDown } from "@initia/icons-react"
import { formatAmount, truncate } from "@/public/utils"
import placeholder from "@/data/placeholder"
import Image from "@/components/Image"
import WidgetTooltip from "@/components/WidgetTooltip"
import CopyButton from "@/components/CopyButton"
import { useSkipAsset } from "./data/assets"
import { useSkipChain } from "./data/chains"
import styles from "./OperationItem.module.css"

interface ComponentProps extends Props {
  symbol?: string
  decimals?: number
  logo_uri?: string
}

const OperationItemComponent = (props: ComponentProps) => {
  const { source, type, amount, denom, chainId, address, walletIcon } = props
  const { symbol = truncate(denom), decimals = 0, logo_uri = placeholder } = props
  const { chain_name, pretty_name } = useSkipChain(chainId)

  return (
    <div>
      {!source && (
        <div className={styles.arrow}>
          <div className={styles.divider} />
          {type ? (
            <WidgetTooltip label={type}>
              <button className={styles.type}>
                <IconChevronDown size={16} />
              </button>
            </WidgetTooltip>
          ) : (
            <span className={styles.type}>
              <IconChevronDown size={16} />
            </span>
          )}
        </div>
      )}

      <div className={styles.content}>
        <Image src={logo_uri} width={32} height={32} />

        <div className={styles.info}>
          <div className={styles.asset}>
            <span className={styles.amount}>{formatAmount(amount, { decimals })}</span>
            <span>{symbol}</span>
          </div>

          <div className={styles.lower}>
            <div className={styles.chain}>on {pretty_name || chain_name}</div>

            {address && (
              <CopyButton value={address}>
                {({ copy, copied }) => (
                  <button className={styles.address} onClick={copy}>
                    {walletIcon}
                    <span className="monospace">{copied ? "Copied!" : truncate(address)}</span>
                  </button>
                )}
              </CopyButton>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

interface Props {
  source?: boolean
  type?: string
  amount: string
  denom: string
  chainId: string
  address: string
  walletIcon?: ReactNode
}

const OperationItem = (props: Props) => {
  const asset = useSkipAsset(props.denom, props.chainId)
  return <OperationItemComponent {...props} {...asset} />
}

OperationItem.Placeholder = OperationItemComponent

export default OperationItem
