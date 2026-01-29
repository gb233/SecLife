import { dataBundle } from "../engine/data";
import { useSimulation } from "../state/SimulationContext";

function AchievementsPage() {
  const { state } = useSimulation();

  return (
    <section className="panel flex h-full flex-col p-5 md:p-6">
      <div className="shrink-0">
        <h2 className="text-lg font-semibold">成就档案</h2>
        <p className="mt-2 text-xs text-slate/70">
          记录每一次关键突破、失败与坚持。
        </p>
      </div>
      <div className="mt-4 grid flex-1 gap-3 overflow-y-auto pr-1 md:grid-cols-2">
        {dataBundle.achievements.map((item) => {
          const unlocked = state.achievements.has(item.id);
          const hidden = item.hide && !unlocked;
          return (
            <div
              key={item.id}
              className="rounded-xl border border-slate/20 bg-ink/40 p-4"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate">
                  {hidden ? "未知成就" : item.name}
                </p>
                <span className="chip">{unlocked ? "已解锁" : "未解锁"}</span>
              </div>
              <p className="mt-3 text-[11px] text-slate/70">
                {hidden ? "继续探索安全人生的更多可能。" : item.description}
              </p>
              <p className="mt-3 text-[11px] text-slate/50">等级 {item.grade}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default AchievementsPage;
