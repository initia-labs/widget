import { isFuture } from "date-fns"
import type { WithdrawalTx } from "./data"
import WithIsSubmitted from "./WithIsSubmitted"
import WithdrawalSubmitted from "./WithdrawalSubmitted"
import WithWithdrawableDate from "./WithWithdrawableDate"
import WithdrawButton from "./WithdrawButton"
import Countdown from "./Countdown"

const WithdrawalAction = ({ withdrawalTx }: { withdrawalTx: WithdrawalTx }) => {
  return (
    <WithIsSubmitted withdrawalTx={withdrawalTx}>
      {(isSubmitted) =>
        isSubmitted ? (
          <WithdrawalSubmitted />
        ) : (
          <WithWithdrawableDate withdrawalTx={withdrawalTx}>
            {(date) =>
              !date ? (
                <WithdrawalSubmitted />
              ) : isFuture(date) ? (
                <Countdown date={date} />
              ) : (
                <WithdrawButton withdrawalTx={withdrawalTx} />
              )
            }
          </WithWithdrawableDate>
        )
      }
    </WithIsSubmitted>
  )
}

export default WithdrawalAction
