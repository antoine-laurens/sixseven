"use client";

import { Player } from "@/src/lib/types";
import GameCard from "@/src/components/ui/GameCard";
import Badge from "@/src/components/ui/Badge";

interface PlayerZoneProps {
  player: Player;
  isActive: boolean;
  isLocal: boolean;
  lastDrawnCardId?: string | null;
}

export default function PlayerZone({
  player,
  isActive,
  isLocal,
  lastDrawnCardId,
}: PlayerZoneProps) {
  const cards = (player.cards_in_front ?? []);
  const statusBadge = () => {
    switch (player.status) {
      case "busted":
        return <Badge variant="busted">Éliminé</Badge>;
      case "stopped":
        return <Badge variant="stopped">Sécurisé</Badge>;
      default:
        return isActive ? <Badge variant="active">En jeu</Badge> : null;
    }
  };

  return (
    <div
      className={`
        glass-surface rounded-2xl p-4
        transition-all duration-500
        ${isActive ? "player-active" : ""}
        ${player.status === "busted" ? "player-busted" : ""}
        ${player.status === "stopped" ? "player-stopped" : ""}
        ${player.status === "busted" ? "animate-bust" : ""}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className={`
              w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
              ${isLocal
                ? "bg-[var(--accent-purple)] text-white"
                : "bg-[var(--bg-glass)] text-[var(--text-secondary)]"
              }
            `}
          >
            {player.pseudo.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium">{player.pseudo}</span>
              {isLocal && (
                <span className="text-[10px] text-[var(--text-muted)]">
                  (toi)
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <span>Total: {player.total_score}</span>
              {player.status === "playing" && (
                <>
                  <span>·</span>
                  <span className="text-[var(--accent-purple-light)]">
                    +{player.current_round_score}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        {statusBadge()}
      </div>

      {/* Cards */}
      <div className="flex flex-wrap gap-1.5 min-h-[66px]">
        {cards.length === 0 ? (
          <div className="flex items-center justify-center w-full">
            <span className="text-xs text-[var(--text-muted)]">
              Aucune carte
            </span>
          </div>
        ) : (
          cards.map((card) => (
            <GameCard
              key={card.id}
              card={card}
              size="sm"
              isNew={card.id === lastDrawnCardId}
            />
          ))
        )}
      </div>
    </div>
  );
}
