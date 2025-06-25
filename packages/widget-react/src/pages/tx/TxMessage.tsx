import type { EncodeObject } from "@cosmjs/proto-signing"
import styles from "./TxMessage.module.css"
import { stringifyValue } from "./stringify"
import MsgExecuteArgs from "./MsgExecuteArgs"
import type { MsgExecuteContent } from "../bridge/data/move"

interface Props extends EncodeObject {
  chainId: string
}

const TxMessage = ({ value: msgValues, typeUrl, chainId }: Props) => {
  return (
    <div className={styles.list}>
      {Object.entries(msgValues as MsgExecuteContent).map(([key, value]) => {
        if (typeUrl === "/initia.move.v1.MsgExecute" && key === "args") {
          return <MsgExecuteArgs msg={msgValues} chainId={chainId} key={key} />
        }

        return (
          <div key={key}>
            <div className={styles.key}>{key}</div>
            <p className={styles.value}>{stringifyValue(value)}</p>
          </div>
        )
      })}
    </div>
  )
}

export default TxMessage
