import { useEffect, useMemo, useState } from "react";
import { dataBundle } from "../engine/data";
import type { LogEntry } from "../engine/types";
import { useSimulation } from "../state/SimulationContext";
import {
  clearSummaryHistory,
  loadSummaryHistory,
  removeSummaryRecord,
  type SummaryRecord,
} from "../utils/summaryStorage";

function SummaryPage() {
  const { summary, state, start } = useSimulation();
  const [history, setHistory] = useState<SummaryRecord[]>(() => loadSummaryHistory());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showTimeline, setShowTimeline] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const categoryLabel: Record<string, string> = {
    career: "职业",
    family: "家庭",
    risk: "风险",
    honor: "荣誉",
    fate: "命运",
  };

  useEffect(() => {
    const next = loadSummaryHistory();
    setHistory(next);
    if (!selectedId && next.length > 0) {
      setSelectedId(next[0].id);
    }
  }, [summary]);

  const selectedRecord = useMemo(() => {
    if (selectedId) {
      return history.find((item) => item.id === selectedId) ?? null;
    }
    return history[0] ?? null;
  }, [history, selectedId]);

  const displaySummary = selectedRecord?.summary ?? summary ?? null;
  const displayLog = selectedRecord?.summary?.log ?? [];

  const groupedLog = useMemo(() => {
    const map = new Map<number, LogEntry[]>();
    displayLog.forEach((entry) => {
      const list = map.get(entry.age) ?? [];
      list.push(entry);
      map.set(entry.age, list);
    });
    return Array.from(map.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([age, entries]) => {
        const main = entries.find((entry) => entry.type === "EVT") ?? entries[0];
        const extra = entries.filter((entry) => entry !== main);
        return {
          age,
          main,
          extraCount: extra.length,
        };
      });
  }, [displayLog]);

  const detailCards = displaySummary
    ? (() => {
        const endings = displaySummary.endings ?? [displaySummary.ending];
        const primary = endings[0];
        const primaryLabel = categoryLabel[primary?.category ?? "career"] ?? "职业";
        return (
          <>
            <div className="rounded-xl border border-slate/20 bg-ink/40 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate/40">结局组合</p>
              <h3 className="mt-3 text-sm font-semibold text-slate">
                <span className="mr-2 text-[11px] text-slate/50">[{primaryLabel}]</span>
                {primary?.title}
              </h3>
              <p className="mt-2 text-xs text-slate/70">{primary?.summary}</p>
              {endings.length > 1 ? (
                <div className="mt-3 space-y-1 text-[11px] text-slate/60">
                  {endings.slice(1).map((ending) => (
                    <p key={ending.id}>
                      · [{categoryLabel[ending.category ?? "career"] ?? "职业"}] {ending.title}
                    </p>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="rounded-xl border border-slate/20 bg-ink/40 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate/40">关键指标</p>
              <div className="mt-3 grid gap-2 text-xs text-slate/70">
                <div className="flex items-center justify-between">
                  <span>总成就</span>
                  <span>{displaySummary.achievements.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>职业节点</span>
                  <span>{displaySummary.careerNodes.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>累计年数</span>
                  <span>{displaySummary.totalYears}</span>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-slate/20 bg-ink/40 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate/40">属性终点</p>
              <div className="mt-3 grid gap-2 text-[11px] text-slate/70">
                {dataBundle.config.stats.map((stat) => (
                  <div key={stat.id} className="flex items-center justify-between">
                    <span>{stat.label}</span>
                    <span>{displaySummary.stats[stat.id]}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-slate/20 bg-ink/40 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate/40">解锁成就</p>
              <div className="mt-3 space-y-2 text-[11px] text-slate/70">
                {displaySummary.achievements.length === 0 ? (
                  <p>暂无解锁成就</p>
                ) : (
                  displaySummary.achievements.map((id) => {
                    const item = dataBundle.achievements.find((achv) => achv.id === id);
                    return <p key={id}>· {item?.name ?? id}</p>;
                  })
                )}
              </div>
            </div>
          </>
        );
      })()
    : null;

  return (
    <section className="panel flex h-full flex-col p-5 md:p-6">
      <div className="flex shrink-0 flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-lg font-semibold">结局回顾</h2>
          <p className="mt-2 text-xs text-slate/70">
            每次结局都会保存为记录，方便回看详情与复盘时间线。
          </p>
        </div>
        <button type="button" className="btn-primary" onClick={() => start()}>
          再开一局
        </button>
      </div>

      {displaySummary ? (
        <div className="mt-4 flex flex-1 justify-center overflow-y-auto pr-1">
          <div className="flex w-full max-w-3xl flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate/40">结局记录</p>
                <p className="mt-1 text-[11px] text-slate/60">共 {history.length} 条</p>
              </div>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => {
                  setHistory(clearSummaryHistory());
                  setSelectedId(null);
                }}
              >
                清空全部
              </button>
            </div>
            {history.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate/30 bg-ink/40 p-4 text-[11px] text-slate/60">
                暂无结局记录，继续模拟以生成第一条结局。
              </p>
            ) : (
              <div className="space-y-3">
                {history.map((record) => (
                  <div
                    key={record.id}
                    className={`rounded-xl border p-4 text-[11px] ${
                      record.id === selectedRecord?.id
                        ? "border-amber-400/60 bg-ink/60"
                        : "border-slate/20 bg-ink/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-slate">{record.summary.ending.title}</p>
                      <span className="text-slate/50">{new Date(record.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="mt-1 text-slate/60">
                      终局年龄 {record.age} · 生涯 {record.summary.totalYears} 年
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="btn-primary"
                        onClick={() => {
                          setSelectedId(record.id);
                          setShowTimeline(false);
                          setShowDetailModal(true);
                        }}
                      >
                        查看详情
                      </button>
                      <button
                        type="button"
                        className="btn-ghost"
                        onClick={() => {
                          setSelectedId(record.id);
                          setShowTimeline(true);
                        }}
                      >
                        复盘时间线
                      </button>
                      <button
                        type="button"
                        className="btn-ghost"
                        onClick={() => {
                          const next = removeSummaryRecord(record.id);
                          setHistory(next);
                          if (selectedId === record.id) {
                            setSelectedId(next[0]?.id ?? null);
                          }
                        }}
                      >
                        删除
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-dashed border-slate/30 bg-ink/40 p-4 text-xs text-slate/60">
          还没有结局记录，继续模拟以解锁结局。
          <div className="mt-3 text-[11px] text-slate/50">当前年龄：{state.age} 岁</div>
        </div>
      )}
      {showTimeline ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
          onClick={() => setShowTimeline(false)}
        >
          <div className="panel w-full max-w-3xl p-5" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate">复盘时间线</h3>
                <p className="mt-2 text-[11px] text-slate/60">{selectedRecord?.summary.ending.title}</p>
              </div>
              <button type="button" className="btn-ghost" onClick={() => setShowTimeline(false)}>
                关闭
              </button>
            </div>
            <div className="mt-4 max-h-[60vh] overflow-y-auto pr-1 text-[11px] text-slate/70">
              {groupedLog.length === 0 ? (
                <p>暂无时间线记录。</p>
              ) : (
                groupedLog.map((group) => (
                  <div key={group.age} className="border-b border-slate/20 py-2">
                    <span className="mr-2 text-slate/40">{group.age}岁：</span>
                    <span className="font-semibold text-slate">{group.main?.title}</span>
                    <span className="ml-2 text-slate/70">{group.main?.text}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : null}
      {showDetailModal && displaySummary ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
          onClick={() => setShowDetailModal(false)}
        >
          <div className="panel w-full max-w-3xl p-5" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate">结局详情</h3>
                <p className="mt-2 text-[11px] text-slate/60">{displaySummary.ending.title}</p>
              </div>
              <button type="button" className="btn-ghost" onClick={() => setShowDetailModal(false)}>
                关闭
              </button>
            </div>
            <div className="mt-4 max-h-[65vh] overflow-y-auto pr-1">
              <div className="grid gap-3 md:grid-cols-2">{detailCards}</div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default SummaryPage;
