import { IconInfoFilled } from "@initia/icons-react"
import WidgetTooltip from "@/components/WidgetTooltip"
import styles from "./WithdrawalCountdown.module.css"
import Countdown from "./Countdown"

const DESCRIPTION = "This is the time remaining before you can claim your Op withdrawal request."

const WithdrawalCountdown = ({ date }: { date: Date }) => {
  return (
    <div className={styles.submitted}>
      <Countdown date={date} />
      <WidgetTooltip label={DESCRIPTION}>
        <span className={styles.icon}>
          <IconInfoFilled size={12} />
        </span>
      </WidgetTooltip>
    </div>
  )
}

export default WithdrawalCountdown
