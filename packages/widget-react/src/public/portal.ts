import { useEffect } from "react"
import { useConfig } from "@/data/config"

// A dedicated host element ensures the widget's Shadow DOM stays isolated even
// if multiple instances are rendered.
const WIDGET_ELEMENT_TAG = "initia-widget"

// Create or fetch the Shadow DOM root used by the widget. The Shadow DOM keeps
// our styles from leaking out to the host page.
function getShadowRoot() {
  const host =
    document.querySelector(WIDGET_ELEMENT_TAG) ||
    document.body.appendChild(document.createElement(WIDGET_ELEMENT_TAG))

  return host.shadowRoot || host.attachShadow({ mode: "open" })
}

// Portal container for rendering Drawer components.
// In local development, elements are injected directly into the body.
// In production, they are injected into a shadow root.
export function usePortalContainer() {
  const { theme } = useConfig()

  useEffect(() => {
    const host = document.querySelector<HTMLElement>(WIDGET_ELEMENT_TAG)
    host?.setAttribute("data-theme", theme)
  }, [theme])

  // During development we skip the Shadow DOM so hot module replacement works
  // seamlessly with the host page.
  if (import.meta.env.DEV) {
    return document.body
  }

  return getShadowRoot()
}

// Utility to let users manually append the provided stylesheet to the shadow root.
// The stylesheet is shipped as a CSS file, but users are expected to load it as text.
// Note: Since this function uses `document`, SSR users should handle it accordingly.
export function injectStyles(css: string) {
  const shadowRoot = getShadowRoot()
  const style = document.createElement("style")
  style.textContent = css
  shadowRoot.appendChild(style)
}
