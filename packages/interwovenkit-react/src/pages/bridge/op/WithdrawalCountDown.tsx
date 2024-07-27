import { IconInfoFilled } from "@initia/icons-react"
import WidgetTooltip from "@/components/WidgetTooltip"
import Countdown from "./Countdown"
import styles from "./WithdrawalCountdown.module.css"

const DESCRIPTION = "Time remaining before you can claim"

const WithdrawalCountdown = ({ date }: { date: Date }) => {
  return (
    <div className={styles.container}>
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
