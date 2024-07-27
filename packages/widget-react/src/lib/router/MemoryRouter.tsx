import type { PropsWithChildren } from "react"
import { useState } from "react"
import type { HistoryEntry } from "./RouterContext"
import { RouterContext } from "./RouterContext"

interface MemoryRouterProps {
  initialEntry?: HistoryEntry
}

const MemoryRouter = ({ children, initialEntry }: PropsWithChildren<MemoryRouterProps>) => {
  const [history, setHistory] = useState<HistoryEntry[]>([initialEntry ?? { path: "/" }])

  const navigate = (to: string | number, state?: unknown) => {
    if (typeof to === "number") {
      const newLength = history.length + to
      if (newLength < 1) return
      setHistory((prev) => prev.slice(0, newLength))
    } else {
      setHistory((prev) => [...prev, { path: to, state }])
    }
  }

  const location = history[history.length - 1]

  return <RouterContext.Provider value={{ navigate, location }}>{children}</RouterContext.Provider>
}

export default MemoryRouter
