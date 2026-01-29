import { Link } from "react-router-dom";

function HomePage() {
  return (
    <section className="panel h-full overflow-y-auto px-5 py-5 md:px-7">
      <div className="grid h-full gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="chip">完整体验版</p>
          <h2 className="mt-3 text-2xl font-semibold text-slate md:text-3xl">
            用一生的选择，推演你的安全职业图谱
          </h2>
          <p className="mt-3 text-sm text-slate/70">
            在不同阶段选择天赋、接受挑战、积累信誉与技能。职业树将根据你的决定自动展开，成就系统记录每一次关键节点。
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link to="/run" className="btn-primary">
              开始重开
            </Link>
            <Link to="/careers" className="btn-ghost">
              查看职业路线
            </Link>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {[
              { title: "事件驱动", desc: "每年基于状态抽取安全场景与任务。" },
              { title: "职业树", desc: "蓝队、红队、GRC、研究、管理五条主线。" },
              { title: "成就系统", desc: "记录关键转折与高光时刻。" },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-slate/20 bg-ink/40 p-3">
                <p className="text-xs font-semibold text-slate">{item.title}</p>
                <p className="mt-2 text-[11px] text-slate/70">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col justify-between rounded-2xl border border-slate/20 bg-ink/50 p-5">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate/40">场景预览</p>
            <div className="mt-4 space-y-3 text-xs text-slate/70">
              <p>· 面对一次供应链攻击，你需要平衡合规、客户压力与修复速度。</p>
              <p>· 社区贡献被发现漏洞链路，选择披露还是私下修复？</p>
              <p>· 安全预算被削减，如何说服管理层留下关键岗位？</p>
            </div>
          </div>
          <div className="mt-6 rounded-xl border border-slate/20 bg-ink/30 p-3 text-[11px] text-slate/60">
            提示：每次重开都会生成不同的人生轨迹，建议多次体验。
          </div>
        </div>
      </div>
    </section>
  );
}

export default HomePage;
