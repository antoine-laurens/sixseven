"use client";

import { Card as CardType } from "@/src/lib/types";

interface GameCardProps {
  card?: CardType;
  faceDown?: boolean;
  size?: "sm" | "md" | "lg";
  isNew?: boolean;
  className?: string;
}

const sizeMap = {
  sm: "w-12 h-[66px] text-sm",
  md: "w-16 h-[88px] text-lg",
  lg: "w-20 h-[110px] text-xl",
};

function getCardTypeClass(card: CardType): string {
  switch (card.type) {
    case "freeze":
      return "card-freeze";
    case "draw3":
      return "card-draw3";
    case "second_chance":
      return "card-second-chance";
    default:
      return "card-number";
  }
}

function getCardIcon(card: CardType): string {
  switch (card.type) {
    case "freeze":
      return "❄️";
    case "draw3":
      return "🃏";
    case "second_chance":
      return "🔄";
    default:
      return "";
  }
}

export default function GameCard({
  card,
  faceDown = false,
  size = "md",
  isNew = false,
  className = "",
}: GameCardProps) {
  const showBack = faceDown || !card;

  return (
    <div
      className={`
        game-card ${sizeMap[size]}
        ${isNew ? "animate-card-enter" : ""}
        ${className}
      `}
    >
      <div className={`game-card-inner ${showBack ? "flipped" : ""}`}>
        {/* Front (card values) — visible by default */}
        <div
          className={`game-card-face game-card-front ${card ? getCardTypeClass(card) : ""}`}
        >
          {card && (
            <div className="flex flex-col items-center gap-0.5">
              {card.type !== "number" && (
                <span className="text-xs leading-none">{getCardIcon(card)}</span>
              )}
              <span className="font-bold leading-none">
                {card.type === "number" ? card.value : ""}
              </span>
              {card.type !== "number" && (
                <span className="text-[8px] font-medium opacity-70 leading-none">
                  {card.label}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Back (purple, face down) */}
        <div className="game-card-face game-card-back" />
      </div>
    </div>
  );
}
