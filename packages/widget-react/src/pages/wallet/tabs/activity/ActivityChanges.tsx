import clsx from "clsx"
import BigNumber from "bignumber.js"
import { computeAddress } from "ethers"
import { fromBase64, toHex } from "@cosmjs/encoding"
import { formatAmount, truncate } from "@/public/utils"
import { useHexAddress } from "@/public/data/hooks"
import { denomToMetadata, useFindAsset } from "@/data/assets"
import type { NormalizedChain } from "@/data/chains"
import AsyncBoundary from "@/components/AsyncBoundary"
import WithMoveResource from "../assets/WithMoveResource"
import type { TxItem } from "./data"
import { calcChangesFromEvents } from "./calc"
import WithDenom from "./WithDenom"
import styles from "./ActivityChanges.module.css"

interface Props extends TxItem {
  chain: NormalizedChain
}

const ActivityChanges = ({ tx, events, chain }: Props) => {
  const hexAddress = useHexAddress()
  const findAsset = useFindAsset(chain)

  const signerHexAddress = computeAddress(
    `0x${toHex(fromBase64(tx.auth_info.signer_infos[0].public_key.key))}`,
  )

  const payer = tx.auth_info.fee?.payer
  const fee = tx.auth_info.fee?.amount[0] ?? { amount: "0", denom: "" }
  const isPaidByMe = signerHexAddress === hexAddress && !payer

  if (!(chain.metadata?.is_l1 || chain.metadata?.minitia?.type === "minimove")) {
    return null
  }

  const feeMetadata = denomToMetadata(fee.denom)
  const feeWithMetadata = { amount: isPaidByMe ? fee.amount : "0", metadata: feeMetadata }
  const changes = calcChangesFromEvents(events, feeWithMetadata, hexAddress)

  return changes.map(({ amount, metadata }, index) => {
    const isPositive = new BigNumber(amount).isPositive()
    const absAmount = new BigNumber(amount).abs().toString()
    return (
      <AsyncBoundary suspenseFallback={null} errorFallbackRender={() => null} key={index}>
        <WithDenom metadata={metadata} chain={chain}>
          {(denom) => (
            <WithMoveResource asset={findAsset(denom)} chain={chain}>
              {({ denom, symbol, decimals }) => (
                <div
                  className={clsx(styles.change, isPositive ? styles.positive : styles.negative)}
                >
                  {isPositive ? "+" : "-"}
                  {formatAmount(absAmount, { decimals })} {symbol ?? truncate(denom)}
                </div>
              )}
            </WithMoveResource>
          )}
        </WithDenom>
      </AsyncBoundary>
    )
  })
}

export default ActivityChanges
