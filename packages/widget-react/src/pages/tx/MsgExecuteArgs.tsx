import Button from "@/components/Button"
import styles from "./MsgExecuteArgs.module.css"
import { useState } from "react"
import { toBase64 } from "@cosmjs/encoding"
import { useQuery } from "@tanstack/react-query"
import { useChain } from "@/data/chains"
import ky from "ky"
import { stringifyBcsArgs, type MsgExecuteContent } from "../bridge/data/move"
import { createQueryKeys } from "@lukemorales/query-key-factory"
import clsx from "clsx"

interface MoveContractAbi {
  exposed_functions: {
    name: string
    params: string[]
  }[]
}

const moveQueryKeys = createQueryKeys("initia-widget:move", {
  abi: (restUrl: string, moduleAddress: string, moduleName: string, functionName: string) => [
    restUrl,
    moduleAddress,
    moduleName,
    functionName,
  ],
})

const MsgExecuteArgs = ({ msg, chainId }: { msg: MsgExecuteContent; chainId: string }) => {
  const [decoded, setDecoded] = useState<boolean>(false)
  const { restUrl } = useChain(chainId)
  const { moduleAddress, moduleName, functionName } = msg

  const { data: functionParams } = useQuery({
    queryKey: moveQueryKeys.abi(restUrl, moduleAddress, moduleName, functionName).queryKey,
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
            stringifyBcsArgs(msg["args"], functionParams).map(
              ({ type, decoded, encoded, error }) => (
                <div className={styles.arg}>
                  <span className={styles.key}>Type</span>
                  <span className={styles.value}>{type}</span>

                  <span className={styles.key}>Encoded</span>
                  <span className={styles.value}>{toBase64(encoded)}</span>

                  <span className={styles.key}>Decoded</span>
                  <span className={clsx(styles.value, { [styles.error]: error })}>
                    {error ? "decoding failed" : JSON.stringify(decoded)}
                  </span>
                </div>
              ),
            )}
        </div>
      ) : (
        <p className={styles.encoded}>[{msg["args"].map(toBase64).join(", ")}]</p>
      )}
    </div>
  )
}

export default MsgExecuteArgs
