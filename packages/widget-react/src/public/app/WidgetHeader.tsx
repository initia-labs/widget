import clsx from "clsx"
import { IconCopy, IconSignOut } from "@initia/icons-react"
import { Link } from "@/lib/router"
import { truncate } from "@/public/utils"
import { useInitiaWidget } from "@/public/data/hooks"
import { useClaimableModal } from "@/pages/bridge/op/reminder"
import { useConfig } from "@/data/config"
import { useWidgetVisibility } from "@/data/ui"
import CopyButton from "@/components/CopyButton"
import Image from "@/components/Image"
import styles from "./WidgetHeader.module.css"

const WidgetHeader = () => {
  const { wallet } = useConfig()
  const { address, username } = useInitiaWidget()
  const { closeWidget } = useWidgetVisibility()
  const name = username ?? address

  // Open claimable list modal
  useClaimableModal()

  if (!wallet) {
    return null
  }

  return (
    <header className={styles.header}>
      <Link to="/" className={styles.logo}>
        <Image src={wallet.meta.icon} width={18} height={18} />
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
          wallet.disconnect()
        }}
      >
        <IconSignOut size={18} />
      </button>
    </header>
  )
}

export default WidgetHeader
