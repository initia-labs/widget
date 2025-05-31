import { useMemo } from "react"
import { intlFormatDistance } from "date-fns"
import { IconArrowDown, IconCheckCircleFilled, IconWarningFilled } from "@initia/icons-react"
import { formatAmount, truncate } from "@/public/utils"
import Loader from "@/components/Loader"
import Image from "@/components/Image"
import { formatFees } from "./data/format"
import type { RouterChainJson } from "./data/chains"
import { useSkipChain } from "./data/chains"
import type { RouterAsset } from "./data/assets"
import { useSkipAsset } from "./data/assets"
import type { BridgeHistory } from "./data/tx"
import { useTxStatusQuery } from "./data/tx"
import styles from "./BridgeHistoryItem.module.css"

const BridgeHistoryItem = ({ timestamp, chainId, txHash, route, values }: BridgeHistory) => {
  const { data } = useTxStatusQuery(chainId, txHash, route)

  const renderIcon = () => {
    if (!data) {
      return <Loader size={14} />
    }

    switch (data.state) {
      case "STATE_ABANDONED":
      case "STATE_COMPLETED_ERROR":
      case "STATE_PENDING_ERROR":
        return (
          <div className={styles.error}>
            <IconWarningFilled size={14} />
          </div>
        )

      case "STATE_SUBMITTED":
      case "STATE_PENDING":
        return <Loader size={14} />

      case "STATE_COMPLETED_SUCCESS":
        return (
          <div className={styles.success}>
            <IconCheckCircleFilled size={14} />
          </div>
        )

      default:
        return <Loader size={14} />
    }
  }

  const {
    amount_in,
    amount_out,
    source_asset_chain_id: srcChainId,
    source_asset_denom: srcDenom,
    dest_asset_chain_id: dstChainId,
    dest_asset_denom: dstDenom,
    operations,
    estimated_fees = [],
  } = route

  const srcChain = useSkipChain(srcChainId)
  const dstChain = useSkipChain(dstChainId)
  const srcAsset = useSkipAsset(srcDenom, srcChainId)
  const dstAsset = useSkipAsset(dstDenom, dstChainId)

  const renderRow = (
    amount: string,
    { symbol, decimals, logo_uri }: RouterAsset,
    { chain_name, pretty_name }: RouterChainJson,
    address: string,
  ) => {
    return (
      <div className={styles.row}>
        <Image src={logo_uri} width={32} height={32} />
        <div>
          <div className={styles.asset}>
            <span className={styles.amount}>{formatAmount(amount, { decimals })}</span>
            <span>{symbol}</span>
          </div>
          <div className={styles.chain}>
            on {pretty_name || chain_name} ({truncate(address)})
          </div>
        </div>
      </div>
    )
  }

  const type = useMemo(() => {
    if (operations.some((operation) => "lz_transfer" in operation)) return "lz"
    if (operations.some((operation) => "op_init_transfer" in operation)) return "op"
    return "skip"
  }, [operations])

  const explorerLink = useMemo(() => {
    if (type === "lz")
      return new URL(`/tx/${txHash.toLowerCase()}`, "https://layerzeroscan.com").toString()
    const searchParams = new URLSearchParams({ tx_hash: txHash, chain_id: chainId })
    return new URL(`?${searchParams.toString()}`, "https://explorer.skip.build").toString()
  }, [chainId, txHash, type])

  const badge = useMemo(() => {
    switch (type) {
      case "lz":
        return "LayerZero"
      case "op":
        return "Optimistic bridge"
      default:
        return "Skip"
    }
  }, [type])

  return (
    <a href={explorerLink} className={styles.link} target="_blank">
      <header className={styles.header}>
        <div className={styles.title}>
          {renderIcon()}
          <span className={styles.badge}>{badge}</span>
        </div>
        <div className={styles.meta}>
          <div>{intlFormatDistance(new Date(timestamp), new Date(), { locale: "en-US" })}</div>
          {estimated_fees.length > 0 && (
            <>
              <div className={styles.divider} />
              <div className={styles.item}>
                <span>Fee</span>
                <span>{formatFees(estimated_fees)}</span>
              </div>
            </>
          )}
          <div className={styles.divider} />
          <div className={styles.item}>
            <span>Slippage</span>
            <span>{values.slippagePercent}%</span>
          </div>
        </div>
      </header>

      <div className={styles.route}>
        {renderRow(amount_in, srcAsset, srcChain, values.sender)}
        <div className={styles.arrow}>
          <IconArrowDown size={12} />
        </div>
        {renderRow(amount_out, dstAsset, dstChain, values.recipient)}
      </div>
    </a>
  )
}

export default BridgeHistoryItem
