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
  return (
    <Img
      {...attrs}
      className={clsx(attrs.className, { [styles.circle]: circle })}
      src={getProxyImage(src)}
      alt={alt}
      unloader={unloader}
      loading="lazy"
    />
  )
}

export default Image

function getProxyImage(url?: string) {
  if (!url) return ""
  if (url.trim().startsWith("data:image/")) return url
  const proxy = "https://img.initia.xyz/?url="
  return proxy + url.replace(proxy, "")
}
