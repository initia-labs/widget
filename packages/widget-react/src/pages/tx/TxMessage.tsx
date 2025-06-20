import { toBase64 } from "@cosmjs/encoding"
import type { EncodeObject } from "@cosmjs/proto-signing"
import styles from "./TxMessage.module.css"
import MsgExecuteArgs from "./MsgExecuteArgs"
import type { MsgExecuteContent } from "../bridge/data/move"

interface Props extends EncodeObject {
  chainId: string
}

const TxMessage = ({ value: msgValues, typeUrl, chainId }: Props) => {
  const renderValue = (value: unknown): string => {
    switch (typeof value) {
      case "string":
        return value

      case "number":
      case "bigint":
        return value.toString()

      case "boolean":
        return value ? "true" : "false"

      case "object":
        if (value === null) return "null"
        if (value instanceof Uint8Array) return toBase64(value)
        if (Array.isArray(value)) return `[${value.map(renderValue).join(",")}]`
        return JSON.stringify(value, (_, value) =>
          typeof value === "bigint" ? value.toString() : value,
        )

      default:
        return "unknown"
    }
  }

  return (
    <div className={styles.list}>
      {Object.entries(msgValues as MsgExecuteContent).map(([key, value]) => {
        if (typeUrl === "/initia.move.v1.MsgExecute" && key === "args") {
          return <MsgExecuteArgs msg={msgValues} chainId={chainId} key={key} />
        }

        return (
          <div key={key}>
            <div className={styles.key}>{key}</div>
            <p className={styles.value}>{renderValue(value)}</p>
          </div>
        )
      })}
    </div>
  )
}

export default TxMessage
