import { dataBundle } from "../engine/data";
import { useSimulation } from "../state/SimulationContext";

function CareersPage() {
  const { state } = useSimulation();
  const statLabels = new Map(dataBundle.config.stats.map((stat) => [stat.id, stat.label]));

  return (
    <section className="panel flex h-full flex-col p-5 md:p-6">
      <div className="shrink-0">
        <h2 className="text-lg font-semibold">职业路线</h2>
        <p className="mt-2 text-xs text-slate/70">
          五条主线可在不同阶段解锁分支节点，影响事件池与能力成长。
        </p>
      </div>
      <div className="mt-4 grid flex-1 gap-4 overflow-y-auto pr-1 lg:grid-cols-2">
        {dataBundle.careers.tracks.map((track) => {
          const nodes = dataBundle.careers.nodes.filter((node) => node.trackId === track.id);
          return (
            <div key={track.id} className="rounded-xl border border-slate/20 bg-ink/40 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate">{track.name}</p>
                  <p className="mt-1 text-[11px] text-slate/70">{track.description}</p>
                </div>
                <span className="chip">主线</span>
              </div>
              <div className="mt-3 space-y-2.5">
                {nodes.map((node) => {
                  const unlocked = state.careerNodes.has(node.id);
                  return (
                    <div
                      key={node.id}
                      className="rounded-xl border border-slate/20 bg-ink/50 p-3"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-slate">{node.title}</p>
                        <span className="chip">{unlocked ? "已解锁" : "未解锁"}</span>
                      </div>
                      <div className="mt-2 text-[11px] text-slate/60">
                        {node.requires?.ageMin ? `年龄 ${node.requires.ageMin}+` : ""}
                        {node.requires?.stats
                          ? ` · 属性要求 ${Object.entries(node.requires.stats)
                              .map(([key, value]) => `${statLabels.get(key) ?? key}≥${value}`)
                              .join(" ")}`
                          : ""}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default CareersPage;
