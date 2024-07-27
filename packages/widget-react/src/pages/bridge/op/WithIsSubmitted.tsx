import type { ReactNode } from "react"
import type { WithdrawalTx } from "./data"
import { useLatestOutput } from "./data"

interface Props {
  withdrawalTx: WithdrawalTx
  children: (cond: boolean) => ReactNode
}

const WithIsSubmitted = ({ withdrawalTx, children }: Props) => {
  const latest = useLatestOutput(withdrawalTx.bridge_id)
  const isSubmitted = withdrawalTx.output_index > Number(latest?.output_index)
  return children(isSubmitted)
}

export default WithIsSubmitted
