import { nanoid } from "nanoid"
import type { PropsWithChildren } from "react"
import { useCallback, useState } from "react"
import { createPortal } from "react-dom"
import Toast from "@/components/Toast"
import { usePortal } from "./PortalContext"
import type { Notification } from "./NotificationContext"
import { NotificationContext } from "./NotificationContext"

export interface InternalNotification extends Notification {
  id: string
}

const NotificationProvider = ({ children }: PropsWithChildren) => {
  const portal = usePortal()
  const [notification, setNotification] = useState<InternalNotification | null>(null)

  const showNotification = useCallback((notification: Notification) => {
    setNotification({ ...notification, id: nanoid() })
  }, [])

  const updateNotification = useCallback((notification: Notification) => {
    setNotification((prev) => {
      if (prev) return { ...prev, ...notification }
      return { ...notification, id: nanoid() }
    })
  }, [])

  const hideNotification = useCallback(() => {
    setNotification(null)
  }, [])

  return (
    <NotificationContext.Provider
      value={{ showNotification, updateNotification, hideNotification }}
    >
      {children}
      {portal &&
        createPortal(<Toast notification={notification} onClose={hideNotification} />, portal)}
    </NotificationContext.Provider>
  )
}

export default NotificationProvider
