import type { Connector } from "wagmi"
import { useConnect } from "wagmi"
import { useState } from "react"
import clsx from "clsx"
import { useMutation } from "@tanstack/react-query"
import { IconExternalLink } from "@initia/icons-react"
import { LocalStorageKey } from "@/data/constants"
import { normalizeError } from "@/data/http"
import { useWidgetVisibility } from "@/data/ui"
import Image from "@/components/Image"
import Loader from "@/components/Loader"
import styles from "./Connect.module.css"

const recommendedWallets = [
  { name: "Rabby", url: "https://rabby.io", id: "io.rabby" },
  { name: "Phantom", url: "https://phantom.com", id: "app.phantom" },
  { name: "Keplr", url: "https://keplr.app", id: "app.keplr" },
  { name: "Leap", url: "https://leapwallet.io", id: "io.leapwallet.LeapWallet" },
]

const Connect = () => {
  const { closeWidget } = useWidgetVisibility()
  const { connectors, connectAsync } = useConnect()
  const [pendingConnectorId, setPendingConnectorId] = useState<string | null>(null)
  const { mutate, isPending } = useMutation({
    mutationFn: async (connector: Connector) => {
      setPendingConnectorId(connector.id)
      localStorage.setItem(LocalStorageKey.RECENT_WALLET, connector.id)
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
    <div className={styles.page}>
      <h1>Connect wallet</h1>
      <div className={styles.list}>
        {connectors.map((connector) => {
          const { name, icon, id } = connector
          return (
            <button
              onClick={() => mutate(connector)}
              className={clsx(styles.item, styles.installed)}
              key={id}
              disabled={isPending}
            >
              <Image src={icon} width={24} height={24} />
              <span className={styles.name}>{name}</span>
              {pendingConnectorId === id ? (
                <Loader size={12} />
              ) : localStorage.getItem(LocalStorageKey.RECENT_WALLET) === id ? (
                <span className={styles.recent}>Recent</span>
              ) : (
                <span className={styles.extra}>Installed</span>
              )}
            </button>
          )
        })}
        {recommendedWallets
          .filter(({ id }) => !connectors.some((c) => c.id === id))
          .map(({ name, url }) => {
            const imageUrl = `https://assets.initia.xyz/images/wallets/${name}.webp`
            return (
              <a href={url} className={styles.item} target="_blank" key={name}>
                <Image src={imageUrl} width={24} height={24} />
                <span className={styles.name}>{name}</span>
                <IconExternalLink size={10} />
              </a>
            )
          })}
      </div>

      <div className={styles.footer}>
        <a href="https://docs.initia.xyz/home/tools/wallet-widget" target="_blank" rel="noreferrer">
          Learn more <IconExternalLink size={14} />
        </a>
      </div>
    </div>
  )
}

export default Connect
