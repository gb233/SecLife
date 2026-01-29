import { describe, expect, it } from "vitest";
import { weightedRandom } from "./random";

describe("weightedRandom", () => {
  it("returns first item when rng is 0", () => {
    const result = weightedRandom(
      [
        { item: "a", weight: 1 },
        { item: "b", weight: 2 },
      ],
      () => 0
    );
    expect(result).toBe("a");
  });

  it("returns last item when rng is high", () => {
    const result = weightedRandom(
      [
        { item: "a", weight: 1 },
        { item: "b", weight: 2 },
      ],
      () => 0.99
    );
    expect(result).toBe("b");
  });
});
