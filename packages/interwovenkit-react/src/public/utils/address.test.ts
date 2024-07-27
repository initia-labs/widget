import { AddressUtils } from "./address"

const cases = [
  {
    description: "normal address",
    hex: "0x77d96ae5e7885B19b5Bf4e680E129ACe8fD58fB1",
    bech32: "init1wlvk4e083pd3nddlfe5quy56e68atra3gu9xfs",
  },
  {
    description: "hex with leading zero",
    hex: "0x08daE1855674207Fa0f4af1e7613bae38eB2eFeD",
    bech32: "init1prdwrp2kwss8lg854u08vya6uw8t9mldsqchdv",
  },
  {
    description: "special address",
    hex: "0x1", // invalid address
    bech32: "init1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqpqr5e3d",
    isSpecial: true,
  },
]

describe("Address module", () => {
  cases.forEach(({ description, hex, bech32, isSpecial }) => {
    describe(description, () => {
      test("should recognize valid bech32 address", () => {
        expect(AddressUtils.validate(bech32)).toBe(true)
      })

      test("should recognize valid hex address", () => {
        if (isSpecial) {
          expect(AddressUtils.validate(hex)).toBe(false)
          return
        }
        expect(AddressUtils.validate(hex)).toBe(true)
      })

      test("should convert hex to bech32 format correctly", () => {
        expect(AddressUtils.toBech32(hex)).toBe(bech32)
      })

      test("should convert bech32 to hex format correctly", () => {
        expect(AddressUtils.toPrefixedHex(bech32)).toBe(hex)
      })
    })
  })
})
