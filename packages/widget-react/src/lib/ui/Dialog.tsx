/**
 * This file is a replacement for Radix UI's Dialog.
 * In production environments, when rendered within the Shadow DOM,
 * Radix UI's Dialog erroneously logs a console.error stating that DialogTitle is missing.
 * This custom implementation addresses that issue.
 */

import type { PropsWithChildren, ReactNode } from "react"
import { useContext, useEffect, createContext, useState } from "react"
import { createPortal } from "react-dom"

interface DialogContextProps {
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
}

const DialogContext = createContext<DialogContextProps>(null!)

export const DialogRoot = ({ children }: PropsWithChildren) => {
  const [isOpen, setIsOpen] = useState(false)

  const handleOpen = () => setIsOpen(true)
  const handleClose = () => setIsOpen(false)

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen])

  return (
    <DialogContext.Provider value={{ isOpen, onOpen: handleOpen, onClose: handleClose }}>
      {children}
    </DialogContext.Provider>
  )
}

interface DialogTriggerProps {
  children: ReactNode | ((props: { onOpen: () => void }) => ReactNode)
  className?: string
}

export const DialogTrigger = ({ children, className }: DialogTriggerProps) => {
  const { onOpen } = useContext(DialogContext)

  if (typeof children === "function") {
    return children({ onOpen })
  }

  return (
    <button type="button" className={className} onClick={onOpen}>
      {children}
    </button>
  )
}

interface DialogPortalProps {
  container: Element | DocumentFragment | null
  children: (props: { onClose: () => void }) => ReactNode
}

export const DialogPortal = ({ container, children }: DialogPortalProps) => {
  const { isOpen, onClose } = useContext(DialogContext)
  if (!isOpen) return null
  return createPortal(children({ onClose }), container ?? document.body)
}

interface DialogOverlayProps {
  className?: string
}

export const DialogOverlay = ({ className }: DialogOverlayProps) => {
  const { onClose } = useContext(DialogContext)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      onClose()
    }
  }

  return (
    <div
      className={className}
      onClick={onClose}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    />
  )
}

interface DialogContentProps {
  className?: string
}

export const DialogContent = ({ className, children }: PropsWithChildren<DialogContentProps>) => {
  return <div className={className}>{children}</div>
}

interface DialogTitleProps {
  className?: string
}

export const DialogTitle = ({ className, children }: PropsWithChildren<DialogTitleProps>) => {
  return <h1 className={className}>{children}</h1>
}

interface DialogCloseProps {
  className: string
}

export const DialogClose = ({ children, className }: PropsWithChildren<DialogCloseProps>) => {
  const { onClose } = useContext(DialogContext)
  return (
    <button type="button" className={className} onClick={onClose}>
      {children}
    </button>
  )
}

const Dialog = {
  Root: DialogRoot,
  Trigger: DialogTrigger,
  Portal: DialogPortal,
  Overlay: DialogOverlay,
  Content: DialogContent,
  Title: DialogTitle,
  Close: DialogClose,
}

export default Dialog
