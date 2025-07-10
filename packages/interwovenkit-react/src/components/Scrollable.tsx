import clsx from "clsx"
import type { PropsWithChildren } from "react"
import styles from "./Scrollable.module.css"

const Scrollable = ({ className, children }: PropsWithChildren<{ className?: string }>) => {
  return <div className={clsx(styles.scrollable, className)}>{children}</div>
}

export default Scrollable
