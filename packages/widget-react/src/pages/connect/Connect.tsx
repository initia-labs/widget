import type { Connector } from "wagmi"
import { useConnect } from "wagmi"
import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { IconExternalLink } from "@initia/icons-react"
import { normalizeError } from "@/data/http"
import { useWidgetVisibility } from "@/data/ui"
import List from "@/components/List"
import styles from "./Connect.module.css"
import { LocalStorageKey } from "@/data/constants"

const Connect = () => {
  const { closeWidget } = useWidgetVisibility()
  const { connectors, connectAsync } = useConnect()
  const [pendingConnectorId, setPendingConnectorId] = useState<string | null>(null)
  const { mutate, isPending } = useMutation({
    mutationFn: async (connector: Connector) => {
      setPendingConnectorId(connector.id)
      try {
        await connectAsync({ connector })
        localStorage.setItem(LocalStorageKey.RECENT_WALLET, connector.id)
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
    <div className={styles.container}>
      <h1 className={styles.title}>Connect wallet</h1>
      <List
        list={[...connectors]}
        onSelect={(connector) => mutate(connector)}
        getImage={({ icon = "" }) => icon}
        getName={({ name }) => name}
        getKey={({ id }) => id}
        getIsLoading={({ id }) => id === pendingConnectorId}
        getDisabled={() => isPending}
        getExtra={({ id }) =>
          id === localStorage.getItem(LocalStorageKey.RECENT_WALLET) ? (
            <span className={styles.recent}>Recent</span>
          ) : null
        }
      />
      <footer className={styles.footer}>
        <a href="https://docs.initia.xyz/home/tools/wallet-widget" target="_blank" rel="noreferrer">
          Initia Widget guide <IconExternalLink size={14} />
        </a>
      </footer>
    </div>
  )
}

export default Connect
