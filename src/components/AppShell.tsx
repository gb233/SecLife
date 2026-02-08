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
              <a
                href="https://github.com/gb233/SecLife"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost flex h-9 w-9 items-center justify-center p-0"
                aria-label="GitHub"
                title="GitHub"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-slate/80">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
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
