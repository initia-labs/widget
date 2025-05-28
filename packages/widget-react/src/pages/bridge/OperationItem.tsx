import type { ReactNode } from "react"
import { IconChevronDown } from "@initia/icons-react"
import { formatAmount, truncate } from "@/public/utils"
import placeholder from "@/data/placeholder"
import Loader from "@/components/Loader"
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
  const { isStepAbandonedOrFailed, isStepPending, isStepSuccessful } = props
  const { symbol = truncate(denom), decimals = 0, logo_uri = placeholder } = props
  const { chain_name, pretty_name } = useSkipChain(chainId)

  const renderStepState = () => {
    if (isStepAbandonedOrFailed) return <div className={styles.error} />
    if (isStepPending) return <Loader size={36} color="var(--success)" border={2} />
    if (isStepSuccessful) return <div className={styles.success} />
  }

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
        <div className={styles.icon}>
          {renderStepState()}
          <Image src={logo_uri} width={32} height={32} className={styles.image} />
        </div>

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
                    <span>{copied ? "Copied!" : truncate(address)}</span>
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

  isStepAbandonedOrFailed?: boolean
  isStepPending?: boolean
  isStepSuccessful?: boolean
}

const OperationItem = (props: Props) => {
  const asset = useSkipAsset(props.denom, props.chainId)
  return <OperationItemComponent {...props} {...asset} />
}

OperationItem.Placeholder = OperationItemComponent

export default OperationItem
