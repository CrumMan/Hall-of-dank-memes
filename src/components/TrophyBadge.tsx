const RANK_STYLES: Record<number, { emoji: string; ring: string }> = {
  0: { emoji: "🥇", ring: "ring-amber-400" },
  1: { emoji: "🥈", ring: "ring-slate-300" },
  2: { emoji: "🥉", ring: "ring-orange-700" },
};

export function TrophyBadge({ rank }: { rank: number }) {
  const style = RANK_STYLES[rank];
  if (!style) return null;

  return (
    <div
      className={`absolute -top-3 -left-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-lg shadow ring-2 dark:bg-neutral-900 ${style.ring}`}
      aria-label={`Rank #${rank + 1}`}
      title={`Rank #${rank + 1}`}
    >
      {style.emoji}
    </div>
  );
}
