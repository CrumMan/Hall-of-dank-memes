import type { Meme } from "../data/types";
import { MemeCard } from "./MemeCard";
import { SortableMemeCard } from "./SortableMemeGrid";

interface TopThreePodiumProps {
  memes: Meme[];
  reordering: boolean;
}

// Visual order on the podium: 2nd, 1st, 3rd (so the champion sits in the middle).
const PODIUM_LAYOUT = [1, 0, 2];

export function TopThreePodium({ memes, reordering }: TopThreePodiumProps) {
  if (memes.length === 0) return null;

  return (
    <div className="mx-auto mt-10 flex max-w-3xl items-end justify-center gap-4 px-4 sm:gap-8">
      {PODIUM_LAYOUT.map((rank) => {
        const meme = memes[rank];
        if (!meme) return null;

        const width = rank === 0 ? "w-36 sm:w-48" : "w-28 sm:w-36";

        return (
          <div key={meme.id} className={width}>
            {reordering ? (
              <SortableMemeCard meme={meme} rank={rank} size={rank === 0 ? "large" : "normal"} />
            ) : (
              <MemeCard meme={meme} rank={rank} size={rank === 0 ? "large" : "normal"} />
            )}
          </div>
        );
      })}
    </div>
  );
}
