import { useAtom } from "jotai"
import { useEffect } from "react"
import { IconCheckCircleFilled, IconWarningFilled } from "@initia/icons-react"
import { txStatusAtom } from "@/data/tx"
import Loader from "@/components/Loader"
import ExplorerLink from "@/components/ExplorerLink"
import { useNotification } from "./NotificationContext"
import styles from "./TxWatcher.module.css"

const TxWatcher = () => {
  const [txStatus, setTxStatus] = useAtom(txStatusAtom)
  const { showNotification, updateNotification, hideNotification } = useNotification()

  useEffect(() => {
    if (!txStatus) return

    const { status, chainId, txHash, error } = txStatus

    const description = error ? (
      error.message
    ) : txHash ? (
      <ExplorerLink
        txHash={txHash}
        chainId={chainId}
        className={styles.link}
        onClick={hideNotification}
        showIcon
      >
        View on Initia Scan
      </ExplorerLink>
    ) : null

    switch (status) {
      case "loading":
        showNotification({
          icon: <Loader size={16} />,
          title: "Transaction is pending...",
          description,
        })
        break
      case "error":
        updateNotification({
          icon: <IconWarningFilled size={16} />,
          color: "error",
          title: "Transaction failed",
          description,
        })
        setTxStatus(null)
        break
      case "success":
        updateNotification({
          icon: <IconCheckCircleFilled size={16} />,
          color: "success",
          title: "Transaction is successful!",
          description,
        })
        setTxStatus(null)
        break
    }
  }, [txStatus, setTxStatus, showNotification, updateNotification, hideNotification])

  return null
}

export default TxWatcher
