"use client";

interface DeckPileProps {
  cardsRemaining: number;
  isMyTurn: boolean;
  onDraw: () => void;
}

export default function DeckPile({
  cardsRemaining,
  isMyTurn,
  onDraw,
}: DeckPileProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={onDraw}
        disabled={!isMyTurn}
        className={`
          deck-pile
          ${isMyTurn ? "animate-pulse-glow cursor-pointer" : "opacity-60 cursor-not-allowed"}
        `}
        aria-label="Piocher une carte"
      >
        {/* Stacked cards effect */}
        <div className="deck-shadow absolute top-1 left-0.5 opacity-30" />
        <div className="deck-shadow absolute top-0.5 left-0.5 opacity-50" />
        <div className="deck-shadow relative z-10 flex items-center justify-center">
          <span className="text-white/60 text-2xl">✦</span>
        </div>
      </button>

      <span className="text-xs text-[var(--text-muted)] tabular-nums">
        {cardsRemaining} carte{cardsRemaining !== 1 ? "s" : ""}
      </span>
    </div>
  );
}
