import { useSetAtom } from "jotai"
import { useNavigate } from "@/lib/router"
import { txResultAtom, useTxResult } from "@/data/tx"
import Scrollable from "@/components/Scrollable"
import Video from "@/components/Video"
import ExplorerLink from "@/components/ExplorerLink"
import Footer from "@/components/Footer"
import Button from "@/components/Button"
import styles from "./TxResult.module.css"

const TxResult = () => {
  const navigate = useNavigate()

  const { txRequest, txHash, error } = useTxResult()
  const { chainId, internal } = txRequest

  const setTxResult = useSetAtom(txResultAtom)

  const videoName = error ? "Failure" : "Success"
  const title = error ? "Failed" : "Success"
  const content = error ? (
    <p className={styles.error}>{error.message}</p>
  ) : txHash ? (
    <ExplorerLink className={styles.link} chainId={chainId} txHash={txHash} showIcon />
  ) : (
    <p>Something went wrong</p>
  )

  return (
    <Scrollable className={styles.result}>
      <div className={styles.inner}>
        <Video name={videoName} />
        <h1 className={styles.title}>{title}</h1>
        {content}
      </div>

      <Footer>
        <Button.White
          onClick={() => {
            if (internal && internal.returnPath) navigate(internal.returnPath)
            setTxResult(undefined)
          }}
        >
          Home
        </Button.White>
      </Footer>
    </Scrollable>
  )
}

export default TxResult
