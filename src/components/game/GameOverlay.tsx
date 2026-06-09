"use client";

import { useEffect, useRef, useCallback } from "react";

interface GameOverlayProps {
  type: "bust" | "secure" | null;
  playerName: string;
  onDismiss: () => void;
}

export default function GameOverlay({
  type,
  playerName,
  onDismiss,
}: GameOverlayProps) {
  const dismissRef = useRef(onDismiss);

  useEffect(() => {
    dismissRef.current = onDismiss;
  }, [onDismiss]);

  const autoDismiss = useCallback(() => {
    dismissRef.current();
  }, []);

  useEffect(() => {
    if (!type) return;

    const timer = setTimeout(autoDismiss, 1800);
    return () => clearTimeout(timer);
  }, [type, autoDismiss]);

  if (!type) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className={`
          relative z-10 text-center animate-scale-in
          ${type === "bust" ? "animate-bust" : "animate-secure"}
        `}
      >
        <div className="text-6xl mb-4">{type === "bust" ? "💥" : "🔒"}</div>
        <h2
          className={`text-2xl font-bold mb-1 ${
            type === "bust"
              ? "text-[var(--accent-red)]"
              : "text-[var(--accent-emerald)]"
          }`}
        >
          {type === "bust" ? "Éliminé !" : "Sécurisé !"}
        </h2>
        <p className="text-sm text-[var(--text-secondary)]">{playerName}</p>
      </div>
    </div>
  );
}
