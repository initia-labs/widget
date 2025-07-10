/* eslint-disable no-console */

/**
 * Temporary workaround for Radix UI Shadow DOM:
 * Radix UI incorrectly logs a console.error when using <DialogContent> inside a Shadow DOM.
 * Upstream issue reported and PR available.
 */

const originalConsoleError = console.error
const originalConsoleWarn = console.warn

const SILENCED_ERROR_PHRASE = "`DialogContent` requires a `DialogTitle`"
const SILENCED_WARN_PHRASE = "Missing `Description`"

console.error = (...args: unknown[]): void => {
  const shouldSilence = args.some(
    (arg): arg is string => typeof arg === "string" && arg.includes(SILENCED_ERROR_PHRASE),
  )
  if (shouldSilence) return
  originalConsoleError(...args)
}

console.warn = (...args: unknown[]): void => {
  const shouldSilence = args.some(
    (arg): arg is string => typeof arg === "string" && arg.includes(SILENCED_WARN_PHRASE),
  )
  if (shouldSilence) return
  originalConsoleWarn(...args)
}
