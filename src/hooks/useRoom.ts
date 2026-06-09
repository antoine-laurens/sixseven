"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/src/lib/supabase";
import { Room } from "@/src/lib/types";

export function useRoom(roomCode: string) {
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  const fetchRoom = useCallback(async () => {
    const { data, error: fetchError } = await supabase
      .from("rooms")
      .select("*")
      .eq("code", roomCode)
      .single();

    if (fetchError) {
      setError(fetchError.message);
      setLoading(false);
      return;
    }

    setRoom(data as Room);
    setLoading(false);
  }, [roomCode]);

  useEffect(() => {
    isMounted.current = true;

    // Initial fetch — async IIFE inside effect
    (async () => {
      const { data, error: fetchError } = await supabase
        .from("rooms")
        .select("*")
        .eq("code", roomCode)
        .single();

      if (!isMounted.current) return;

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setRoom(data as Room);
      }
      setLoading(false);
    })();

    // Subscribe to realtime changes
    const channel = supabase
      .channel(`room-${roomCode}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "rooms",
          filter: `code=eq.${roomCode}`,
        },
        (payload) => {
          if (payload.eventType === "UPDATE") {
            setRoom(payload.new as Room);
          }
        }
      )
      .subscribe();

    return () => {
      isMounted.current = false;
      supabase.removeChannel(channel);
    };
  }, [roomCode]);

  return { room, loading, error, refetch: fetchRoom };
}
