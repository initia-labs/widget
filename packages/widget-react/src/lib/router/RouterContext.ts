import { createContext, useContext } from "react"

export interface HistoryEntry {
  path: string
  state?: unknown
}

interface RouterContextProps {
  navigate: (to: string | number, state?: unknown) => void
  location: HistoryEntry
}

export const RouterContext = createContext<RouterContextProps>(null!)

export function useRouterContext() {
  return useContext(RouterContext)
}

export function useNavigate() {
  const { navigate } = useRouterContext()
  return navigate
}

export function useLocation() {
  const { location } = useRouterContext()
  return location
}

export function usePath() {
  const { path } = useLocation()
  return path
}

export function useLocationState<T = unknown>() {
  const { state } = useLocation()
  return state as T
}
