import { describe, expect, it } from "vitest";
import { dataBundle } from "./data";
import { LifeEngine } from "./engine";

describe("LifeEngine", () => {
  it("advances time and produces log entries", () => {
    const testBundle = {
      ...dataBundle,
      config: { ...dataBundle.config, ageEnd: 18 },
    };
    const engine = new LifeEngine(testBundle, () => 0.1);
    engine.start({ allocations: { tech: 5 }, talents: ["talent_curiosity"] });
    const result = engine.next();
    expect(result.age).toBe(testBundle.config.ageStart);
    expect(result.entries.length).toBeGreaterThan(0);
  });

  it("produces a summary after end", () => {
    const testBundle = {
      ...dataBundle,
      config: { ...dataBundle.config, ageEnd: dataBundle.config.ageStart + 2 },
    };
    const engine = new LifeEngine(testBundle, () => 0.1);
    engine.start({ allocations: { tech: 10 } });
    engine.next();
    engine.next();
    const summary = engine.getSummary();
    expect(summary.ending).toBeDefined();
    expect(summary.totalYears).toBeGreaterThan(0);
  });
});
