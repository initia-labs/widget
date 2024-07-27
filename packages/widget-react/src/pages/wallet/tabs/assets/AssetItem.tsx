import BigNumber from "bignumber.js"
import { formatAmount, formatNumber } from "@/public/utils"
import type { BaseAsset } from "@/components/form/types"
import Image from "@/components/Image"
import styles from "./AssetItem.module.css"

const AssetItem = (props: BaseAsset) => {
  const { symbol, name, logoUrl, decimals, balance = "0", value = 0 } = props

  return (
    <div className={styles.asset}>
      <Image
        src={logoUrl}
        width={24}
        height={24}
        placeholder={
          <div className={styles.placeholder} style={{ width: 24, height: 24 }}>
            ?
          </div>
        }
      />

      <div className={styles.token}>
        <div className={styles.symbol}>{symbol}</div>
        {name && <div className={styles.name}>{name}</div>}
      </div>

      {BigNumber(balance).gt(0) && (
        <div className={styles.balance}>
          <div className={styles.amount}>{formatAmount(balance, { decimals })}</div>
          {value > 0 && <div className={styles.value}>${formatNumber(value)}</div>}
        </div>
      )}
    </div>
  )
}

export default AssetItem
