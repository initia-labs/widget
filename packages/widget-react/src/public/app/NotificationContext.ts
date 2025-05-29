import type { ReactNode } from "react"
import { createContext, useContext } from "react"

export interface Notification {
  icon: ReactNode
  color?: string
  title: string
  description: ReactNode
}

export interface NotificationContextValue {
  showNotification: (notification: Notification) => void
  updateNotification: (notification: Notification) => void
  hideNotification: () => void
}

export const NotificationContext = createContext<NotificationContextValue>(null!)

export const useNotification = () => {
  return useContext(NotificationContext)
}
