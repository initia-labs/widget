import { intlFormatDistance } from "date-fns"
import { useEffect, useMemo } from "react"
import { useAccount } from "wagmi"
import type { StatusResponseJson } from "@skip-go/client"
import {
  IconArrowDown,
  IconArrowUpRight,
  IconCheckCircleFilled,
  IconWallet,
  IconWarningFilled,
} from "@initia/icons-react"
import { AddressUtils, formatAmount, truncate } from "@/public/utils"
import Loader from "@/components/Loader"
import Image from "@/components/Image"
import ExplorerLink from "@/components/ExplorerLink"
import { formatFees } from "./data/format"
import type { RouterChainJson } from "./data/chains"
import { useSkipChain } from "./data/chains"
import type { RouterAsset } from "./data/assets"
import { useSkipAsset } from "./data/assets"
import {
  BridgeType,
  bridgeTypeExplorerName,
  getBridgeType,
  useTrackTxQuery,
  useTxStatusQuery,
} from "./data/tx"
import type { TxIdentifier } from "./data/history"
import { useBridgeHistoryDetails } from "./data/history"
import { useCosmosWallets } from "./data/cosmos"
import styles from "./BridgeHistoryItem.module.css"

const BridgeHistoryItem = ({ tx }: { tx: TxIdentifier }) => {
  // NOTE: Do not merge history details into one list. Keep them separate.
  // Each transaction needs its own update when its state changes.
  // Managing from a parent causes hooks to re-run on state changes.
  const [details, setDetails] = useBridgeHistoryDetails(tx)
  if (!details) throw new Error("Bridge history details not found")
  const { chainId, txHash, route, values, timestamp } = details

  const { data: trackedTxHash = "" } = useTrackTxQuery(details)
  const { data: txStatus } = useTxStatusQuery({ ...details, txHash: trackedTxHash })
  const state = details.state ?? getState(txStatus)

  const { address: connectedAddress = "", connector } = useAccount()
  const { find } = useCosmosWallets()

  useEffect(() => {
    if (trackedTxHash) {
      setDetails((prev) => {
        if (!prev) throw new Error("Bridge history details not found")
        return { ...prev, tracked: true }
      })
    }
  }, [setDetails, trackedTxHash])

  useEffect(() => {
    if (state !== "loading") {
      setDetails((prev) => {
        if (!prev) throw new Error("Bridge history details not found")
        return { ...prev, tracked: true, state }
      })
    }
  }, [setDetails, state, txHash])

  const renderIcon = () => {
    switch (state) {
      case "error":
        return (
          <div className={styles.error}>
            <IconWarningFilled size={14} />
          </div>
        )

      case "success":
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

  const getWalletIcon = (address: string, isSource: boolean) => {
    if (values.cosmosWalletName && isSource) {
      return (
        <Image
          src={find(values.cosmosWalletName)?.image}
          width={12}
          height={12}
          className={styles.walletIcon}
        />
      )
    }

    if (AddressUtils.equals(address, connectedAddress))
      return <Image src={connector?.icon} width={12} height={12} className={styles.walletIcon} />

    return <IconWallet size={12} className={styles.walletIcon} />
  }

  const renderRow = (
    amount: string,
    { symbol, decimals, logo_uri }: RouterAsset,
    { chain_name, pretty_name, logo_uri: chain_logo_uri }: RouterChainJson,
    address: string,
    isSource: boolean,
  ) => {
    return (
      <div className={styles.row}>
        <div className={styles.logoContainer}>
          <Image src={logo_uri} width={32} height={32} />
          <Image
            src={chain_logo_uri || undefined}
            width={16}
            height={16}
            className={styles.chainLogo}
          />
        </div>
        <div>
          <div className={styles.asset}>
            <span className={styles.amount}>{formatAmount(amount, { decimals })}</span>
            <span>{symbol}</span>
          </div>
          <div className={styles.chain}>
            on {pretty_name || chain_name} {getWalletIcon(address, isSource)}{" "}
            <span className="monospace">{truncate(address)}</span>
          </div>
        </div>
      </div>
    )
  }

  const type = getBridgeType(route)

  const content = (
    <>
      <header className={styles.header}>
        <div className={styles.title}>
          {renderIcon()}
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
            {operations.some((operation) => "swap" in operation) && (
              <>
                <div className={styles.divider} />
                <div className={styles.item}>
                  <span>Slippage</span>
                  <span>{values.slippagePercent}%</span>
                </div>
              </>
            )}
          </div>
        </div>
        <div className={styles.explorer}>
          {bridgeTypeExplorerName[type]} <IconArrowUpRight size={12} />
        </div>
      </header>

      <div className={styles.route}>
        {renderRow(amount_in, srcAsset, srcChain, values.sender, true)}
        <div className={styles.arrow}>
          <IconArrowDown size={12} />
        </div>
        {renderRow(amount_out, dstAsset, dstChain, values.recipient, false)}
      </div>
    </>
  )

  const explorerLink = useMemo(() => {
    switch (type) {
      case BridgeType.LZ: {
        return new URL(`/tx/${txHash.toLowerCase()}`, "https://layerzeroscan.com").toString()
      }
      case BridgeType.SKIP: {
        const searchParams = new URLSearchParams({ tx_hash: txHash, chain_id: chainId })
        return new URL(`?${searchParams.toString()}`, "https://explorer.skip.build").toString()
      }
    }
  }, [chainId, txHash, type])

  if (type === BridgeType.OP_WITHDRAW) {
    return (
      <ExplorerLink chainId={chainId} txHash={txHash} className={styles.link}>
        {content}
      </ExplorerLink>
    )
  }

  return (
    <a href={explorerLink} className={styles.link} target="_blank">
      {content}
    </a>
  )
}

export default BridgeHistoryItem

function getState(data?: StatusResponseJson | null) {
  if (!data) return "loading"

  switch (data.state) {
    case "STATE_ABANDONED":
    case "STATE_COMPLETED_ERROR":
    case "STATE_PENDING_ERROR":
      return "error"

    case "STATE_COMPLETED_SUCCESS":
      return "success"

    default:
      return "loading"
  }
}
