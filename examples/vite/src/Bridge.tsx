import { useInterwovenKit } from "@initia/widget-react"
import styles from "./Bridge.module.css"

const Bridge = () => {
  const { openBridge } = useInterwovenKit()
  return (
    <button className={styles.button} onClick={() => openBridge()}>
      Open bridge
    </button>
  )
}

export default Bridge
