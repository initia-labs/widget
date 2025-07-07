import { fromBase64 } from "@cosmjs/encoding"
import { resolveBcsType } from "./stringify"

describe("resolveBcsType", () => {
  it("parses u8 values correctly", () => {
    const parse = (input: string) => resolveBcsType("u8").parse(fromBase64(input))

    expect(parse("AA==")).toBe(0)
    expect(parse("AQ==")).toBe(1)
    expect(parse("/w==")).toBe(255)
  })

  it("parses u64 values correctly", () => {
    const parse = (input: string) => resolveBcsType("u64").parse(fromBase64(input))

    expect(parse("AAAAAAAAAAA=")).toBe("0")
    expect(parse("oIYBAAAAAAA=")).toBe("100000")
    expect(parse("0gKWSQAAAAA=")).toBe("1234567890")
  })

  it("parses Move strings correctly", () => {
    const parse = (input: string) => resolveBcsType("0x1::string::String").parse(fromBase64(input))

    expect(parse("AA==")).toBe("")
    expect(parse("BkluaXRpYQ==")).toBe("Initia")
  })

  it("parses bool values correctly", () => {
    const parse = (input: string) => resolveBcsType("bool").parse(fromBase64(input))

    expect(parse("AQ==")).toBe(true)
    expect(parse("AA==")).toBe(false)
  })

  it("parses vector<u8> correctly", () => {
    const parse = (input: string) => resolveBcsType("vector<u8>").parse(fromBase64(input))

    expect(parse("AA==")).toEqual([])
    expect(parse("AwECAw==")).toEqual([1, 2, 3])
  })

  it("parses vector<String> correctly", () => {
    const parse = (input: string) =>
      resolveBcsType("vector<0x1::string::String>").parse(fromBase64(input))

    expect(parse("AgVIZWxsbwVXb3JsZA==")).toEqual(["Hello", "World"])
  })

  it("parses option<u8> correctly", () => {
    const parse = (input: string) => resolveBcsType("option<u8>").parse(fromBase64(input))

    expect(parse("AA==")).toBeNull()
    expect(parse("Af8=")).toBe(255)
  })

  it("parses bigdecimals correctly", () => {
    const parse = (input: string) => resolveBcsType("bigdecimal").parse(fromBase64(input))

    expect(parse("CU7zPBOdY66sBg==")).toBe("123.123456789012345678")
    expect(parse("AWQ=")).toBe("0.0000000000000001")
  })
})
