import { truncate, useInitiaWidget } from "@initia/widget-react"
import styles from "./Connection.module.css"

const Connection = () => {
  const { address, username, openConnect, openWallet } = useInitiaWidget()

  if (!address) {
    return (
      <button className={styles.button} onClick={openConnect}>
        Connect
      </button>
    )
  }

  return (
    <button className={styles.button} onClick={openWallet}>
      {truncate(username ?? address)}
    </button>
  )
}

export default Connection
