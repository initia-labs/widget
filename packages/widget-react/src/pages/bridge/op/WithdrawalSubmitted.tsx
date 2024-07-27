import { IconQuestionFilled } from "@initia/icons-react"
import WidgetTooltip from "@/components/WidgetTooltip"
import styles from "./WithdrawalSubmitted.module.css"

const DESCRIPTION =
  "Your withdrawal request is being processed, and time remaining will show up once it is in queue."

const WithdrawalSubmitted = () => {
  return (
    <div className={styles.submitted}>
      <span>Withdrawal submitted</span>
      <WidgetTooltip label={DESCRIPTION}>
        <span className={styles.icon}>
          <IconQuestionFilled size={12} />
        </span>
      </WidgetTooltip>
    </div>
  )
}

export default WithdrawalSubmitted
