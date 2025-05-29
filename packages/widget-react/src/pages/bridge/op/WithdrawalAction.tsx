import { isFuture } from "date-fns"
import type { WithdrawalTx } from "./data"
import WithIsSubmitted from "./WithIsSubmitted"
import WithdrawalSubmitted from "./WithdrawalSubmitted"
import WithClaimableDate from "./WithClaimableDate"
import ClaimButton from "./ClaimButton"
import Countdown from "./Countdown"

const WithdrawalAction = ({ withdrawalTx }: { withdrawalTx: WithdrawalTx }) => {
  return (
    <WithIsSubmitted withdrawalTx={withdrawalTx}>
      {(isSubmitted) =>
        isSubmitted ? (
          <WithdrawalSubmitted />
        ) : (
          <WithClaimableDate withdrawalTx={withdrawalTx}>
            {(date) =>
              !date ? (
                <WithdrawalSubmitted />
              ) : isFuture(date) ? (
                <Countdown date={date} />
              ) : (
                <ClaimButton withdrawalTx={withdrawalTx} />
              )
            }
          </WithClaimableDate>
        )
      }
    </WithIsSubmitted>
  )
}

export default WithdrawalAction
