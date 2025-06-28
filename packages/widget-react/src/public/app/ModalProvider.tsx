import { useCallback, useState, type PropsWithChildren } from "react"
import Modal from "@/components/Modal"
import TxRequest from "@/pages/tx/TxRequest"
import type { ModalOptions } from "./ModalContext"
import { ModalContext } from "./ModalContext"

const ModalProvider = ({ children }: PropsWithChildren) => {
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

      <Modal title={title} open={isOpen} onOpenChange={setIsOpen}>
        {path === "/tx" ? <TxRequest /> : content}
      </Modal>
    </ModalContext.Provider>
  )
}

export default ModalProvider
