import { describe, expect, it } from "vitest";
import { dataBundle } from "./data";

describe("dataBundle", () => {
  it("meets content volume targets", () => {
    expect(dataBundle.events.length).toBeGreaterThanOrEqual(80);
    expect(dataBundle.talents.length).toBeGreaterThanOrEqual(30);
    expect(dataBundle.talents.length).toBeLessThanOrEqual(40);
    expect(dataBundle.achievements.length).toBeGreaterThanOrEqual(30);
    expect(dataBundle.achievements.length).toBeLessThanOrEqual(50);
    expect(dataBundle.endings.list.length).toBeGreaterThanOrEqual(12);
    expect(dataBundle.endings.list.length).toBeLessThanOrEqual(20);
  });
});
