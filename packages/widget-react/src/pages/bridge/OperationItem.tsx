import { IconChevronDown, IconCopy } from "@initia/icons-react"
import { formatAmount, truncate } from "@/public/utils"
import Loader from "@/components/Loader"
import Image from "@/components/Image"
import WidgetTooltip from "@/components/WidgetTooltip"
import CopyButton from "@/components/CopyButton"
import { useSkipAsset } from "./data/assets"
import { useSkipChain } from "./data/chains"
import styles from "./OperationItem.module.css"

interface Props {
  type?: string
  amount: string
  denom: string
  chainId: string
  address: string

  isStepAbandonedOrFailed?: boolean
  isStepPending?: boolean
  isStepSuccessful?: boolean
}

const OperationItem = ({ type, amount, denom, chainId, address, ...props }: Props) => {
  const { isStepAbandonedOrFailed, isStepPending, isStepSuccessful } = props
  const { chain_name, pretty_name } = useSkipChain(chainId)
  const { symbol, decimals, logo_uri } = useSkipAsset(denom, chainId)

  const renderStepState = () => {
    if (isStepAbandonedOrFailed) return <div className={styles.error} />
    if (isStepPending) return <Loader size={36} color="var(--success)" border={2} />
    if (isStepSuccessful) return <div className={styles.success} />
  }

  return (
    <div>
      {type && (
        <div className={styles.arrow}>
          <div className={styles.divider} />
          <WidgetTooltip label={type}>
            <button className={styles.button}>
              <IconChevronDown size={16} />
            </button>
          </WidgetTooltip>
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
                    <span>{copied ? "Copied!" : truncate(address)}</span>
                    <IconCopy size={11} />
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

export default OperationItem
