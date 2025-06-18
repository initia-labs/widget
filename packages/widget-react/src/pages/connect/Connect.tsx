import type { Connector } from "wagmi"
import { useConnect } from "wagmi"
import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { normalizeError } from "@/data/http"
import { useWidgetVisibility } from "@/data/ui"
import List from "@/components/List"
import styles from "./Connect.module.css"

const Connect = () => {
  const { closeWidget } = useWidgetVisibility()
  const { connectors, connectAsync } = useConnect()
  const [pendingConnectorId, setPendingConnectorId] = useState<string | null>(null)
  const { mutate } = useMutation({
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
      <List
        list={[...connectors]}
        onSelect={(c) => mutate(c)}
        getImage={({ icon }) => icon || ""}
        getName={({ name }) => name}
        getKey={({ id }) => id}
        getIsLoading={({ id }) => id === pendingConnectorId}
      />
    </>
  )
}

export default Connect
