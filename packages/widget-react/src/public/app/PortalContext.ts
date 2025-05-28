import { createContext, useContext } from "react"

export const PortalContext = createContext<{
  container: HTMLDivElement | null
  setContainer: (container: HTMLDivElement | null) => void
}>(null!)

export function usePortal() {
  const { container } = useContext(PortalContext)
  return container
}
