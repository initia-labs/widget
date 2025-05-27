import clsx from "clsx"
import { useDisconnect } from "wagmi"
import { IconCopy, IconSignOut } from "@initia/icons-react"
import { Link } from "@/lib/router"
import { useWidgetVisibility } from "@/data/ui"
import { truncate } from "@/public/utils"
import { useInitiaWidget } from "@/public/data/hooks"
import CopyButton from "@/components/CopyButton"
import Image from "@/components/Image"
import styles from "./WidgetHeader.module.css"

const WidgetHeader = () => {
  const { address, username, wallet } = useInitiaWidget()
  const { closeWidget } = useWidgetVisibility()
  const { disconnect } = useDisconnect()
  const name = username ?? address

  if (!address) {
    return null
  }

  return (
    <header className={styles.header}>
      <Link to="/" className={styles.logo}>
        <Image src={wallet?.meta.icon} width={18} height={18} />
      </Link>

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
