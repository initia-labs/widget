import clsx from "clsx"
import { useAccount, useDisconnect } from "wagmi"
import { IconCopy, IconSignOut } from "@initia/icons-react"
import { truncate } from "@/public/utils"
import { useInitiaWidget } from "@/public/data/hooks"
import { useWidgetVisibility } from "@/data/ui"
import CopyButton from "@/components/CopyButton"
import Image from "@/components/Image"
import styles from "./WidgetHeader.module.css"

const WidgetHeader = () => {
  const { connector } = useAccount()
  const { disconnect } = useDisconnect()
  const { address, username } = useInitiaWidget()
  const { closeWidget } = useWidgetVisibility()
  const name = username ?? address

  if (!connector) {
    return null
  }

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <Image src={connector.icon} width={18} height={18} />
      </div>

      <CopyButton value={address}>
        {({ copy, copied }) => (
          <button className={clsx(styles.copy, { [styles.copied]: copied })} onClick={copy}>
            <div className={styles.address}>{truncate(address)}</div>
            <div className={styles.name}>{truncate(name)}</div>
            <IconCopy className={styles.icon} size={12} />
            {copied ? "Copied!" : ""}
          </button>
        )}
      </CopyButton>

      <button
        className={styles.disconnect}
        onClick={() => {
          closeWidget()
          disconnect()
        }}
      >
        <IconSignOut size={18} />
      </button>
    </header>
  )
}

export default WidgetHeader
