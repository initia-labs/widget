import type { Connector } from "wagmi"
import { useConnect } from "wagmi"
import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { IconExternalLink, IconWarningFilled } from "@initia/icons-react"
import { normalizeError } from "@/data/http"
import { useWidgetVisibility } from "@/data/ui"
import List from "@/components/List"
import Image from "@/components/Image"
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

  if (connectors.length === 0) {
    return (
      <div className={styles.empty}>
        <IconWarningFilled size={36} className={styles.icon} />
        <h1>No wallet detected</h1>
        <p>
          Compatible with most EVM wallets.
          <br />
          Here are some popular options we recommend.
        </p>
        <div className={styles.list}>
          {recommendedWallets.map(({ name, url }) => {
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
      </div>
    )
  }

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
