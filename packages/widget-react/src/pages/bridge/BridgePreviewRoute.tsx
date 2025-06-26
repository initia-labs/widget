import { zipObj } from "ramda"
import { useToggle } from "react-use"
import { Collapsible } from "radix-ui"
import { useAccount } from "wagmi"
import { IconWallet } from "@initia/icons-react"
import type { OperationJson } from "@skip-go/client"
import { AddressUtils } from "@/public/utils"
import AsyncBoundary from "@/components/AsyncBoundary"
import CheckboxButton from "@/components/CheckboxButton"
import Image from "@/components/Image"
import { useBridgePreviewState } from "./data/tx"
import { useCosmosWallets } from "./data/cosmos"
import OperationItem from "./OperationItem"
import styles from "./BridgePreviewRoute.module.css"

function normalizeOperation(operation: OperationJson) {
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
  if ("layer_zero_transfer" in operation) {
    return { type: "layer_zero_transfer", ...operation, ...operation.layer_zero_transfer }
  }
  throw new Error("Unknown operation type")
}

interface Props {
  addressList: string[]
}

const BridgePreviewRoute = ({ addressList }: Props) => {
  const { values, route } = useBridgePreviewState()
  const { source_asset_denom, source_asset_chain_id, amount_in, operations } = route
  const addressMap = zipObj(route.required_chain_addresses, addressList)

  const { find } = useCosmosWallets()
  const { connector, address: connectedAddress = "" } = useAccount()

  const [showAll, toggleShowAll] = useToggle(false)
  const canToggleShowAll = operations.length > 1

  const connectedWalletIcon = (
    <Image
      src={values.cosmosWalletName ? find(values.cosmosWalletName)?.image : connector?.icon}
      width={12}
      height={12}
    />
  )

  const firstOperationProps = {
    amount: amount_in,
    denom: source_asset_denom,
    chainId: source_asset_chain_id,
    address: values.sender,
    walletIcon: connectedWalletIcon,
  }

  const getWalletIcon = (address: string) => {
    if (AddressUtils.equals(address, connectedAddress)) return connectedWalletIcon
    return <IconWallet size={11} />
  }

  const toProps = (normalizedOperation: ReturnType<typeof normalizeOperation>, index: number) => {
    // prettier-ignore
    // @ts-expect-error Skip API's response structure is too complicated
    const { type, amount_out, denom, denom_out = denom, chain_id, to_chain_id = chain_id } = normalizedOperation
    const address = addressMap[to_chain_id]
    return {
      type: canToggleShowAll && !showAll ? undefined : type,
      amount: amount_out,
      denom: denom_out,
      chainId: to_chain_id,
      address,
      walletIcon: index === operations.length - 1 ? getWalletIcon(address) : null,
    }
  }

  const operationProps = operations.map(normalizeOperation).map(toProps)
  const intermediateOperations = operationProps.slice(0, -1)
  const lastOperationProps = operationProps[operationProps.length - 1]

  return (
    <Collapsible.Root className={styles.root} open={showAll} onOpenChange={toggleShowAll}>
      {canToggleShowAll && (
        <Collapsible.Trigger asChild>
          <CheckboxButton checked={showAll} onClick={toggleShowAll} label="Show details" />
        </Collapsible.Trigger>
      )}

      <div className={styles.route}>
        <OperationItem {...firstOperationProps} source />

        <Collapsible.Content className={styles.content}>
          {intermediateOperations.map((props, index) => (
            <AsyncBoundary
              suspenseFallback={<OperationItem.Placeholder {...props} />}
              errorBoundaryProps={{ fallback: <OperationItem.Placeholder {...props} /> }}
              key={index}
            >
              <OperationItem {...props} />
            </AsyncBoundary>
          ))}
        </Collapsible.Content>

        <OperationItem {...lastOperationProps} />
      </div>
    </Collapsible.Root>
  )
}

export default BridgePreviewRoute
