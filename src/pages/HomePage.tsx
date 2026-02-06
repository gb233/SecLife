import { Link } from "react-router-dom";

function HomePage() {
  return (
    <section className="panel h-full overflow-y-auto px-5 py-5 md:px-7">
      <div className="grid h-full gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="chip">安全人的一生</p>
          <h2 className="mt-3 text-2xl font-semibold text-slate md:text-3xl">
            一生很长，安全只是其中一个方向
          </h2>
          <p className="mt-3 text-sm text-slate/70">
            你能控制的是选择与节奏，不能控制的是时代与事件。用一个短周期看到一个可能的人生样本。
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link to="/run" className="btn-primary">
              开始人生
            </Link>
            <Link to="/careers" className="btn-ghost">
              看人生路线
            </Link>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {[
              { title: "可控", desc: "选择方向、技能投入、关系处理与节奏安排。" },
              { title: "不可控", desc: "行业波动、突发事件、组织变化与健康起伏。" },
              { title: "短周期", desc: "几分钟看到一个可能的人生轨迹与结局。" },
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
            <p className="text-xs uppercase tracking-[0.2em] text-slate/40">可能发生的事</p>
            <div className="mt-4 space-y-3 text-xs text-slate/70">
              <p>· 项目被事故波及，你需要在压力下做出取舍。</p>
              <p>· 预算收紧或扩张，职业方向与节奏被迫调整。</p>
              <p>· 健康与家庭变化，迫使你重新权衡投入与回报。</p>
            </div>
          </div>
          <div className="mt-6 rounded-xl border border-slate/20 bg-ink/30 p-3 text-[11px] text-slate/60">
            提示：安全只是人生中的一条支线，你的选择会让轨迹分岔。
          </div>
        </div>
      </div>
    </section>
  );
}

export default HomePage;
