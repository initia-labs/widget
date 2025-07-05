import clsx from "clsx"
import type { ImgHTMLAttributes, ReactNode } from "react"
import { Img } from "react-image"
import styles from "./Image.module.css"

interface Props extends ImgHTMLAttributes<HTMLImageElement> {
  placeholder?: ReactNode
  classNames?: { placeholder?: string }
  circle?: boolean
}

const Image = ({ src, alt, placeholder, classNames, circle, ...attrs }: Props) => {
  const { width, height } = attrs
  const unloader = placeholder ?? (
    <div className={clsx(styles.placeholder, classNames?.placeholder)} style={{ width, height }} />
  )

  if (!src) {
    return unloader
  }

  return (
    <Img
      {...attrs}
      className={clsx(attrs.className, { [styles.circle]: circle })}
      style={{ width, height }}
      src={src}
      alt={alt}
      unloader={unloader}
      loading="lazy"
    />
  )
}

export default Image
