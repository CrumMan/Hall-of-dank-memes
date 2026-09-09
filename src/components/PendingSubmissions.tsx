import { Link } from "@tanstack/react-router";
import { useObjectUrl } from "../lib/objectUrls";
import type { Meme } from "../data/types";

interface PendingSubmissionsProps {
  memes: Meme[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export function PendingSubmissions({ memes, onApprove, onReject }: PendingSubmissionsProps) {
  return (
    <div className="mx-auto mt-8 max-w-3xl px-4">
      <h2 className="text-sm font-semibold tracking-wide text-amber-700 uppercase dark:text-amber-300">
        Pending submissions ({memes.length})
      </h2>
      <div className="mt-3 flex flex-col gap-3">
        {memes.map((meme) => (
          <PendingRow key={meme.id} meme={meme} onApprove={onApprove} onReject={onReject} />
        ))}
      </div>
    </div>
  );
}

function PendingRow({
  meme,
  onApprove,
  onReject,
}: {
  meme: Meme;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  const url = useObjectUrl(meme.blob);

  return (
    <div className="flex items-center gap-3 rounded-xl bg-white p-3 shadow ring-1 ring-neutral-200 dark:bg-neutral-900 dark:ring-0">
      <Link to="/meme/$id" params={{ id: meme.id }} className="flex min-w-0 flex-1 items-center gap-3">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-neutral-200 dark:bg-neutral-800">
          {url && meme.type === "photo" && (
            <img src={url} alt={meme.title} className="h-full w-full object-cover" />
          )}
          {url && meme.type === "video" && (
            <video src={url} className="h-full w-full object-cover" muted />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-neutral-900 dark:text-amber-50">{meme.title}</p>
          <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
            {(meme.categories ?? []).join(", ")} · submitted by {meme.submittedBy}
          </p>
        </div>
      </Link>
      <div className="flex shrink-0 gap-2">
        <button
          onClick={() => onApprove(meme.id)}
          className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-neutral-950 hover:bg-emerald-400"
        >
          Approve
        </button>
        <button
          onClick={() => onReject(meme.id)}
          className="rounded-full border border-red-500 px-3 py-1 text-xs font-semibold text-red-400 hover:bg-red-500/10"
        >
          Reject
        </button>
      </div>
    </div>
  );
}
