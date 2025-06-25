import { last } from "ramda"
import { toBase64 } from "@cosmjs/encoding"
import type { BcsType } from "@mysten/bcs"
import { bcs } from "@mysten/bcs"

export function stringifyValue(content: unknown): string {
  switch (typeof content) {
    case "string":
      return content

    case "number":
    case "bigint":
      return content.toString()

    case "boolean":
      return content ? "true" : "false"

    case "object":
      if (content === null) return "null"
      if (content instanceof Uint8Array) return toBase64(content)
      if (Array.isArray(content)) return `[${content.map(stringifyValue).join(",")}]`
      return JSON.stringify(content, (_, value) =>
        typeof value === "bigint" ? value.toString() : value,
      )

    default:
      return "unknown"
  }
}

/** Recursively resolves a Move-style type string into a bcs.*() call */
export function resolveBcsType(typeStr: string): BcsType<unknown, unknown> {
  // Try to match a generic like Foo<InnerType>
  const genericMatch = typeStr.trim().match(/^(\w+)<(.+)>$/)
  if (genericMatch) {
    const [, container, inner] = genericMatch
    // recurse for the inner type
    const innerBcs = resolveBcsType(inner)
    // invoke the container function on the result
    // @ts-expect-error // guaranteed to be a valid bcs.*() function
    return bcs[container](innerBcs)
  }

  // Not a generic: split on "::" and take last segment lowercased
  const baseName = last(typeStr.split("::"))!.toLowerCase()

  // call the corresponding bcs.*()
  // @ts-expect-error // guaranteed to be a valid bcs.*() function
  return bcs[baseName]()
}
