"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/src/lib/supabase";
import { generateRoomCode } from "@/src/lib/gameEngine";
import Button from "@/src/components/ui/Button";
import Input from "@/src/components/ui/Input";

type Mode = "idle" | "join";

export default function HomePage() {
  const router = useRouter();
  const [pseudo, setPseudo] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [mode, setMode] = useState<Mode>("idle");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = useCallback(async () => {
    if (!pseudo.trim()) {
      setError("Entre ton pseudo pour continuer");
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const code = generateRoomCode();

      // Create room
      const { data: room, error: roomError } = await supabase
        .from("rooms")
        .insert({ code, status: "waiting", deck: [], current_player_id: null })
        .select()
        .single();

      if (roomError || !room) throw new Error(roomError?.message || "Erreur lors de la création");

      // Create host player
      const { data: player, error: playerError } = await supabase
        .from("players")
        .insert({
          room_id: room.id,
          pseudo: pseudo.trim(),
          is_host: true,
          total_score: 0,
          current_round_score: 0,
          cards_in_front: [],
          turn_order: 0,
          status: "playing",
        })
        .select()
        .single();

      if (playerError || !player) throw new Error(playerError?.message || "Erreur joueur");

      localStorage.setItem("playerId", player.id);
      localStorage.setItem("roomCode", code);
      router.push(`/room/${code}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      setIsLoading(false);
    }
  }, [pseudo, router]);

  const handleJoin = useCallback(async () => {
    if (!pseudo.trim()) {
      setError("Entre ton pseudo pour continuer");
      return;
    }
    if (!roomCode.trim()) {
      setError("Entre le code de la partie");
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const code = roomCode.trim().toUpperCase();

      // Find room
      const { data: room, error: roomError } = await supabase
        .from("rooms")
        .select("*")
        .eq("code", code)
        .eq("status", "waiting")
        .single();

      if (roomError || !room) {
        throw new Error("Partie introuvable ou déjà lancée");
      }

      // Count existing players for turn_order
      const { count } = await supabase
        .from("players")
        .select("*", { count: "exact", head: true })
        .eq("room_id", room.id);

      // Add player
      const { data: player, error: playerError } = await supabase
        .from("players")
        .insert({
          room_id: room.id,
          pseudo: pseudo.trim(),
          is_host: false,
          total_score: 0,
          current_round_score: 0,
          cards_in_front: [],
          turn_order: (count ?? 0),
          status: "playing",
        })
        .select()
        .single();

      if (playerError || !player) throw new Error(playerError?.message || "Erreur joueur");

      localStorage.setItem("playerId", player.id);
      localStorage.setItem("roomCode", code);
      router.push(`/room/${code}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      setIsLoading(false);
    }
  }, [pseudo, roomCode, router]);

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="w-full max-w-sm animate-slide-up">
        {/* Logo / Title */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--accent-purple)]/10 border border-[var(--accent-purple)]/20 mb-4">
            <span className="text-3xl">🎴</span>
          </div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">
            SixSeven
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Stop ou encore — Pioche, bluffe, sécurise.
          </p>
        </div>

        {/* Pseudo input */}
        <div className="mb-6">
          <Input
            label="Ton pseudo"
            placeholder="Ex: Antoine"
            value={pseudo}
            onChange={(e) => setPseudo(e.target.value)}
            maxLength={20}
            autoFocus
          />
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-[var(--accent-red)]/10 border border-[var(--accent-red)]/20 animate-fade-in">
            <p className="text-sm text-[var(--accent-red)]">{error}</p>
          </div>
        )}

        {/* Actions */}
        {mode === "idle" ? (
          <div className="flex flex-col gap-3">
            <Button
              size="lg"
              onClick={handleCreate}
              isLoading={isLoading}
              className="w-full"
            >
              Créer une partie privée
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => setMode("join")}
              className="w-full"
            >
              Rejoindre une partie
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3 animate-fade-in">
            <Input
              label="Code de la partie"
              placeholder="ABCDE"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              maxLength={5}
              className="text-center tracking-[0.3em] text-lg font-bold"
            />
            <Button
              size="lg"
              onClick={handleJoin}
              isLoading={isLoading}
              disabled={roomCode.length < 5}
              className="w-full"
            >
              Rejoindre
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setMode("idle");
                setRoomCode("");
                setError(null);
              }}
              className="w-full"
            >
              ← Retour
            </Button>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-[var(--text-muted)] mt-10">
          Inspiré de Flip 7 · Multijoueur temps réel
        </p>
      </div>
    </div>
  );
}
