import { atom, useAtom } from "jotai"
import { useReset } from "@/lib/router"

const isDrawerOpenAtom = atom<boolean>(false)

export function useDrawer() {
  const reset = useReset()
  const [isOpen, setIsOpen] = useAtom(isDrawerOpenAtom)

  const open = (path: string, state?: object) => {
    if (path) {
      reset(path, state)
    }
    setIsOpen(true)
  }

  const close = () => {
    setIsOpen(false)
  }

  return { isDrawerOpen: isOpen, openDrawer: open, closeDrawer: close }
}
