"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Room } from "@/src/lib/types";
import { usePlayers } from "@/src/hooks/usePlayers";
import { supabase } from "@/src/lib/supabase";
import { generateDeck } from "@/src/lib/gameEngine";
import Button from "@/src/components/ui/Button";
import PlayerCard from "./PlayerCard";

interface WaitingRoomProps {
  room: Room;
  localPlayerId: string;
}

export default function WaitingRoom({ room, localPlayerId }: WaitingRoomProps) {
  const { players } = usePlayers(room.id);
  const [isLaunching, setIsLaunching] = useState(false);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const localPlayer = players.find((p) => p.id === localPlayerId);
  const isHost = localPlayer?.is_host ?? false;

  const handleCopyCode = useCallback(async () => {
    await navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [room.code]);

  const handleStartGame = useCallback(async () => {
    if (!isHost || players.length < 2) return;
    setIsLaunching(true);

    try {
      // Assign turn orders
      const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);
      for (let i = 0; i < shuffledPlayers.length; i++) {
        await supabase
          .from("players")
          .update({
            turn_order: i,
            status: "playing",
            cards_in_front: [],
            current_round_score: 0,
          })
          .eq("id", shuffledPlayers[i].id);
      }

      // Generate shuffled deck and start the game
      const deck = generateDeck();
      await supabase
        .from("rooms")
        .update({
          status: "playing",
          deck,
          current_player_id: shuffledPlayers[0].id,
        })
        .eq("id", room.id);
    } catch {
      setIsLaunching(false);
    }
  }, [isHost, players, room.id]);

  const handleLeave = useCallback(async () => {
    await supabase.from("players").delete().eq("id", localPlayerId);
    localStorage.removeItem("playerId");
    localStorage.removeItem("roomCode");
    router.push("/");
  }, [localPlayerId, router]);

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="w-full max-w-md animate-slide-up">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
            Salon d&apos;attente
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            En attente que le host lance la partie…
          </p>
        </div>

        {/* Room Code */}
        <div className="glass-surface rounded-2xl p-5 mb-6 text-center">
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-2">
            Code de la partie
          </p>
          <button
            onClick={handleCopyCode}
            className="group inline-flex items-center gap-2 cursor-pointer"
          >
            <span className="text-3xl font-bold tracking-[0.3em] text-[var(--accent-purple-light)]">
              {room.code}
            </span>
            <svg
              className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent-purple)] transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </svg>
          </button>
          {copied && (
            <p className="text-xs text-[var(--accent-emerald)] mt-1 animate-fade-in">
              Copié !
            </p>
          )}
        </div>

        {/* Players List */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest">
              Joueurs
            </p>
            <span className="text-xs text-[var(--text-secondary)]">
              {players.length} connecté{players.length > 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {players.map((player) => (
              <PlayerCard
                key={player.id}
                player={player}
                isLocal={player.id === localPlayerId}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          {isHost ? (
            <Button
              size="lg"
              onClick={handleStartGame}
              disabled={players.length < 2}
              isLoading={isLaunching}
              className="w-full"
            >
              {players.length < 2
                ? "En attente d'un autre joueur…"
                : "Lancer la partie"}
            </Button>
          ) : (
            <div className="glass-surface rounded-xl p-3 text-center">
              <p className="text-sm text-[var(--text-secondary)]">
                En attente du host…
              </p>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLeave}
            className="w-full"
          >
            Quitter le salon
          </Button>
        </div>
      </div>
    </div>
  );
}
