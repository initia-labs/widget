import type { PropsWithChildren } from "react"
import styles from "./FlexEnd.module.css"

const FlexEnd = ({ mt, mb, children }: PropsWithChildren<{ mt?: number; mb?: number }>) => {
  return (
    <div className={styles.flex} style={{ marginTop: mt, marginBottom: mb }}>
      {children}
    </div>
  )
}

export default FlexEnd
