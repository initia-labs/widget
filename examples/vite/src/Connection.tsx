import { truncate, useInitiaWidget } from "@initia/widget-react"
import { useConnectWallet, useWallets } from "@privy-io/react-auth"
import styles from "./Connection.module.css"

const Connection = () => {
  const { connectWallet } = useConnectWallet()
  const { ready } = useWallets()
  const { address, username, openWallet } = useInitiaWidget()

  if (!address) {
    return (
      <button className={styles.button} onClick={connectWallet} disabled={!ready}>
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
