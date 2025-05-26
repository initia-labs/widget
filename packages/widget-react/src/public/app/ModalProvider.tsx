import clsx from "clsx"
import { useContext, useState, type PropsWithChildren } from "react"
import { Dialog } from "radix-ui"
import { IconClose } from "@initia/icons-react"
import { fullscreenContext } from "./fullscreen"
import { usePortal } from "./PortalContext"
import type { ModalOptions } from "./ModalContext"
import { ModalContext } from "./ModalContext"
import styles from "./Modal.module.css"

export const ModalProvider = ({ children }: PropsWithChildren) => {
  const fullscreen = useContext(fullscreenContext)

  const [{ title, content }, setOptions] = useState<ModalOptions>({ content: null })
  const [isOpen, setIsOpen] = useState(false)

  const openModal = (opts: ModalOptions) => {
    setOptions(opts)
    setIsOpen(true)
  }

  const closeModal = () => {
    setIsOpen(false)
  }

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}

      <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
        <Dialog.Portal container={usePortal()}>
          <Dialog.Overlay className={clsx(styles.overlay, { [styles.fullscreen]: fullscreen })} />

          <Dialog.Content className={clsx(styles.content, { [styles.fullscreen]: fullscreen })}>
            {title && (
              <header className={styles.header}>
                <Dialog.Title className={styles.title}>{title}</Dialog.Title>
                <Dialog.Close className={styles.close}>
                  <IconClose size={20} />
                </Dialog.Close>
              </header>
            )}

            {content}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </ModalContext.Provider>
  )
}
