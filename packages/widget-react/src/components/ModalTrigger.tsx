import clsx from "clsx"
import { useContext, type ReactNode } from "react"
import { IconClose } from "@initia/icons-react"
import Dialog from "@/lib/ui/Dialog"
import { fullscreenContext } from "@/public/app/fullscreen"
import styles from "./ModalTrigger.module.css"

interface Props {
  title: string
  content: ReactNode | ((props: { onClose: () => void }) => ReactNode)
  children: ReactNode | ((props: { onOpen: () => void }) => ReactNode)
  className?: string
}

const ModalTrigger = ({ title, content, children: trigger, className }: Props) => {
  const fullscreen = useContext(fullscreenContext)

  return (
    <Dialog.Root>
      <Dialog.Trigger className={className}>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        {(props) => (
          <>
            <Dialog.Overlay className={clsx(styles.overlay, { [styles.fullscreen]: fullscreen })} />

            <Dialog.Content className={clsx(styles.content, { [styles.fullscreen]: fullscreen })}>
              <header className={styles.header}>
                <Dialog.Title className={styles.title}>{title}</Dialog.Title>
                <Dialog.Close className={styles.close}>
                  <IconClose size={20} />
                </Dialog.Close>
              </header>

              {typeof content === "function" ? content(props) : content}
            </Dialog.Content>
          </>
        )}
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default ModalTrigger
