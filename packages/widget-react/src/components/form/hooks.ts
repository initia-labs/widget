import { useEffect, useRef } from "react"
import useMedia from "react-use/lib/useMedia"

export function useAutoFocus<T extends HTMLInputElement>() {
  const ref = useRef<T>(null)
  const isSmall = useMedia("(max-width: 576px)")

  useEffect(() => {
    if (isSmall) return
    ref.current?.focus()
  }, [isSmall])

  return ref
}
