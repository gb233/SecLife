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
              <h1 className="text-xl font-semibold text-slate md:text-2xl">
                人生如戏 戏如人生
              </h1>
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
          每次开始都会生成不同的人生轨迹。
        </div>
      </footer>
    </div>
  );
}

export default AppShell;
