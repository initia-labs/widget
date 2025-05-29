import { addSeconds } from "date-fns"
import { useMemo, type ReactNode } from "react"
import { useOpBridge, useOutput, type WithdrawalTx } from "./data"

interface Props {
  withdrawalTx: WithdrawalTx
  children: (date: Date | null) => ReactNode
}

const WithClaimableDate = ({ withdrawalTx, children }: Props) => {
  const bridge = useOpBridge(withdrawalTx.bridge_id)
  const output = useOutput(withdrawalTx)

  const claimableDate = useMemo(() => {
    if (!output) return null
    const { bridge_config } = bridge
    const { output_proposal } = output
    return addSeconds(
      new Date(output_proposal.l1_block_time),
      parseFloat(bridge_config.finalization_period),
    )
  }, [bridge, output])

  return children(claimableDate)
}

export default WithClaimableDate
