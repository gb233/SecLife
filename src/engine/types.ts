import type {
  Achievement,
  AgeEntry,
  Careers,
  Config,
  Ending,
  Endings,
  Event,
  Talent,
} from "./schema";

export type DataBundle = {
  config: Config;
  age: AgeEntry[];
  events: Event[];
  talents: Talent[];
  achievements: Achievement[];
  careers: Careers;
  endings: Endings;
};

export type LogEntry = {
  age: number;
  type: "TLT" | "EVT" | "ACHV" | "CAREER" | "SYSTEM";
  title: string;
  text: string;
  grade?: number;
};

export type EngineState = {
  age: number;
  stats: Record<string, number>;
  flags: Set<string>;
  tags: Set<string>;
  talents: string[];
  talentTriggers: Record<string, number>;
  achievements: Set<string>;
  careerNodes: Set<string>;
  seenEvents: Set<string>;
  log: LogEntry[];
  isEnd: boolean;
};

export type StartOptions = {
  allocations?: Record<string, number>;
  talents?: string[];
  pointBonus?: number;
};

export type YearResult = {
  age: number;
  entries: LogEntry[];
  isEnd: boolean;
};

export type Summary = {
  ending: Ending;
  stats: Record<string, number>;
  achievements: string[];
  careerNodes: string[];
  totalYears: number;
  log?: LogEntry[];
};
