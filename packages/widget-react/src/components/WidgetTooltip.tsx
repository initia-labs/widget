import type { PropsWithChildren } from "react"
import { Tooltip } from "radix-ui"
import { usePortal } from "@/public/app/PortalContext"
import styles from "./WidgetTooltip.module.css"

interface Props {
  label: string
  disableHoverableContent?: boolean
}

const WidgetTooltip = ({ label, children, disableHoverableContent }: PropsWithChildren<Props>) => {
  return (
    <Tooltip.Root disableHoverableContent={disableHoverableContent}>
      <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
      <Tooltip.Portal container={usePortal()}>
        <Tooltip.Content className={styles.tooltip}>
          {label}
          <Tooltip.Arrow className={styles.arrow} />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}

export default WidgetTooltip
