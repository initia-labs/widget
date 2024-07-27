import type { PropsWithChildren } from "react"
import Providers from "./providers"
import "./globals.css"

export default function RootLayout({ children }: Readonly<PropsWithChildren>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
