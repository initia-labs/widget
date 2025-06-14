import { useAtomValue } from "jotai"
import { useCallback, useState, type PropsWithChildren } from "react"
import { txRequestHandlerAtom } from "@/data/tx"
import Modal from "@/components/Modal"
import TxRequest from "@/pages/tx/TxRequest"
import type { ModalOptions } from "./ModalContext"
import { ModalContext } from "./ModalContext"

const ModalProvider = ({ children }: PropsWithChildren) => {
  const txRequest = useAtomValue(txRequestHandlerAtom)
  const [{ title, content, path }, setOptions] = useState<ModalOptions>({})
  const [isOpen, setIsOpen] = useState(false)

  const openModal = useCallback((options: ModalOptions) => {
    setOptions(options)
    setIsOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setOptions({})
    setIsOpen(false)
  }, [])

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}

      <Modal
        title={title}
        open={isOpen}
        onOpenChange={setIsOpen}
        // FIXME: React StrictMode causes a problem by unmounting the component once on purpose.
        // Should reject on unmount, but didn't work as expected.
        // Currently handled via drawer/modal close instead.
        // Would be nice to fix this properly later.
        onInteractOutside={() => txRequest?.reject(new Error("User rejected"))}
      >
        {path === "/tx" ? <TxRequest /> : content}
      </Modal>
    </ModalContext.Provider>
  )
}

export default ModalProvider
