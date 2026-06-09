"use client";

import { useState, useCallback } from "react";
import { Room } from "@/src/lib/types";
import { usePlayers } from "@/src/hooks/usePlayers";
import { useGameActions } from "@/src/hooks/useGameActions";
import DeckPile from "./DeckPile";
import PlayerZone from "./PlayerZone";
import ActionBar from "./ActionBar";
import GameOverlay from "./GameOverlay";

interface GameBoardProps {
  room: Room;
  localPlayerId: string;
}

export default function GameBoard({ room, localPlayerId }: GameBoardProps) {
  const { players } = usePlayers(room.id);
  const { isMyTurn, localPlayer, handleDraw, handleSecure } = useGameActions(
    room,
    players,
    localPlayerId
  );

  const [isDrawing, setIsDrawing] = useState(false);
  const [overlay, setOverlay] = useState<{
    type: "bust" | "secure";
    playerName: string;
  } | null>(null);
  const [lastDrawnCardId, setLastDrawnCardId] = useState<string | null>(null);

  const currentPlayerName =
    players.find((p) => p.id === room.current_player_id)?.pseudo ?? "";

  // Check if round is over (all players busted or stopped)
  const roundOver =
    players.length > 0 &&
    players.every((p) => p.status === "busted" || p.status === "stopped");

  const onDraw = useCallback(async () => {
    if (isDrawing) return;
    setIsDrawing(true);

    const result = await handleDraw();
    if (result.success && result.card) {
      setLastDrawnCardId(result.card.id);
      if (result.busted && localPlayer) {
        setOverlay({ type: "bust", playerName: localPlayer.pseudo });
      }
    }

    setIsDrawing(false);
  }, [isDrawing, handleDraw, localPlayer]);

  const onSecure = useCallback(async () => {
    setIsDrawing(true);
    await handleSecure();
    if (localPlayer) {
      setOverlay({ type: "secure", playerName: localPlayer.pseudo });
    }
    setIsDrawing(false);
  }, [handleSecure, localPlayer]);

  // Sort: local player last (at bottom), others in turn order
  const otherPlayers = players
    .filter((p) => p.id !== localPlayerId)
    .sort((a, b) => a.turn_order - b.turn_order);

  return (
    <div className="flex-1 flex flex-col p-4 max-w-2xl mx-auto w-full">
      {/* Game Header */}
      <div className="text-center mb-4 animate-fade-in">
        <h1 className="text-lg font-bold text-[var(--text-primary)]">
          SixSeven
        </h1>
        {!roundOver && (
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            {isMyTurn ? (
              <span className="text-[var(--accent-purple-light)]">
                C&apos;est ton tour !
              </span>
            ) : (
              <>
                Tour de{" "}
                <span className="text-[var(--text-primary)] font-medium">
                  {currentPlayerName}
                </span>
              </>
            )}
          </p>
        )}
        {roundOver && (
          <p className="text-xs text-[var(--accent-amber)] mt-0.5">
            Manche terminée !
          </p>
        )}
      </div>

      {/* Other Players Zones */}
      <div className="flex flex-col gap-3 mb-4">
        {otherPlayers.map((player) => (
          <PlayerZone
            key={player.id}
            player={player}
            isActive={room.current_player_id === player.id}
            isLocal={false}
            lastDrawnCardId={lastDrawnCardId}
          />
        ))}
      </div>

      {/* Deck */}
      <div className="flex justify-center my-6">
        <DeckPile
          cardsRemaining={(room.deck ?? []).length}
          isMyTurn={isMyTurn}
          onDraw={onDraw}
        />
      </div>

      {/* Local Player Zone */}
      {localPlayer && (
        <div className="mt-auto">
          <PlayerZone
            player={localPlayer}
            isActive={isMyTurn}
            isLocal={true}
            lastDrawnCardId={lastDrawnCardId}
          />

          {/* Action buttons */}
          <div className="mt-4">
            <ActionBar
              isMyTurn={isMyTurn}
              isLoading={isDrawing}
              playerStatus={localPlayer.status}
              onDraw={onDraw}
              onSecure={onSecure}
            />
          </div>
        </div>
      )}

      {/* Overlay */}
      <GameOverlay
        type={overlay?.type ?? null}
        playerName={overlay?.playerName ?? ""}
        onDismiss={() => setOverlay(null)}
      />
    </div>
  );
}
