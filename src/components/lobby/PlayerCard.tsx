"use client";

import { Player } from "@/src/lib/types";
import Badge from "@/src/components/ui/Badge";

interface PlayerCardProps {
  player: Player;
  isLocal: boolean;
}

export default function PlayerCard({ player, isLocal }: PlayerCardProps) {
  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-3 rounded-xl
        glass-surface
        transition-all duration-300
        animate-fade-in
        ${isLocal ? "border-[var(--accent-purple)]! shadow-[var(--glow-purple)]" : ""}
      `}
    >
      {/* Avatar */}
      <div
        className={`
          w-9 h-9 rounded-full flex items-center justify-center
          text-sm font-bold
          ${isLocal
            ? "bg-[var(--accent-purple)] text-white"
            : "bg-[var(--bg-glass)] text-[var(--text-secondary)]"
          }
        `}
      >
        {player.pseudo.charAt(0).toUpperCase()}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[var(--text-primary)] truncate">
            {player.pseudo}
          </span>
          {isLocal && (
            <span className="text-[10px] text-[var(--text-muted)]">
              (toi)
            </span>
          )}
        </div>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-1.5">
        {player.is_host && <Badge variant="host">Host</Badge>}
      </div>
    </div>
  );
}
