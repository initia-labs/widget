import type { PropsWithChildren } from "react"
import { useRef, useState, useEffect } from "react"
import { useSpring, animated } from "@react-spring/web"

const AnimatedHeight = ({ children }: PropsWithChildren) => {
  const contentRef = useRef<HTMLDivElement>(null)
  const [contentHeight, setContentHeight] = useState(0)

  const style = useSpring({
    height: contentHeight,
    config: { duration: 150 },
  })

  useEffect(() => {
    if (contentRef.current) {
      const { height } = contentRef.current.getBoundingClientRect()
      setContentHeight(height)
    }
  }, [children])

  return (
    <animated.div style={{ overflow: "hidden", ...style }}>
      <div ref={contentRef}>{children}</div>
    </animated.div>
  )
}

export default AnimatedHeight
