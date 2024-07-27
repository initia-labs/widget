import { useEffect, useRef } from "react"

export function useAutoFocus<T extends HTMLInputElement>() {
  const ref = useRef<T>(null)

  useEffect(() => {
    ref.current?.focus()
  }, [])

  return ref
}
