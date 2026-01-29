import { describe, expect, it } from "vitest";
import { checkCondition } from "./condition";
import type { EngineState } from "./types";

const baseState: EngineState = {
  age: 20,
  stats: {
    tech: 30,
    social: 15,
    ethics: 20,
    reputation: 10,
    risk: 25,
    health: 60,
    money: 5,
  },
  flags: new Set(["FLAG_CTF"]),
  tags: new Set(["blue", "general"]),
  talents: [],
  talentTriggers: {},
  achievements: new Set(["achv_start_tech"]),
  careerNodes: new Set(),
  log: [],
  isEnd: false,
};

describe("checkCondition", () => {
  it("supports numeric comparisons", () => {
    expect(checkCondition(baseState, "tech>=30")).toBe(true);
    expect(checkCondition(baseState, "social>20")).toBe(false);
  });

  it("supports logical operators", () => {
    expect(checkCondition(baseState, "tech>=30 & ethics>=20")).toBe(true);
    expect(checkCondition(baseState, "tech>=30 & ethics>=40")).toBe(false);
    expect(checkCondition(baseState, "tech>=30 | ethics>=40")).toBe(true);
  });

  it("supports list queries", () => {
    expect(checkCondition(baseState, "AGE?[20,21]")).toBe(true);
    expect(checkCondition(baseState, "FLAG?[FLAG_CTF]")).toBe(true);
    expect(checkCondition(baseState, "TAG?[blue]")).toBe(true);
    expect(checkCondition(baseState, "ACHV?[achv_start_tech]")).toBe(true);
  });
});
