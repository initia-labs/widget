import { atom, useAtom } from "jotai"
import { useReset } from "@/lib/router"

const isWidgetOpenAtom = atom<boolean>(false)

export function useWidgetVisibility() {
  const reset = useReset()
  const [isWidgetOpen, setIsWidgetOpen] = useAtom(isWidgetOpenAtom)

  const openWidget = (path: string, state?: object) => {
    if (path) {
      reset(path, state)
    }
    setIsWidgetOpen(true)
  }

  const closeWidget = () => {
    setIsWidgetOpen(false)
  }

  return { isWidgetOpen, openWidget, closeWidget }
}
