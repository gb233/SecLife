import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { dataBundle } from "../engine/data";
import { weightedRandom } from "../engine/random";
import { useSimulation } from "../state/SimulationContext";

const allocationKeys = ["tech", "social", "ethics", "health", "money", "happiness"] as const;
type AllocationKey = (typeof allocationKeys)[number];
const TALENT_DRAW_COUNT = 10;
const TALENT_SELECT_LIMIT = 3;
const TALENT_GRADE_RATE: Record<number, number> = {
  4: 6,
  3: 18,
  2: 40,
  1: 120,
  0: 200,
};

function RunPage() {
  const { start, reset } = useSimulation();
  const navigate = useNavigate();
  const createAllocations = () =>
    allocationKeys.reduce<Record<AllocationKey, number>>((acc, key) => {
      acc[key] = 0;
      return acc;
    }, {} as Record<AllocationKey, number>);

  const [allocations, setAllocations] = useState<Record<AllocationKey, number>>(createAllocations);
  const [selectedTalents, setSelectedTalents] = useState<string[]>([]);

  const statsById = useMemo(() => {
    return new Map(dataBundle.config.stats.map((stat) => [stat.id, stat]));
  }, []);

  const talentPool = useMemo(() => {
    return dataBundle.talents;
  }, []);

  const talentById = useMemo(() => {
    return new Map(dataBundle.talents.map((talent) => [talent.id, talent]));
  }, []);

  const drawTalents = (pool: typeof talentPool) => {
    const byGrade = new Map<number, typeof pool>();
    pool.forEach((talent) => {
      if (talent.exclusive) return;
      const list = byGrade.get(talent.grade) ?? [];
      list.push(talent);
      byGrade.set(talent.grade, list);
    });

    const availableGrades = Array.from(byGrade.keys()).sort((a, b) => b - a);
    const draw: typeof pool = [];

    for (let i = 0; i < TALENT_DRAW_COUNT; i += 1) {
      const grades = availableGrades.filter((grade) => (byGrade.get(grade)?.length ?? 0) > 0);
      if (grades.length === 0) break;
      const grade = weightedRandom(
        grades.map((item) => ({ item, weight: TALENT_GRADE_RATE[item] ?? 1 })),
        Math.random
      );
      const list = byGrade.get(grade);
      if (!list || list.length === 0) continue;
      const pickIndex = Math.floor(Math.random() * list.length);
      const [picked] = list.splice(pickIndex, 1);
      draw.push(picked);
    }

    return draw;
  };

  const [drawnTalents, setDrawnTalents] = useState(() => drawTalents(talentPool));

  const pointBonus = useMemo(() => {
    return selectedTalents.reduce((sum, id) => sum + (talentById.get(id)?.status ?? 0), 0);
  }, [selectedTalents, talentById]);

  const gradeColorByValue: Record<number, string> = {
    1: "bg-slate-400",
    2: "bg-sky-400",
    3: "bg-violet-400",
    4: "bg-amber-400",
  };

  const remainingPoints = useMemo(() => {
    const spent = Object.values(allocations).reduce((sum, value) => sum + value, 0);
    return dataBundle.config.initialPoints + pointBonus - spent;
  }, [allocations, pointBonus]);

  const canStart = remainingPoints === 0 && selectedTalents.length === TALENT_SELECT_LIMIT;

  const handleStart = () => {
    if (!canStart) return;
    start({
      allocations,
      talents: selectedTalents,
      pointBonus,
    });
    navigate("/run/trajectory");
  };

  const handleReset = () => {
    reset();
    setAllocations(createAllocations());
    setSelectedTalents([]);
    setDrawnTalents(drawTalents(talentPool));
  };

  const handleRandomAllocate = () => {
    const maxPoints = dataBundle.config.initialPoints + pointBonus;
    const nextAllocations = createAllocations();
    let remaining = maxPoints;
    const maxByKey = allocationKeys.map((key) => ({
      key,
      max: statsById.get(key)?.max ?? 100,
    }));
    while (remaining > 0) {
      const available = maxByKey.filter(({ key, max }) => nextAllocations[key] < max);
      if (available.length === 0) break;
      const pick = available[Math.floor(Math.random() * available.length)];
      nextAllocations[pick.key] += 1;
      remaining -= 1;
    }
    setAllocations(nextAllocations);
  };

  return (
    <section className="panel h-full overflow-y-auto p-5 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold">开局设定</h2>
          <p className="mt-1 text-[11px] text-slate/70">
            分配初始点数并选择天赋，再开始人生轨迹。
          </p>
        </div>
        <div className="chip">剩余点数：{remainingPoints}</div>
      </div>
      {pointBonus !== 0 ? (
        <p className="mt-2 text-[11px] text-amber-200/80">
          天赋额外点数：{pointBonus > 0 ? "+" : ""}
          {pointBonus}
        </p>
      ) : null}

      <div className="mt-4 grid gap-2 md:grid-cols-3">
        {allocationKeys.map((key) => (
          <label key={key} className="rounded-lg border border-slate/20 bg-ink/40 p-2.5">
            <span className="text-[10px] font-semibold text-slate/70">
              {dataBundle.config.stats.find((stat) => stat.id === key)?.label}
            </span>
            <input
              type="number"
              min={0}
              max={dataBundle.config.stats.find((stat) => stat.id === key)?.max ?? 100}
              value={allocations[key] ?? 0}
              onChange={(event) =>
                setAllocations((prev) => {
                  const rawValue = Number(event.target.value);
                  const statDef = statsById.get(key);
                  const min = statDef?.min ?? 0;
                  const max = statDef?.max ?? 100;
                  const otherTotal = Object.entries(prev).reduce((sum, [id, value]) =>
                    id === key ? sum : sum + value,
                  0);
                  const maxAllowed = Math.min(
                    max,
                    dataBundle.config.initialPoints + pointBonus - otherTotal
                  );
                  const nextValue = Math.max(min, Math.min(rawValue, maxAllowed));
                  return {
                    ...prev,
                    [key]: Number.isNaN(nextValue) ? 0 : nextValue,
                  };
                })
              }
              className="mt-2 w-full rounded-md border border-slate/30 bg-ink/60 px-2 py-1.5 text-[11px] text-slate"
            />
          </label>
        ))}
      </div>

      <div className="mt-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11px] font-semibold text-slate">可选天赋（抽取 {TALENT_DRAW_COUNT} 选 {TALENT_SELECT_LIMIT}）</p>
          <button type="button" className="btn-ghost" onClick={() => {
            setSelectedTalents([]);
            setDrawnTalents(drawTalents(talentPool));
          }}>
            重新抽取
          </button>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {drawnTalents.map((talent) => {
            const active = selectedTalents.includes(talent.id);
            const conflict =
              !active &&
              selectedTalents.some((id) => {
                const selected = talentById.get(id);
                if (selected?.exclude?.includes(talent.id)) return true;
                return talent.exclude?.includes(id) ?? false;
              });
            const exclusiveBlocked =
              !active &&
              talent.exclusive &&
              selectedTalents.some((id) => talentById.get(id)?.exclusive);
            const blocked = conflict || exclusiveBlocked || (!active && selectedTalents.length >= TALENT_SELECT_LIMIT);
            const gradeColor = gradeColorByValue[talent.grade] ?? "bg-slate-400";
            return (
              <button
                key={talent.id}
                type="button"
                className={
                  active
                    ? "btn-primary gap-2"
                    : blocked
                      ? "btn-ghost gap-2 opacity-50 cursor-not-allowed"
                      : "btn-ghost gap-2"
                }
                onClick={() => {
                  setSelectedTalents((prev) =>
                    prev.includes(talent.id)
                      ? prev.filter((id) => id !== talent.id)
                      : blocked
                        ? prev
                        : [...prev, talent.id]
                  );
                }}
                disabled={blocked}
              >
                <span className={`h-2 w-2 rounded-full ${gradeColor}`} aria-hidden="true" />
                <span>{talent.name}</span>
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-[11px] text-slate/60">已选：{selectedTalents.length} / {TALENT_SELECT_LIMIT}</p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          className="btn-primary"
          onClick={handleStart}
          disabled={!canStart}
        >
          开始人生
        </button>
        <button type="button" className="btn-ghost" onClick={handleRandomAllocate}>
          随机分配
        </button>
        <button type="button" className="btn-ghost" onClick={handleReset}>
          重置选择
        </button>
      </div>
      {!canStart ? (
        <p className="mt-3 text-[11px] text-slate/60">
          需要分配完点数并选择 {TALENT_SELECT_LIMIT} 个天赋后才能开始。
        </p>
      ) : null}
    </section>
  );
}

export default RunPage;
