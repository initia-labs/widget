import { useEffect, useRef, useState } from "react"

const AnimatedCollapse = ({
  children,
  isOpen,
  duration = 500,
}: {
  children: React.ReactNode
  isOpen: boolean
  duration?: number
}) => {
  const contentRef = useRef<HTMLDivElement>(null)
  const [shouldRender, setShouldRender] = useState(isOpen)
  console.log(contentRef.current)

  useEffect(() => {
    const el = contentRef.current
    if (!el) return

    if (isOpen) {
      setShouldRender(true)

      el.style.height = "0px"
      requestAnimationFrame(() => {
        el.style.transition = `height ${duration}ms ease`
        el.style.height = `${el.scrollHeight}px`
      })
    } else {
      el.style.height = `${el.scrollHeight}px`
      requestAnimationFrame(() => {
        el.style.transition = `height ${duration}ms ease`
        el.style.height = "0px"
      })
      setTimeout(() => setShouldRender(false), duration)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]) // we want this to run only when isOpen changes

  // Reset to auto after expand
  const handleTransitionEnd = () => {
    if (isOpen && contentRef.current) {
      contentRef.current.style.height = "auto"
    }
  }

  return (
    <div
      ref={contentRef}
      style={{ overflow: "hidden", height: "0px", display: shouldRender ? "block" : "none" }}
      onTransitionEnd={handleTransitionEnd}
    >
      {children}
    </div>
  )
}
export default AnimatedCollapse
