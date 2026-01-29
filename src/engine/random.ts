export type WeightedItem<T> = {
  item: T;
  weight: number;
};

export function weightedRandom<T>(items: WeightedItem<T>[], rng: () => number): T {
  const total = items.reduce((sum, entry) => sum + entry.weight, 0);
  if (total <= 0) {
    return items[items.length - 1].item;
  }
  let roll = rng() * total;
  for (const entry of items) {
    roll -= entry.weight;
    if (roll <= 0) {
      return entry.item;
    }
  }
  return items[items.length - 1].item;
}
