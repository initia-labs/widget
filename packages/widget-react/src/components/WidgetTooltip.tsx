import type { PropsWithChildren } from "react"
import { Tooltip } from "radix-ui"
import { usePortalContainer } from "@/public/portal"
import styles from "./WidgetTooltip.module.css"

const WidgetTooltip = ({ label, children }: PropsWithChildren<{ label: string }>) => {
  return (
    <Tooltip.Provider delayDuration={0}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
        <Tooltip.Portal container={usePortalContainer()}>
          <Tooltip.Content className={styles.tooltip}>
            {label}
            <Tooltip.Arrow className={styles.arrow} />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  )
}

export default WidgetTooltip
