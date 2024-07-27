import { truncate } from "./text"

test("truncate", () => {
  const ADDRESS = "init1wlvk4e083pd3nddlfe5quy56e68atra3gu9xfs"
  expect(truncate(ADDRESS)).toBe("init1w...gu9xfs")
  expect(truncate(ADDRESS, [3, 3])).toBe("ini...xfs")
  expect(truncate("short")).toBe("short")
})
