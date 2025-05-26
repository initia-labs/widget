import { sentenceCase } from "change-case"
import type { RouteJson } from "@skip-go/client"
import { IconChevronRight, IconWarningFilled } from "@initia/icons-react"
import Scrollable from "@/components/Scrollable"
import Button from "@/components/Button"
import styles from "./BridgeWarningModalContent.module.css"

interface Props {
  warning: RouteJson["warning"]
  onOk: () => void
  onCancel: () => void
}

const BridgeWarningModalContent = ({ warning, onOk, onCancel }: Props) => {
  const { type = "", message = "" } = warning || {}

  return (
    <Scrollable className={styles.root}>
      <header className={styles.header}>
        <IconWarningFilled size={40} />
        <h1 className={styles.title}>{sentenceCase(type)}</h1>
      </header>

      <p className={styles.message}>{message}</p>

      <footer className={styles.footer}>
        <Button.White onClick={onCancel} fullWidth>
          Cancel
        </Button.White>

        <button className={styles.ok} onClick={onOk}>
          <span>Proceed anyway</span>
          <IconChevronRight size={14} />
        </button>
      </footer>
    </Scrollable>
  )
}

export default BridgeWarningModalContent
