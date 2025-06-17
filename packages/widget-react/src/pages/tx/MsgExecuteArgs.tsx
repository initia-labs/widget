import Button from "@/components/Button"
import styles from "./MsgExecuteArgs.module.css"
import { useState } from "react"
import { toBase64 } from "@cosmjs/encoding"
import { useQuery } from "@tanstack/react-query"
import { useChain } from "@/data/chains"
import ky from "ky"
import { stringifyBcsArgs } from "../bridge/data/move"

interface MoveContractAbi {
  exposed_functions: {
    name: string
    params: string[]
  }[]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MsgExecuteArgs = ({ msg, chainId }: { msg: Record<string, any>; chainId: string }) => {
  const [decoded, setDecoded] = useState<boolean>(false)
  const { restUrl } = useChain(chainId)
  const { moduleAddress, moduleName, functionName } = msg

  const { data: functionParams } = useQuery({
    queryKey: ["msg-execute-abi-11-1", restUrl, moduleAddress, moduleName, functionName],
    queryFn: async () => {
      const data = await ky.get(`initia/move/v1/accounts/${moduleAddress}/modules/${moduleName}`, {
        prefixUrl: restUrl,
      })
      const abi = JSON.parse(
        (await data.json<{ module: { abi: string } }>()).module.abi,
      ) as MoveContractAbi
      return abi.exposed_functions.find(({ name }) => name === functionName)?.params
    },
  })

  const isDecodeAvailable = !!functionParams
  return (
    <div>
      <div className={styles.key}>
        args
        <Button.Small onClick={() => setDecoded((d) => !d)} disabled={!isDecodeAvailable}>
          {decoded ? "Encode" : "Decode"}
        </Button.Small>
      </div>
      {decoded ? (
        <div className={styles.decoded}>
          {!!functionParams &&
            stringifyBcsArgs(msg["args"], functionParams).map(({ type, decoded, encoded }) => (
              <div className={styles.arg}>
                <span className={styles.key}>Type</span>
                <span className={styles.value}>{type}</span>

                <span className={styles.key}>Encoded</span>
                <span className={styles.value}>{toBase64(encoded)}</span>

                <span className={styles.key}>Decoded</span>
                <span className={styles.value}>{JSON.stringify(decoded)}</span>
              </div>
            ))}
        </div>
      ) : (
        <p className={styles.encoded}>[{msg["args"].map(toBase64).join(", ")}]</p>
      )}
    </div>
  )
}

export default MsgExecuteArgs
