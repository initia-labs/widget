import { adjust, take } from "ramda"
import type { PropsWithChildren } from "react"
import { useState } from "react"
import type { HistoryEntry } from "./RouterContext"
import { RouterContext } from "./RouterContext"

interface MemoryRouterProps {
  initialEntry?: HistoryEntry
}

const MemoryRouter = ({ children, initialEntry }: PropsWithChildren<MemoryRouterProps>) => {
  const [history, setHistory] = useState<HistoryEntry[]>([initialEntry ?? { path: "/" }])
  const location = history[history.length - 1]

  const navigate = (to: string | number, state?: object) => {
    setHistory((prev) => {
      if (typeof to === "string") {
        return [...prev, { path: to, state }]
      }

      const newLength = prev.length + to
      if (newLength < 1) return prev

      const truncated = take(newLength, prev)

      if (state !== undefined) {
        return adjust(newLength - 1, (entry) => ({ ...entry, state }), truncated)
      }

      return truncated
    })
  }

  const reset = (path: string, state?: object) => {
    setHistory([{ path, state }])
  }

  return (
    <RouterContext.Provider value={{ location, history, navigate, reset }}>
      {children}
    </RouterContext.Provider>
  )
}

export default MemoryRouter
