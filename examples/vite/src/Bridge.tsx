import { useInitiaWidget } from "@initia/widget-react"
import styles from "./Bridge.module.css"

const Bridge = () => {
  const { openBridge } = useInitiaWidget()
  return (
    <button className={styles.button} onClick={() => openBridge()}>
      Open bridge widget
    </button>
  )
}

export default Bridge
