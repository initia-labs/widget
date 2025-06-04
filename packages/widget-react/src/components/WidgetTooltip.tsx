import type { PropsWithChildren } from "react"
import { Tooltip } from "radix-ui"
import { usePortal } from "@/public/app/PortalContext"
import styles from "./WidgetTooltip.module.css"

const WidgetTooltip = ({ label, children }: PropsWithChildren<{ label: string }>) => {
  return (
    <Tooltip.Root>
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
