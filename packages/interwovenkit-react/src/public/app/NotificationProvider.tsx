import { nanoid } from "nanoid"
import type { PropsWithChildren } from "react"
import { useCallback, useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import Toast from "@/components/Toast"
import { usePortal } from "./PortalContext"
import type { Notification } from "./NotificationContext"
import { NotificationContext } from "./NotificationContext"

export interface InternalNotification extends Notification {
  id: string
}

const duration = 5000

const NotificationProvider = ({ children }: PropsWithChildren) => {
  const portal = usePortal()
  const [notification, setNotification] = useState<InternalNotification | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  const hideNotification = useCallback(() => {
    clearTimer()
    setNotification(null)
  }, [])

  const showNotification = useCallback(
    (notification: Notification) => {
      clearTimer()
      setNotification({ ...notification, id: nanoid() })
      if (notification.autoHide) {
        timerRef.current = setTimeout(() => hideNotification(), duration)
      }
    },
    [hideNotification],
  )

  const updateNotification = useCallback(
    (notification: Notification) => {
      clearTimer()
      setNotification((prev) => {
        if (prev) return { ...prev, ...notification }
        return { ...notification, id: nanoid() }
      })
      if (notification.autoHide) {
        timerRef.current = setTimeout(() => hideNotification(), duration)
      }
    },
    [hideNotification],
  )

  useEffect(() => () => clearTimer(), [])

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
