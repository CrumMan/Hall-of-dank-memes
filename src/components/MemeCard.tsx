import { Link } from "@tanstack/react-router";
import type { Meme } from "../data/types";
import { TrophyBadge } from "./TrophyBadge";

interface MemeCardProps {
  meme: Meme;
  rank: number;
  size?: "normal" | "large";
  reordering?: boolean;
  dragHandleProps?: Record<string, unknown>;
}

export function MemeCard({
  meme,
  rank,
  size = "normal",
  reordering = false,
  dragHandleProps,
}: MemeCardProps) {
  const media =
    meme.type === "photo" ? (
      <img
        src={meme.mediaUrl}
        alt={meme.title}
        className="h-full w-full object-cover"
        draggable={false}
      />
    ) : (
      <video
        src={meme.mediaUrl}
        className="h-full w-full object-cover"
        muted
        loop
        playsInline
        autoPlay
        draggable={false}
      />
    );

  const cardClasses = [
    "relative aspect-square transition",
    size === "large" ? "scale-110 z-10" : "",
  ].join(" ");

  const innerClasses = [
    "relative h-full w-full overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-neutral-200 transition dark:bg-neutral-900 dark:ring-0",
    reordering
      ? "cursor-grab border-2 border-dashed border-amber-400/70 active:cursor-grabbing"
      : "hover:-translate-y-1 hover:shadow-xl",
    size === "large" ? "shadow-amber-500/20" : "",
  ].join(" ");

  const content = (
    <div className={cardClasses} {...dragHandleProps}>
      <div className={innerClasses}>
        {media}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 pt-6">
          <p className="truncate text-sm font-medium text-amber-50">{meme.title}</p>
          {meme.categories && meme.categories.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {/* Card view only ever shows the first category — the rest are
                  visible on the meme's detail page (MemeDetailRoute). */}
              <span className="inline-block truncate rounded-full bg-amber-500/20 px-2 py-0.5 text-[11px] font-semibold text-amber-300 ring-1 ring-amber-500/40">
                {meme.categories[0]}
              </span>
            </div>
          )}
        </div>
      </div>
      <TrophyBadge rank={rank} />
    </div>
  );

  if (reordering) {
    return content;
  }

  return (
    <Link to="/meme/$id" params={{ id: meme.id }} className="block">
      {content}
    </Link>
  );
}
