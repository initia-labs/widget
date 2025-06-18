import type { PropsWithChildren } from "react"
import { Tooltip } from "radix-ui"
import { usePortal } from "@/public/app/PortalContext"
import styles from "./WidgetTooltip.module.css"
import clsx from "clsx"

interface Props {
  label: string
  disableHoverableContent?: boolean
  small?: boolean
}

const WidgetTooltip = ({
  label,
  children,
  disableHoverableContent,
  small,
}: PropsWithChildren<Props>) => {
  return (
    <Tooltip.Root disableHoverableContent={disableHoverableContent}>
      <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
      <Tooltip.Portal container={usePortal()}>
        <Tooltip.Content
          className={clsx(styles.tooltip, { small })}
          collisionBoundary={usePortal()}
          collisionPadding={8}
        >
          {label}
          <Tooltip.Arrow className={styles.arrow} />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}

export default WidgetTooltip
