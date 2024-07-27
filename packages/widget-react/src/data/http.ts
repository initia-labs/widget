import { HTTPError } from "ky"
import { includes, pathOr } from "ramda"

export const STALE_TIMES = {
  SECOND: 1000,
  MINUTE: 1000 * 60,
  INFINITY: /* HOUR, just in case */ 1000 * 60 * 60,
} as const

export async function normalizeError(error: unknown): Promise<string> {
  if (error instanceof HTTPError) {
    const { response } = error
    const contentType = response.headers.get("content-type") ?? ""

    if (includes("application/json", contentType)) {
      try {
        const data = await response.json()
        return pathOr(JSON.stringify(data), ["message"], data)
      } catch {
        return error.message
      }
    }

    try {
      return await response.text()
    } catch {
      return error.message
    }
  }

  if (error instanceof Error) return error.message

  return String(error)
}
