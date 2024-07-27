import type { ButtonHTMLAttributes, MouseEvent } from "react"
import { useNavigate } from "./RouterContext"

export interface LinkProp extends ButtonHTMLAttributes<HTMLButtonElement> {
  to: string | number
  state?: unknown
}

const Link = ({ to, state, children, ...attrs }: LinkProp) => {
  const navigate = useNavigate()

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    navigate(to, state)
  }

  return (
    <button type="button" {...attrs} onClick={handleClick}>
      {children}
    </button>
  )
}

export default Link
