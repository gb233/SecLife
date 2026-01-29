import type { Summary } from "../engine/types";

const STORAGE_KEY = "safety-life:summary-history";

export type SummaryRecord = {
  id: string;
  createdAt: string;
  age: number;
  endingId: string;
  summary: Summary;
};

export function loadSummaryHistory(): SummaryRecord[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as SummaryRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveSummaryHistory(records: SummaryRecord[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function addSummaryRecord(record: SummaryRecord): SummaryRecord[] {
  const existing = loadSummaryHistory();
  const next = [record, ...existing];
  saveSummaryHistory(next);
  return next;
}

export function removeSummaryRecord(id: string): SummaryRecord[] {
  const existing = loadSummaryHistory();
  const next = existing.filter((item) => item.id !== id);
  saveSummaryHistory(next);
  return next;
}

export function clearSummaryHistory(): SummaryRecord[] {
  saveSummaryHistory([]);
  return [];
}
