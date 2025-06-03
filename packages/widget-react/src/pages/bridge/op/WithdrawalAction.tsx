import { isFuture } from "date-fns"
import WithIsSubmitted from "./WithIsSubmitted"
import WithdrawalSubmitted from "./WithdrawalSubmitted"
import WithClaimableDate from "./WithClaimableDate"
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
              ) : isFuture(date) ? (
                <Countdown date={date} />
              ) : (
                <ClaimButton />
              )
            }
          </WithClaimableDate>
        )
      }
    </WithIsSubmitted>
  )
}

export default WithdrawalAction
