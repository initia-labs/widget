import { zipObj } from "ramda"
import { IconWallet } from "@initia/icons-react"
import { useConfig } from "@/data/config"
import AsyncBoundary from "@/components/AsyncBoundary"
import Image from "@/components/Image"
import type { RouterOperationJson } from "./data/simulate"
import { useBridgePreviewState, useTxStatusQuery } from "./data/tx"
import { useCosmosWallets } from "./data/cosmos"
import OperationItem from "./OperationItem"
import styles from "./BridgePreviewRoute.module.css"

function normalizeOperation(operation: RouterOperationJson) {
  if ("transfer" in operation) {
    return { type: "transfer", ...operation, ...operation.transfer }
  }
  if ("bank_send" in operation) {
    return { type: "bank_send", ...operation, ...operation.bank_send }
  }
  if ("swap" in operation) {
    return { type: "swap", ...operation, ...operation.swap }
  }
  if ("axelar_transfer" in operation) {
    return { type: "axelar_transfer", ...operation, ...operation.axelar_transfer }
  }
  if ("cctp_transfer" in operation) {
    return { type: "cctp_transfer", ...operation, ...operation.cctp_transfer }
  }
  if ("hyperlane_transfer" in operation) {
    return { type: "hyperlane_transfer", ...operation, ...operation.hyperlane_transfer }
  }
  if ("evm_swap" in operation) {
    return { type: "evm_swap", ...operation, ...operation.evm_swap }
  }
  if ("op_init_transfer" in operation) {
    return { type: "op_init_transfer", ...operation, ...operation.op_init_transfer }
  }
  if ("go_fast_transfer" in operation) {
    return { type: "go_fast_transfer", ...operation, ...operation.go_fast_transfer }
  }
  if ("eureka_transfer" in operation) {
    return { type: "eureka_transfer", ...operation, ...operation.eureka_transfer }
  }
  if ("stargate_transfer" in operation) {
    return { type: "stargate_transfer", ...operation, ...operation.stargate_transfer }
  }
  if ("lz_transfer" in operation) {
    return { type: "lz_transfer", ...operation, ...operation.lz_transfer }
  }
  throw new Error("Unknown operation type")
}

interface Props {
  addressList: string[]
  trackedTxHash?: string
}

const BridgePreviewRoute = ({ addressList, trackedTxHash }: Props) => {
  const { values, route } = useBridgePreviewState()
  const { source_asset_denom, source_asset_chain_id, amount_in, operations } = route
  const addressMap = zipObj(route.required_chain_addresses, addressList)
  const { data: txStatus } = useTxStatusQuery(values.srcChainId, trackedTxHash, route)

  const { find } = useCosmosWallets()
  const { wallet } = useConfig()

  const getFirstOperationProps = () => {
    const props = {
      amount: amount_in,
      denom: source_asset_denom,
      chainId: source_asset_chain_id,
      address: values.sender,
      walletIcon: (
        <Image
          src={values.cosmosWalletName ? find(values.cosmosWalletName)?.image : wallet?.meta.icon}
          width={12}
          height={12}
        />
      ),
    }

    if (!txStatus) return props

    const isTransactionSuccessful = txStatus.state === "STATE_COMPLETED_SUCCESS"
    const nextBlockingIndex = txStatus.next_blocking_transfer?.transfer_sequence_index ?? -1

    return {
      ...props,
      isStepAbandonedOrFailed: false,
      isStepPending: false,
      isStepSuccessful: isTransactionSuccessful || nextBlockingIndex > -1,
    }
  }

  const toProps = (normalizedOperation: ReturnType<typeof normalizeOperation>, index: number) => {
    // prettier-ignore
    // @ts-expect-error Skip API's response structure is too complicated
    const { type, amount_out, denom, denom_out = denom, chain_id, to_chain_id = chain_id } = normalizedOperation
    const address = addressMap[to_chain_id]
    const props = {
      type,
      amount: amount_out,
      denom: denom_out,
      chainId: to_chain_id,
      address,
      walletIcon: index === operations.length - 1 ? <IconWallet size={11} /> : null,
    }

    if (!txStatus) return props

    const isTransactionSuccessful = txStatus.state === "STATE_COMPLETED_SUCCESS"
    const isTransactionFailed = txStatus.state === "STATE_COMPLETED_ERROR"
    const isTransactionAbandoned = txStatus.state === "STATE_ABANDONED"
    const nextBlockingIndex = txStatus.next_blocking_transfer?.transfer_sequence_index ?? -1
    const totalSteps = txStatus.transfer_sequence.length

    const isStepAbandonedOrFailed =
      (isTransactionAbandoned || isTransactionFailed) &&
      (index === nextBlockingIndex || (index === totalSteps - 1 && isTransactionFailed))
    const isStepPending =
      index === nextBlockingIndex && !isTransactionFailed && !isTransactionAbandoned
    const isStepSuccessful = isTransactionSuccessful || index < nextBlockingIndex
    return { ...props, isStepAbandonedOrFailed, isStepPending, isStepSuccessful }
  }

  const operationProps = [
    getFirstOperationProps(),
    ...operations.map(normalizeOperation).map(toProps),
  ]

  return (
    <div className={styles.route}>
      {operationProps.map((props, index) => (
        <AsyncBoundary suspenseFallback={null} key={index}>
          <OperationItem {...props} />
        </AsyncBoundary>
      ))}
    </div>
  )
}

export default BridgePreviewRoute
