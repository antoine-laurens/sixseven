"use client";

import { useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useRoom } from "@/src/hooks/useRoom";
import WaitingRoom from "@/src/components/lobby/WaitingRoom";
import GameBoard from "@/src/components/game/GameBoard";

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;

  const localPlayerId = useMemo(() => {
    if (typeof window === "undefined") return null;
    const storedId = localStorage.getItem("playerId");
    const storedCode = localStorage.getItem("roomCode");
    if (!storedId || storedCode !== code) return null;
    return storedId;
  }, [code]);

  const { room, loading, error } = useRoom(code);

  // Redirect if no valid player identity
  useEffect(() => {
    if (localPlayerId === null && typeof window !== "undefined") {
      router.push("/");
    }
  }, [localPlayerId, router]);

  if (loading || !localPlayerId) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-8 h-8 border-2 border-[var(--accent-purple)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-[var(--text-secondary)]">Chargement…</p>
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center animate-fade-in">
          <p className="text-lg text-[var(--accent-red)] mb-2">
            Partie introuvable
          </p>
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            Cette partie n&apos;existe pas ou a été supprimée.
          </p>
          <button
            onClick={() => router.push("/")}
            className="text-sm text-[var(--accent-purple)] hover:underline cursor-pointer"
          >
            Retour à l&apos;accueil
          </button>
        </div>
      </div>
    );
  }

  // Switch between waiting room and game board based on room status
  if (room.status === "waiting") {
    return <WaitingRoom room={room} localPlayerId={localPlayerId} />;
  }

  return <GameBoard room={room} localPlayerId={localPlayerId} />;
}
