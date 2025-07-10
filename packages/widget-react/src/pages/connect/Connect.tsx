import clsx from "clsx"
import { descend } from "ramda"
import type { Connector } from "wagmi"
import { useConnect } from "wagmi"
import { useState } from "react"
import { useLocalStorage } from "react-use"
import { useMutation } from "@tanstack/react-query"
import { IconExternalLink } from "@initia/icons-react"
import { LocalStorageKey } from "@/data/constants"
import { normalizeError } from "@/data/http"
import { useWidgetVisibility } from "@/data/ui"
import Scrollable from "@/components/Scrollable"
import Image from "@/components/Image"
import Loader from "@/components/Loader"
import Footer from "@/components/Footer"
import styles from "./Connect.module.css"

const recommendedWallets = [
  { name: "Rabby", url: "https://rabby.io" },
  { name: "Phantom", url: "https://phantom.com" },
  { name: "Keplr", url: "https://keplr.app" },
  { name: "Leap", url: "https://leapwallet.io" },
]

const Connect = () => {
  const { closeWidget } = useWidgetVisibility()
  const { connectors, connectAsync } = useConnect()
  const [latestConnectorId, setLatestConnectorId] = useLocalStorage<string | null>(
    LocalStorageKey.LATEST_CONNECTOR_ID,
  )
  const [pendingConnectorId, setPendingConnectorId] = useState<string | null>(null)
  const { mutate, isPending } = useMutation({
    mutationFn: async (connector: Connector) => {
      setPendingConnectorId(connector.id)
      try {
        await connectAsync({ connector })
        return connector
      } catch (error) {
        throw new Error(await normalizeError(error))
      }
    },
    onSettled: () => {
      setPendingConnectorId(null)
    },
    onSuccess: (connector) => {
      setLatestConnectorId(connector.id)
      closeWidget()
    },
  })

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Connect wallet</h1>

      <Scrollable className={styles.scrollable}>
        <div className={styles.list}>
          {connectors
            .toSorted(descend((connector) => connector.id === latestConnectorId))
            .map((connector) => {
              const { name, icon, id } = connector
              return (
                <button
                  className={styles.item}
                  onClick={() => mutate(connector)}
                  disabled={isPending}
                  key={id}
                >
                  <Image src={icon} width={24} height={24} />
                  <span className={styles.name}>{name}</span>
                  {pendingConnectorId === id ? (
                    <Loader size={16} />
                  ) : latestConnectorId === id ? (
                    <span className={styles.recent}>Recent</span>
                  ) : (
                    <span className={styles.installed}>Installed</span>
                  )}
                </button>
              )
            })}

          {recommendedWallets
            .filter(({ name }) => !connectors.some((connector) => connector.name.includes(name)))
            .map(({ name, url }) => {
              const imageUrl = `https://assets.initia.xyz/images/wallets/${name}.webp`
              return (
                <a href={url} className={styles.item} target="_blank" key={name}>
                  <Image src={imageUrl} width={24} height={24} />
                  <span className={clsx(styles.name, styles.dimmed)}>{name}</span>
                  <IconExternalLink size={10} />
                </a>
              )
            })}
        </div>
      </Scrollable>

      <Footer>
        <a href="https://docs.initia.xyz" target="_blank" className={styles.docs}>
          <span>Learn more</span>
          <IconExternalLink size={14} />
        </a>
      </Footer>
    </div>
  )
}

export default Connect
