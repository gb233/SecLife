import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { dataBundle } from "../engine/data";
import { useSimulation } from "../state/SimulationContext";

function TrajectoryPage() {
  const { state, summary, next, reset } = useSimulation();
  const navigate = useNavigate();
  const [autoMode, setAutoMode] = useState(false);
  const [autoSpeed, setAutoSpeed] = useState(650);
  const [showEndModal, setShowEndModal] = useState(false);
  const logScrollRef = useRef<HTMLDivElement | null>(null);
  const lastEntryRef = useRef<HTMLDivElement | null>(null);

  const statsList = useMemo(() => {
    return dataBundle.config.stats.map((stat) => ({
      label: stat.label,
      id: stat.id,
      value: state.stats[stat.id] ?? 0,
    }));
  }, [state.stats]);

  useEffect(() => {
    if (summary && autoMode) {
      setAutoMode(false);
      return undefined;
    }
    if (!autoMode) {
      return undefined;
    }
    const timer = window.setInterval(() => {
      next();
    }, autoSpeed);

    return () => window.clearInterval(timer);
  }, [autoMode, autoSpeed, next, summary]);

  useEffect(() => {
    if (summary) {
      setShowEndModal(true);
      return;
    }
    setShowEndModal(false);
  }, [summary]);

  useLayoutEffect(() => {
    if (!logScrollRef.current) {
      return;
    }
    logScrollRef.current.scrollTop = logScrollRef.current.scrollHeight;
    lastEntryRef.current?.scrollIntoView({ block: "end" });
  }, [state.log.length]);

  const handleBack = () => {
    setAutoMode(false);
    reset();
    navigate("/run");
  };

  const canAuto = state.log.length > 0 && !summary;

  return (
    <section className="grid h-full min-h-0 gap-3 overflow-hidden lg:grid-cols-[1.25fr_0.75fr]">
      <div className="flex h-full min-h-0 flex-col gap-3">
        <div className="panel flex min-h-0 flex-1 flex-col p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold">人生轨迹</h2>
              <p className="mt-1 text-[11px] text-slate/70">当前年龄：{Math.max(0, state.age)} 岁</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" className="btn-ghost" onClick={handleBack}>
                重新开局
              </button>
              <button type="button" className="btn-primary" onClick={next} disabled={autoMode || !!summary}>
                推进一年
              </button>
            </div>
          </div>

          <div ref={logScrollRef} className="mt-3 min-h-0 flex-1 overflow-y-auto pr-1">
            {state.log.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate/30 bg-ink/40 p-3 text-[11px] text-slate/60">
                还没有轨迹记录，点击“推进一年”开始人生。
              </div>
            ) : (
              state.log.map((entry, index) => (
                <div
                  key={`${entry.age}-${entry.title}-${index}`}
                  ref={index === state.log.length - 1 ? lastEntryRef : null}
                  className="border-b border-slate/20 py-2 text-[11px] text-slate/80"
                >
                  <span className="mr-2 text-slate/40">{entry.age}岁：</span>
                  <span className="font-semibold text-slate">{entry.title}</span>
                  <span className="ml-2 text-slate/70">{entry.text}</span>
                </div>
              ))
            )}
          </div>

          <div className="mt-3 border-t border-slate/20 pt-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-slate/60">推进方式</span>
              <button
                type="button"
                className={autoMode ? "btn-ghost" : "btn-primary"}
                onClick={() => setAutoMode(false)}
              >
                手动
              </button>
              <button
                type="button"
                className={autoMode ? "btn-primary" : "btn-ghost"}
                onClick={() => setAutoMode(true)}
                disabled={!canAuto}
              >
                自动
              </button>
              <div className="ml-auto flex items-center gap-2 text-[11px] text-slate/60">
                <span>速度</span>
                <input
                  type="range"
                  min={200}
                  max={1200}
                  step={100}
                  value={autoSpeed}
                  onChange={(event) => setAutoSpeed(Number(event.target.value))}
                  className="w-28 accent-amber-400"
                />
                <span>{autoSpeed}ms</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-full min-h-0 flex-col gap-3">
        <div className="panel p-4">
          <h3 className="text-xs font-semibold">当前属性</h3>
          <div className="mt-3 grid grid-cols-3 gap-2 md:grid-cols-5">
            {statsList.map((stat) => (
              <div key={stat.id} className="rounded-md border border-slate/20 bg-ink/60 px-2 py-1 text-center">
                <div className="text-[10px] text-slate/60">{stat.label}</div>
                <div className="text-lg font-semibold text-slate">{stat.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel flex min-h-0 flex-1 flex-col p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold">已解锁成就</h3>
            <span className="text-[10px] text-slate/50">{state.achievements.size} 个</span>
          </div>
          <div className="mt-3 flex-1 overflow-y-auto pr-1 text-[11px] text-slate/70">
            {state.achievements.size === 0 ? (
              <p>暂无成就</p>
            ) : (
              Array.from(state.achievements).map((id) => {
                const item = dataBundle.achievements.find((achv) => achv.id === id);
                return <p key={id}>· {item?.name ?? id}</p>;
              })
            )}
          </div>
        </div>

        {summary ? (
          <div className="panel p-4">
            <h3 className="text-xs font-semibold">结局摘要</h3>
            <div className="mt-2">
              <p className="text-xs font-semibold text-slate">{summary.ending.title}</p>
              <p className="mt-2 text-[11px] text-slate/70">{summary.ending.summary}</p>
            </div>
          </div>
        ) : null}
      </div>
      {summary && showEndModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="panel w-full max-w-lg p-5">
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate/40">终局总结</p>
            <h3 className="mt-3 text-lg font-semibold text-slate">{summary.ending.title}</h3>
            <p className="mt-2 text-xs text-slate/70">{summary.ending.summary}</p>
            <div className="mt-4 grid gap-2 text-[11px] text-slate/70">
              <div className="flex items-center justify-between">
                <span>最终年龄</span>
                <span>{state.age}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>累计年数</span>
                <span>{summary.totalYears}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>解锁成就</span>
                <span>{summary.achievements.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>职业节点</span>
                <span>{summary.careerNodes.length}</span>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <button type="button" className="btn-primary" onClick={() => {
                setShowEndModal(false);
                navigate("/summary");
              }}>
                查看结局详情
              </button>
              <button type="button" className="btn-ghost" onClick={() => setShowEndModal(false)}>
                继续查看轨迹
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default TrajectoryPage;
