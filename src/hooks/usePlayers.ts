"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/src/lib/supabase";
import { Player } from "@/src/lib/types";

export function usePlayers(roomId: string | undefined) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(true);

  const fetchPlayers = useCallback(async () => {
    if (!roomId) return;

    const { data, error } = await supabase
      .from("players")
      .select("*")
      .eq("room_id", roomId)
      .order("turn_order", { ascending: true });

    if (!error && data) {
      setPlayers(data as Player[]);
    }
    setLoading(false);
  }, [roomId]);

  useEffect(() => {
    if (!roomId) return;

    isMounted.current = true;

    // Initial fetch — async IIFE inside effect
    (async () => {
      const { data, error } = await supabase
        .from("players")
        .select("*")
        .eq("room_id", roomId)
        .order("turn_order", { ascending: true });

      if (!isMounted.current) return;

      if (!error && data) {
        setPlayers(data as Player[]);
      }
      setLoading(false);
    })();

    const channel = supabase
      .channel(`players-${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "players",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          switch (payload.eventType) {
            case "INSERT":
              setPlayers((prev) => {
                // Avoid duplicates
                if (prev.some((p) => p.id === (payload.new as Player).id)) {
                  return prev;
                }
                return [...prev, payload.new as Player].sort(
                  (a, b) => (a.turn_order ?? 0) - (b.turn_order ?? 0)
                );
              });
              break;
            case "UPDATE":
              setPlayers((prev) =>
                prev.map((p) =>
                  p.id === (payload.new as Player).id
                    ? (payload.new as Player)
                    : p
                )
              );
              break;
            case "DELETE":
              setPlayers((prev) =>
                prev.filter((p) => p.id !== (payload.old as { id: string }).id)
              );
              break;
          }
        }
      )
      .subscribe();

    return () => {
      isMounted.current = false;
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  return { players, loading, refetch: fetchPlayers };
}
