import { checkCondition } from "./condition";
import { weightedRandom } from "./random";
import type {
  DataBundle,
  EngineState,
  LogEntry,
  StartOptions,
  Summary,
  YearResult,
} from "./types";
import type { Event, Talent } from "./schema";

const DEFAULT_RNG = () => Math.random();

export class LifeEngine {
  private data: DataBundle;
  private rng: () => number;
  private state: EngineState;
  private eventMap: Map<string, Event>;
  private talentMap: Map<string, Talent>;
  private ageMap: Map<number, { events: { id: string; weight: number }[]; talents: string[] }>;

  constructor(data: DataBundle, rng: () => number = DEFAULT_RNG) {
    this.data = data;
    this.rng = rng;
    this.eventMap = new Map(data.events.map((event) => [event.id, event]));
    this.talentMap = new Map(data.talents.map((talent) => [talent.id, talent]));
    this.ageMap = new Map(
      data.age.map((entry) => [entry.age, { events: entry.events, talents: entry.talents }])
    );
    this.state = this.createInitialState();
  }

  start(options: StartOptions = {}) {
    this.state = this.createInitialState();
    if (options.talents) {
      const resolution = this.resolveTalents(options.talents);
      this.state.talents = resolution.talents;
      resolution.replacements.forEach(({ source, target }) => {
        const sourceName = this.talentMap.get(source)?.name ?? source;
        const targetName = this.talentMap.get(target)?.name ?? target;
        this.state.log.push({
          age: this.data.config.ageStart,
          type: "SYSTEM",
          title: "天赋替换",
          text: `将「${sourceName}」替换为「${targetName}」。`,
        });
      });
    }
    if (options.allocations) {
      this.applyAllocations(options.allocations, options.pointBonus ?? 0);
    }
    this.evaluateAchievements("START");
    return this.state;
  }

  next(): YearResult {
    if (this.state.isEnd) {
      return { age: this.state.age, entries: [], isEnd: true };
    }

    const targetAge = this.state.age + 1;
    this.state.age = targetAge;
    const entries: LogEntry[] = [];

    const agePayload = this.ageMap.get(targetAge);
    if (!agePayload || !agePayload.events || agePayload.events.length === 0) {
      entries.push({
        age: targetAge,
        type: "SYSTEM",
        title: "人生落幕",
        text: "这一年没有新的故事，你的人生在平静中落幕。",
      });
      this.state.isEnd = true;
      this.evaluateAchievements("SUMMARY");
      this.evaluateAchievements("END");
      if (entries.length > 0) {
        this.state.log.push(entries[0]);
      }
      return { age: this.state.age, entries, isEnd: true };
    }

    const ageEvents = agePayload.events;
    const ageTalents = agePayload.talents ?? [];

    const talentEntries = this.applyTalents([...this.state.talents, ...ageTalents]);
    entries.push(...talentEntries);

    const eventEntry = this.pickEvent(ageEvents);
    if (eventEntry) {
      const chain = this.applyEventChain(eventEntry.id);
      entries.push(...chain);
    } else {
      entries.push({
        age: targetAge,
        type: "SYSTEM",
        title: "人生落幕",
        text: "这一年没有新的故事，你的人生在平静中落幕。",
      });
      this.state.isEnd = true;
      entries.push(...this.evaluateAchievements("SUMMARY"));
      entries.push(...this.evaluateAchievements("END"));
      if (entries.length > 0) {
        this.state.log.push(...entries);
      }
      return { age: this.state.age, entries, isEnd: true };
    }

    entries.push(...this.unlockCareers());
    entries.push(...this.evaluateAchievements("TRAJECTORY"));

    this.applyAgingDecay(targetAge);

    this.state.isEnd = this.isEnd();
    if (this.state.isEnd) {
      entries.push(...this.evaluateAchievements("SUMMARY"));
      entries.push(...this.evaluateAchievements("END"));
    }

    if (entries.length > 0) {
      this.state.log.push(...entries);
    }
    return { age: this.state.age, entries, isEnd: this.state.isEnd };
  }

  getSummary(): Summary {
    const ending = this.selectEnding();
    return {
      ending,
      stats: { ...this.state.stats },
      achievements: Array.from(this.state.achievements),
      careerNodes: Array.from(this.state.careerNodes),
      totalYears: this.state.age - this.data.config.ageStart,
    };
  }

  getState(): EngineState {
    return this.state;
  }

  private createInitialState(): EngineState {
    const baseStats: Record<string, number> = {};
    this.data.config.stats.forEach((stat) => {
      baseStats[stat.id] = stat.base;
    });
    return {
      age: this.data.config.ageStart - 1,
      stats: baseStats,
      flags: new Set<string>(),
      tags: new Set<string>(),
      talents: [],
      talentTriggers: {},
      achievements: new Set<string>(),
      careerNodes: new Set<string>(),
      seenEvents: new Set<string>(),
      log: [],
      isEnd: false,
    };
  }

  private applyAllocations(allocations: Record<string, number>, pointBonus: number) {
    const maxPoints = this.data.config.initialPoints + pointBonus;
    const total = Object.values(allocations).reduce((sum, value) => sum + value, 0);
    if (total > maxPoints) return;
    Object.entries(allocations).forEach(([key, value]) => {
      if (key in this.state.stats) {
        this.state.stats[key] = this.clampStat(key, this.state.stats[key] + value);
      }
    });
  }

  private resolveTalents(
    talentIds: string[]
  ): { talents: string[]; replacements: { source: string; target: string }[] } {
    const unique = Array.from(new Set(talentIds));
    const selected: string[] = [];

    unique.forEach((id) => {
      if (!this.talentMap.has(id)) return;
      if (this.hasTalentConflict(id, selected)) return;
      selected.push(id);
    });

    const resolved = [...selected];
    const replacements: { source: string; target: string }[] = [];
    selected.forEach((id) => {
      const replacementId = this.resolveReplacement(id, resolved);
      if (replacementId !== id && !resolved.includes(replacementId)) {
        resolved.push(replacementId);
        replacements.push({ source: id, target: replacementId });
      }
    });

    return { talents: resolved, replacements };
  }

  private resolveReplacement(talentId: string, current: string[], depth = 0): string {
    if (depth >= 4) return talentId;
    const pool = this.buildReplacementPool(talentId, current);
    if (pool.length === 0) return talentId;
    const selected = weightedRandom(
      pool.map((entry) => ({ item: entry.id, weight: entry.weight })),
      this.rng
    );
    if (selected === talentId) return talentId;
    return this.resolveReplacement(selected, [...current, selected], depth + 1);
  }

  private buildReplacementPool(
    talentId: string,
    current: string[]
  ): { id: string; weight: number }[] {
    const talent = this.talentMap.get(talentId);
    const replacement = talent?.replacement;
    if (!replacement) return [];

    const pool: { id: string; weight: number }[] = [];

    replacement.common?.forEach((entry) => {
      if (!this.talentMap.has(entry.id)) return;
      if (this.hasTalentConflict(entry.id, current)) return;
      pool.push({ id: entry.id, weight: entry.weight });
    });

    replacement.talent?.forEach((entry) => {
      const { key, weight } = this.parseWeightedToken(entry);
      if (!this.talentMap.has(key)) return;
      if (this.hasTalentConflict(key, current)) return;
      pool.push({ id: key, weight });
    });

    replacement.grade?.forEach((entry) => {
      const { key, weight } = this.parseWeightedToken(entry);
      const grade = Number(key);
      if (!Number.isFinite(grade)) return;
      this.talentMap.forEach((candidate) => {
        if (candidate.exclusive) return;
        if (candidate.grade !== grade) return;
        if (this.hasTalentConflict(candidate.id, current)) return;
        pool.push({ id: candidate.id, weight });
      });
    });

    return pool;
  }

  private parseWeightedToken(entry: string | number): { key: string; weight: number } {
    if (typeof entry === "number") {
      return { key: String(entry), weight: 1 };
    }
    const [rawKey, rawWeight] = entry.split("*");
    const weight = rawWeight ? Number(rawWeight) : 1;
    return { key: rawKey, weight: Number.isFinite(weight) ? weight : 1 };
  }

  private hasTalentConflict(candidateId: string, current: string[]): boolean {
    const candidate = this.talentMap.get(candidateId);
    if (!candidate) return true;
    for (const existingId of current) {
      if (existingId === candidateId) return true;
      const existing = this.talentMap.get(existingId);
      if (candidate.exclude?.includes(existingId)) return true;
      if (existing?.exclude?.includes(candidateId)) return true;
    }
    return false;
  }

  private applyTalents(talentIds: string[]): LogEntry[] {
    const entries: LogEntry[] = [];
    talentIds.forEach((id) => {
      const talent = this.talentMap.get(id);
      if (!talent) return;
      if (!checkCondition(this.state, talent.condition)) return;
      const triggers = this.state.talentTriggers[id] ?? 0;
      const maxTriggers = talent.maxTriggers ?? 1;
      if (triggers >= maxTriggers) return;

      this.state.talentTriggers[id] = triggers + 1;
      this.applyEffects(talent.effects);
      entries.push({
        age: this.state.age,
        type: "TLT",
        title: talent.name,
        text: talent.description,
        grade: talent.grade,
      });
    });
    return entries;
  }

  private pickEvent(ageEvents: { id: string; weight: number }[]): { id: string; weight: number } | null {
    const candidates = ageEvents.filter(({ id }) => this.eventMap.has(id));
    const filtered = candidates.filter(({ id }) => {
      const event = this.eventMap.get(id);
      if (!event) return false;
      if (event.noRandom) return false;
      if (event.include && !checkCondition(this.state, event.include)) return false;
      if (event.exclude && checkCondition(this.state, event.exclude)) return false;
      return true;
    });
    if (filtered.length === 0) return null;
    const selectedId = weightedRandom(
      filtered.map((entry) => ({ item: entry, weight: entry.weight })),
      this.rng
    );
    return selectedId;
  }

  private applyEventChain(eventId: string, visited = new Set<string>()): LogEntry[] {
    const event = this.eventMap.get(eventId);
    if (!event) return [];
    if (visited.has(eventId)) {
      return [{
        age: this.state.age,
        type: "SYSTEM",
        title: "事件循环",
        text: "事件链路检测到循环，已终止继续触发。",
      }];
    }
    visited.add(eventId);
    this.state.seenEvents.add(eventId);
    this.applyEffects(event.effects);
    const entry: LogEntry = {
      age: this.state.age,
      type: "EVT",
      title: event.title,
      text: event.text,
      grade: event.grade,
    };

    const next = event.branch?.find((branch) => checkCondition(this.state, branch.condition))?.next;
    if (next) {
      return [entry, ...this.applyEventChain(next, visited)];
    }
    return [entry];
  }

  private applyAgingDecay(age: number) {
    if (age < 60) return;
    let decay = 1;
    if (age >= 80) decay = 3;
    if (age >= 100) decay = 5;
    this.applyEffects({ stats: { health: -decay, happiness: -1 } });
  }

  private applyEffects(
    effects?: {
      stats?: Record<string, number>;
      flagsAdd?: string[];
      flagsRemove?: string[];
      tagsAdd?: string[];
      tagsRemove?: string[];
    }
  ) {
    if (!effects) return;
    if (effects.stats) {
      Object.entries(effects.stats).forEach(([key, value]) => {
        if (key in this.state.stats) {
          this.state.stats[key] = this.clampStat(key, this.state.stats[key] + value);
        }
      });
    }
    effects.flagsAdd?.forEach((flag) => this.state.flags.add(flag));
    effects.flagsRemove?.forEach((flag) => this.state.flags.delete(flag));
    effects.tagsAdd?.forEach((tag) => this.state.tags.add(tag));
    effects.tagsRemove?.forEach((tag) => this.state.tags.delete(tag));
  }

  private unlockCareers(): LogEntry[] {
    const entries: LogEntry[] = [];
    this.data.careers.nodes.forEach((node) => {
      if (this.state.careerNodes.has(node.id)) return;
      if (node.requires?.ageMin && this.state.age < node.requires.ageMin) return;
      if (node.requires?.stats) {
        const ok = Object.entries(node.requires.stats).every(
          ([key, value]) => (this.state.stats[key] ?? 0) >= value
        );
        if (!ok) return;
      }
      if (node.requires?.flags) {
        const ok = node.requires.flags.every((flag) => this.state.flags.has(flag));
        if (!ok) return;
      }
      if (node.requires?.achievements) {
        const ok = node.requires.achievements.every((id) => this.state.achievements.has(id));
        if (!ok) return;
      }

      this.state.careerNodes.add(node.id);
      this.applyEffects({
        stats: node.effects?.stats,
        flagsAdd: node.effects?.flagsAdd,
        tagsAdd: node.effects?.tagsAdd,
      });
      entries.push({
        age: this.state.age,
        type: "CAREER",
        title: node.title,
        text: "职业节点解锁。",
      });
    });
    return entries;
  }

  private evaluateAchievements(opportunity: "START" | "TRAJECTORY" | "SUMMARY" | "END"): LogEntry[] {
    const entries: LogEntry[] = [];
    this.data.achievements
      .filter((achv) => achv.opportunity === opportunity)
      .forEach((achv) => {
        if (this.state.achievements.has(achv.id)) return;
        if (checkCondition(this.state, achv.condition)) {
          this.state.achievements.add(achv.id);
          entries.push({
            age: this.state.age,
            type: "ACHV",
            title: achv.name,
            text: achv.description,
            grade: achv.grade,
          });
        }
      });
    return entries;
  }

  private isEnd(): boolean {
    if (this.state.stats.health <= 0) return true;
    return false;
  }

  private selectEnding(): { id: string; title: string; summary: string; grade: number; priority: number; condition: string; tags?: string[] } {
    const matches = this.data.endings.list
      .filter((ending) => checkCondition(this.state, ending.condition))
      .sort((a, b) => b.priority - a.priority);
    if (matches.length > 0) return matches[0];
    return (
      this.data.endings.list.find((ending) => ending.id === this.data.endings.defaultEndingId) ??
      this.data.endings.list[0]
    );
  }

  private clampStat(key: string, value: number): number {
    const statDef = this.data.config.stats.find((stat) => stat.id === key);
    if (!statDef) return value;
    return Math.min(statDef.max, Math.max(statDef.min, value));
  }
}
