import type { Connector } from "wagmi"
import { useConnect } from "wagmi"
import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { normalizeError } from "@/data/http"
import { useWidgetVisibility } from "@/data/ui"
import Scrollable from "@/components/Scrollable"
import Image from "@/components/Image"
import Loader from "@/components/Loader"
import styles from "./Connect.module.css"

const Connect = () => {
  const { closeWidget } = useWidgetVisibility()
  const { connectors, connectAsync } = useConnect()
  const [pendingConnectorId, setPendingConnectorId] = useState<string | null>(null)
  const { mutate, isPending } = useMutation({
    mutationFn: async (connector: Connector) => {
      setPendingConnectorId(connector.id)
      try {
        await connectAsync({ connector })
      } catch (error) {
        throw new Error(await normalizeError(error))
      }
    },
    onSettled: () => {
      setPendingConnectorId(null)
    },
    onSuccess: () => {
      closeWidget()
    },
  })

  return (
    <>
      <h2 className={styles.title}>Connect wallet</h2>
      <Scrollable className={styles.scrollable}>
        <div className={styles.list}>
          {connectors.map((connector: Connector) => {
            const { id, icon, name } = connector
            return (
              <button
                className={styles.connector}
                onClick={() => mutate(connector)}
                disabled={isPending}
                key={id}
              >
                <Image src={icon} width={32} height={32} />
                <span className={styles.name}>{name}</span>
                {pendingConnectorId === id && <Loader size={16} />}
              </button>
            )
          })}
        </div>
      </Scrollable>
    </>
  )
}

export default Connect
