import { createContext, useContext } from "react";
import type { EngineState, StartOptions, Summary, YearResult } from "../engine/types";

type SimulationStore = {
  state: EngineState;
  summary: Summary | null;
  start: (options?: StartOptions) => void;
  next: () => YearResult;
  reset: () => void;
};

export const SimulationContext = createContext<SimulationStore | null>(null);

export function useSimulation() {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error("useSimulation must be used within SimulationProvider");
  }
  return context;
}
