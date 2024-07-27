import type { PropsWithChildren } from "react"
import { IconWallet } from "@initia/icons-react"
import styles from "./BalanceButton.module.css"

const BalanceButton = ({ onClick, children }: PropsWithChildren<{ onClick: () => void }>) => {
  return (
    <div className={styles.wrapper}>
      <IconWallet size={16} />
      <span className={styles.balance}>{children}</span>
      <button type="button" className={styles.button} onClick={() => onClick()}>
        MAX
      </button>
    </div>
  )
}

export default BalanceButton
