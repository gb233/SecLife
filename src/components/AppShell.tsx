import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";

type AppShellProps = {
  children: ReactNode;
};

const navItems = [
  { to: "/", label: "起点" },
  { to: "/run", label: "模拟" },
  { to: "/achievements", label: "成就" },
  { to: "/careers", label: "职业树" },
  { to: "/summary", label: "结局" },
];

function AppShell({ children }: AppShellProps) {
  return (
    <div className="h-full bg-ink bg-grid-fade flex flex-col">
      <header className="page-shell py-3 shrink-0">
        <div className="panel px-5 py-4 md:px-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="chip">安全人生重开计划</p>
              <h1 className="mt-2 text-xl font-semibold text-slate md:text-2xl">
                安全人的一生 · 复盘实验室
              </h1>
              <p className="mt-2 max-w-2xl text-xs text-slate/70">
                以事件、天赋与职业路线驱动的安全职业模拟，从校园到红蓝对抗、治理合规与管理路径。
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    isActive
                      ? "btn-primary"
                      : "btn-ghost"
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="page-shell flex-1 min-h-0 overflow-hidden pt-0 pb-3">
        <div className="h-full min-h-0">{children}</div>
      </main>

      <footer className="page-shell py-3 shrink-0">
        <div className="rounded-xl border border-slate/20 bg-ink/40 px-5 py-3 text-[11px] text-slate/60">
          数据均为模拟，强调安全职业路径的策略与抉择，不用于现实风险评估。
        </div>
      </footer>
    </div>
  );
}

export default AppShell;
