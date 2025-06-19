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
      <h1 className={styles.title}>Connect wallet</h1>
      <List
        list={[...connectors]}
        onSelect={(connector) => mutate(connector)}
        getImage={({ icon = "" }) => icon}
        getName={({ name }) => name}
        getKey={({ id }) => id}
        getIsLoading={({ id }) => id === pendingConnectorId}
        getDisabled={() => isPending}
      />
    </>
  )
}

export default Connect
