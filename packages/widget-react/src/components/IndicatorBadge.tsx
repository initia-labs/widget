import type { PropsWithChildren } from "react"
import clsx from "clsx"
import styles from "./IndicatorBadge.module.css"

interface Props {
  hidden?: boolean
  offset?: number
  className?: string
}

const IndicatorBadge = ({ hidden, className, offset, children }: PropsWithChildren<Props>) => {
  return (
    <div className={clsx(styles.container, className)}>
      {children}
      {!hidden && (
        <div className={styles.badge} style={{ right: offset ?? -3, top: offset ?? -3 }} />
      )}
    </div>
  )
}
export default IndicatorBadge
