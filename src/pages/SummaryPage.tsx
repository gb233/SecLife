import { useEffect, useMemo, useState } from "react";
import { dataBundle } from "../engine/data";
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

  return (
    <section className="panel flex h-full flex-col p-5 md:p-6">
      <div className="flex shrink-0 flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-lg font-semibold">结局回顾</h2>
          <p className="mt-2 text-xs text-slate/70">
            每一次重开都生成独特结局，用于复盘你的一生路径。
          </p>
        </div>
        <button type="button" className="btn-primary" onClick={() => start()}>
          再次重开
        </button>
      </div>

      {displaySummary ? (
        <div className="mt-4 grid flex-1 gap-3 overflow-y-auto pr-1 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="panel flex flex-col gap-3 p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.2em] text-slate/40">结局列表</p>
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
              <p className="text-[11px] text-slate/60">暂无结局记录。</p>
            ) : (
              <div className="space-y-2 overflow-y-auto pr-1">
                {history.map((record) => (
                  <div
                    key={record.id}
                    className={`rounded-lg border p-3 text-[11px] ${
                      record.id === selectedRecord?.id
                        ? "border-amber-400/60 bg-ink/60"
                        : "border-slate/20 bg-ink/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-slate">{record.summary.ending.title}</p>
                      <span className="text-slate/50">{new Date(record.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="mt-1 text-slate/60">年龄 {record.age} · {record.summary.totalYears} 年</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="btn-primary"
                        onClick={() => setSelectedId(record.id)}
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
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-slate/20 bg-ink/40 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate/40">职业结局</p>
              <h3 className="mt-3 text-sm font-semibold text-slate">{displaySummary.ending.title}</h3>
              <p className="mt-2 text-xs text-slate/70">{displaySummary.ending.summary}</p>
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
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-dashed border-slate/30 bg-ink/40 p-4 text-xs text-slate/60">
          还没有结局记录，继续模拟以解锁结局。
          <div className="mt-3 text-[11px] text-slate/50">当前年龄：{state.age} 岁</div>
        </div>
      )}
      {showTimeline ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="panel w-full max-w-3xl p-5">
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
              {displayLog.length === 0 ? (
                <p>暂无时间线记录。</p>
              ) : (
                displayLog.map((entry, index) => (
                  <div key={`${entry.age}-${index}`} className="border-b border-slate/20 py-2">
                    <span className="mr-2 text-slate/40">{entry.age}岁：</span>
                    <span className="font-semibold text-slate">{entry.title}</span>
                    <span className="ml-2 text-slate/70">{entry.text}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default SummaryPage;
