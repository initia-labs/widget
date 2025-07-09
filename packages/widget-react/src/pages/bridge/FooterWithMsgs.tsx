import type { ReactNode } from "react"
import useAsync from "react-use/lib/useAsync"
import type { MsgsResponseJson, TxJson } from "@skip-go/client"
import Footer from "@/components/Footer"
import Button from "@/components/Button"
import { useSkip } from "./data/skip"
import type { SignedOpHook } from "./data/tx"
import { useBridgePreviewState } from "./data/tx"
import FooterWithError from "./FooterWithError"

interface Props {
  addressList: string[]
  signedOpHook?: SignedOpHook
  children: (data: TxJson) => ReactNode
}

const FooterWithMsgs = ({ addressList, signedOpHook, children }: Props) => {
  const skip = useSkip()
  const { route, values } = useBridgePreviewState()

  const { value, loading, error } = useAsync(async () => {
    if (route.required_op_hook && !signedOpHook) {
      throw new Error("Op hook is required")
    }

    const params = {
      address_list: addressList,
      amount_in: route.amount_in,
      amount_out: route.amount_out,
      source_asset_chain_id: route.source_asset_chain_id,
      source_asset_denom: route.source_asset_denom,
      dest_asset_chain_id: route.dest_asset_chain_id,
      dest_asset_denom: route.dest_asset_denom,
      slippage_tolerance_percent: values.slippagePercent,
      operations: route.operations,
      signed_op_hook: signedOpHook,
    }

    const { txs } = await skip.post("v2/fungible/msgs", { json: params }).json<MsgsResponseJson>()
    if (!txs || txs.length === 0) throw new Error("No transaction data found")
    const [tx] = txs
    return tx
  })

  if (error) {
    return <FooterWithError error={error} />
  }

  if (loading) {
    return (
      <Footer>
        <Button.White loading={loading && "Fetching messages..."} />
      </Footer>
    )
  }

  if (value) {
    return children(value)
  }

  return <FooterWithError error={new Error("Failed to fetch messages")} />
}

export default FooterWithMsgs
