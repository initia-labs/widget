import { isFuture } from "date-fns"
import WithIsSubmitted from "./WithIsSubmitted"
import WithdrawalSubmitted from "./WithdrawalSubmitted"
import WithClaimableDate from "./WithClaimableDate"
import WithUpdateReminder from "./WithUpdateReminder"
import ClaimButton from "./ClaimButton"
import Countdown from "./Countdown"

const WithdrawalAction = () => {
  return (
    <WithIsSubmitted>
      {(isSubmitted) =>
        isSubmitted ? (
          <WithdrawalSubmitted />
        ) : (
          <WithClaimableDate>
            {(date) =>
              !date ? (
                <WithdrawalSubmitted />
              ) : (
                <WithUpdateReminder date={date}>
                  {isFuture(date) ? <Countdown date={date} /> : <ClaimButton />}
                </WithUpdateReminder>
              )
            }
          </WithClaimableDate>
        )
      }
    </WithIsSubmitted>
  )
}

export default WithdrawalAction
