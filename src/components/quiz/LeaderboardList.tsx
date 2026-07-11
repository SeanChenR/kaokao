import { rankOf, useLeaderboard } from "../../stores/leaderboard";
import { formatMs } from "../../quiz/time";

interface LeaderboardListProps {
  /** 高亮本次(以 entry id,永不以 name)— spec: Current-run highlight */
  highlightId?: string | null;
  limit?: number;
}

const MEDALS = ["🥇", "🥈", "🥉"];

export function LeaderboardList({ highlightId = null, limit = 10 }: LeaderboardListProps) {
  const entries = useLeaderboard((s) => s.entries).slice(0, limit);
  const mineOnBoard = highlightId !== null && entries.some((e) => e.id === highlightId);
  const myRank = highlightId !== null && !mineOnBoard ? rankOf(highlightId) : null;

  return (
    <div>
      <ol className="flex flex-col gap-1.5">
        {entries.map((e, i) => {
          const mine = e.id === highlightId;
          return (
            <li
              key={e.id}
              className={`flex flex-wrap items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm
                ${mine ? "bg-selection border-2 border-primary shadow-glow-primary" : "bg-bg border border-transparent"}
                ${e.demo ? "opacity-60" : ""}`}
            >
              <span aria-hidden="true" className="w-7 text-center font-num">{MEDALS[i] ?? i + 1}</span>
              <span className={`flex-1 font-bold ${mine ? "text-primary" : "text-text"}`}>
                {e.name}
                {mine && <span className="text-xs">(你)</span>}
                {e.demo && <span className="ml-1.5 text-[10px] font-normal text-muted border border-line rounded px-1">示範</span>}
              </span>
              <span className="font-num text-muted mr-2">{formatMs(e.elapsedSec * 1000)}</span>
              <span className="font-num font-bold text-primary">{e.score}/5</span>
            </li>
          );
        })}
      </ol>
      {myRank !== null && (
        <p className="mt-2 text-sm text-muted text-center">
          你這次的名次:<span className="font-num font-bold text-primary">#{myRank}</span> — 再挑戰一次往上爬!
        </p>
      )}
    </div>
  );
}
