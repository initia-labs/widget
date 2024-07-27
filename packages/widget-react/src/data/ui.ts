import { atom, useAtom } from "jotai"
import { useNavigate } from "@/lib/router"

const isWidgetOpenAtom = atom<boolean>(false)

export function useWidgetVisibility() {
  const navigate = useNavigate()
  const [isWidgetOpen, setIsWidgetOpen] = useAtom(isWidgetOpenAtom)

  const openWidget = (path?: string, state?: unknown) => {
    if (path) {
      navigate(path, state)
    }
    setIsWidgetOpen(true)
  }

  const closeWidget = () => {
    setIsWidgetOpen(false)
  }

  return { isWidgetOpen, openWidget, closeWidget }
}
