import xss from "xss"
import clsx from "clsx"
import { path } from "ramda"
import type { AnchorHTMLAttributes } from "react"
import { truncate } from "@/public/utils"
import { useChain } from "@/data/chains"
import { IconExternalLink } from "@initia/icons-react"
import styles from "./ExplorerLink.module.css"

interface Props extends AnchorHTMLAttributes<HTMLAnchorElement> {
  chainId: string
  txHash: string
  showIcon?: boolean
  onClick?: () => void
}

const ExplorerLink = (props: Props) => {
  const { chainId, txHash, showIcon, className, children, onClick, ...attrs } = props
  const chain = useChain(chainId)
  const txPage = path<string>(["explorers", 0, "tx_page"], chain)
  const text = children ?? truncate(txHash)

  if (!txPage) {
    return <span {...attrs}>{text}</span>
  }

  return (
    <a
      {...attrs}
      href={xss(txPage.replace(/\$\{txHash\}/g, txHash))}
      className={clsx(styles.link, className)}
      onClick={onClick}
      target="_blank"
    >
      {text}
      {showIcon && <IconExternalLink size={12} />}
    </a>
  )
}

export default ExplorerLink
