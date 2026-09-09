import type { Meme } from "../data/types";
import { MemeCard } from "./MemeCard";
import { SortableMemeCard } from "./SortableMemeGrid";

interface GalleryProps {
  memes: Meme[];
  rankOffset: number;
  reordering: boolean;
}

export function Gallery({ memes, rankOffset, reordering }: GalleryProps) {
  if (memes.length === 0) return null;

  return (
    <div className="mx-auto mt-10 grid max-w-5xl grid-cols-2 gap-4 px-4 pb-16 sm:grid-cols-3 lg:grid-cols-4">
      {memes.map((meme, index) =>
        reordering ? (
          <SortableMemeCard key={meme.id} meme={meme} rank={rankOffset + index} />
        ) : (
          <MemeCard key={meme.id} meme={meme} rank={rankOffset + index} />
        ),
      )}
    </div>
  );
}
