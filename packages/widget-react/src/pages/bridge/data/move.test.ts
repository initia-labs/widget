import { fromBase64 } from "@cosmjs/encoding"
import { stringifyBcsArgs } from "./move"

describe("stringifyBcsArgs", () => {
  it("handles u8", () => {
    expect(stringifyBcsArgs([fromBase64("AA==")], ["u8"])[0].decoded).toBe(0)
    expect(stringifyBcsArgs([fromBase64("AQ==")], ["u8"])[0].decoded).toBe(1)
    expect(stringifyBcsArgs([fromBase64("/w==")], ["u8"])[0].decoded).toBe(255)
  })

  it("handles u64", () => {
    expect(stringifyBcsArgs([fromBase64("AAAAAAAAAAA=")], ["u64"])[0].decoded).toBe("0")
    expect(stringifyBcsArgs([fromBase64("EgAAAAAAAAA=")], ["u64"])[0].decoded).toBe("18")
    expect(stringifyBcsArgs([fromBase64("oIYBAAAAAAA=")], ["u64"])[0].decoded).toBe("100000")
    expect(stringifyBcsArgs([fromBase64("0gKWSQAAAAA=")], ["u64"])[0].decoded).toBe("1234567890")
  })

  it("handles strings", () => {
    expect(stringifyBcsArgs([fromBase64("AA==")], ["0x1::string::String"])[0].decoded).toBe("")
    expect(
      stringifyBcsArgs([fromBase64("C2hlbGxvIHdvcmxk")], ["0x1::string::String"])[0].decoded,
    ).toBe("hello world")
    expect(stringifyBcsArgs([fromBase64("BkluaXRpYQ==")], ["0x1::string::String"])[0].decoded).toBe(
      "Initia",
    )
  })

  it("handles booleans", () => {
    expect(stringifyBcsArgs([fromBase64("AQ==")], ["bool"])[0].decoded).toBe(true)
    expect(stringifyBcsArgs([fromBase64("AA==")], ["bool"])[0].decoded).toBe(false)
  })

  it("handles vectors", () => {
    expect(stringifyBcsArgs([fromBase64("BQUEAwIB")], ["vector<u8>"])[0].decoded).toStrictEqual([
      5, 4, 3, 2, 1,
    ])
    expect(
      stringifyBcsArgs([fromBase64("AwVIZWxsbwV3b3JsZAEh")], ["vector<0x1::string::String>"])[0]
        .decoded,
    ).toStrictEqual(["Hello", "world", "!"])
  })
})
