import type { ButtonHTMLAttributes, MouseEvent } from "react"
import { useNavigate } from "./RouterContext"

export interface LinkProp extends ButtonHTMLAttributes<HTMLButtonElement> {
  to: string | number
  state?: object
}

const Link = ({ to, state, children, onClick, ...attrs }: LinkProp) => {
  const navigate = useNavigate()

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    onClick?.(event)
    navigate(to, state)
  }

  return (
    <button type="button" {...attrs} onClick={handleClick}>
      {children}
    </button>
  )
}

export default Link
