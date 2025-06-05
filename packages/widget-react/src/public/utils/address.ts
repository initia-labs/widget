import { getAddress } from "ethers"
import { fromBech32, fromHex, toBech32, toHex } from "@cosmjs/encoding"

export const Address = {
  toBytes(address: string, byteLength: number = 20) {
    if (!address) throw new Error("address is required")

    if (address.match(/^(0x)?[0-9a-fA-F]+$/)) {
      const hex = address.replace(/^0x/, "").padStart(byteLength * 2, "0")
      return fromHex(hex)
    }

    const { data } = fromBech32(address)
    if (data.length >= byteLength) return data
    return new Uint8Array([...Array(byteLength - data.length).fill(0), ...data])
  },

  toBech32(address: string, prefix: string = "init") {
    if (!address) return ""
    return toBech32(prefix, Address.toBytes(address))
  },

  toHex(address: string) {
    if (!address) return ""
    return toHex(Address.toBytes(address))
  },

  toPrefixedHex(address: string) {
    if (!address) return ""
    const checksummed = getAddress(Address.toHex(address))
    const bytes = Address.toBytes(address)
    const last = bytes[bytes.length - 1]
    const isSpecial = bytes.subarray(0, bytes.length - 1).every((byte) => byte === 0) && last < 0x10
    if (isSpecial) return checksummed.replace(/^0x0+/, "0x")
    return checksummed
  },

  validate(address: string, prefix: string = "init") {
    if (/^0x[0-9a-fA-F]{1,40}$/.test(address)) {
      return true
    }

    try {
      return fromBech32(address).prefix === prefix
    } catch {
      return false
    }
  },

  equals(address1: string, address2: string) {
    return Address.toBech32(address1) === Address.toBech32(address2)
  },
}
