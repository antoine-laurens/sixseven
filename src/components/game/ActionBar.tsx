"use client";

import Button from "@/src/components/ui/Button";

interface ActionBarProps {
  isMyTurn: boolean;
  isLoading: boolean;
  playerStatus: string;
  onDraw: () => void;
  onSecure: () => void;
}

export default function ActionBar({
  isMyTurn,
  isLoading,
  playerStatus,
  onDraw,
  onSecure,
}: ActionBarProps) {
  if (playerStatus === "busted") {
    return (
      <div className="glass-surface rounded-2xl p-4 text-center animate-fade-in">
        <p className="text-[var(--accent-red)] font-medium">💥 Éliminé !</p>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          Tu as pioché un doublon. Ton score de manche est perdu.
        </p>
      </div>
    );
  }

  if (playerStatus === "stopped") {
    return (
      <div className="glass-surface rounded-2xl p-4 text-center animate-fade-in">
        <p className="text-[var(--accent-emerald)] font-medium">
          ✓ Score sécurisé
        </p>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          En attente de la fin du tour des autres joueurs…
        </p>
      </div>
    );
  }

  if (!isMyTurn) {
    return (
      <div className="glass-surface rounded-2xl p-4 text-center">
        <p className="text-sm text-[var(--text-secondary)]">
          En attente de ton tour…
        </p>
      </div>
    );
  }

  return (
    <div className="flex gap-3 animate-fade-in">
      <Button
        variant="primary"
        size="lg"
        onClick={onDraw}
        isLoading={isLoading}
        className="flex-1"
      >
        🎴 Piocher
      </Button>
      <Button
        variant="secondary"
        size="lg"
        onClick={onSecure}
        disabled={isLoading}
        className="flex-1"
      >
        🔒 Sécuriser
      </Button>
    </div>
  );
}
