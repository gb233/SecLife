import type { ReactNode } from "react";
import { useCallback, useMemo, useState } from "react";
import { dataBundle } from "../engine/data";
import { LifeEngine } from "../engine/engine";
import type { EngineState, StartOptions, Summary } from "../engine/types";
import { SimulationContext } from "./SimulationContext";
import { addSummaryRecord } from "../utils/summaryStorage";

export function SimulationProvider({ children }: { children: ReactNode }) {
  const engine = useMemo(() => new LifeEngine(dataBundle), []);
  const [state, setState] = useState<EngineState>(() => snapshotState(engine.getState()));
  const [summary, setSummary] = useState<Summary | null>(null);

  const start = useCallback(
    (options?: StartOptions) => {
      engine.start(options);
      setState(snapshotState(engine.getState()));
      setSummary(null);
    },
    [engine]
  );

  const next = useCallback(() => {
    const result = engine.next();
    setState(snapshotState(engine.getState()));
    if (result.isEnd) {
      const summary = engine.getSummary();
      setSummary(summary);
      addSummaryRecord({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        createdAt: new Date().toISOString(),
        age: engine.getState().age,
        endingId: summary.ending.id,
        summary: {
          ...summary,
          log: [...engine.getState().log],
        },
      });
    }
    return result;
  }, [engine]);

  const reset = useCallback(() => {
    engine.start();
    setState(snapshotState(engine.getState()));
    setSummary(null);
  }, [engine]);

  return (
    <SimulationContext.Provider value={{ state, summary, start, next, reset }}>
      {children}
    </SimulationContext.Provider>
  );
}

function snapshotState(state: EngineState): EngineState {
  return {
    ...state,
    stats: { ...state.stats },
    flags: new Set(state.flags),
    tags: new Set(state.tags),
    talents: [...state.talents],
    talentTriggers: { ...state.talentTriggers },
    achievements: new Set(state.achievements),
    careerNodes: new Set(state.careerNodes),
    seenEvents: new Set(state.seenEvents),
    log: [...state.log],
  };
}
