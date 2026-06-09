"use client";

import { useCallback } from "react";
import { supabase } from "@/src/lib/supabase";
import { Room, Player, Card } from "@/src/lib/types";
import { drawCard, checkBust, calculateScore } from "@/src/lib/gameEngine";

export function useGameActions(
  room: Room | null,
  players: Player[],
  localPlayerId: string | null
) {
  const isMyTurn =
    room?.current_player_id === localPlayerId &&
    room?.status === "playing";

  const localPlayer = players.find((p) => p.id === localPlayerId) ?? null;

  /**
   * Finds the next player whose status is 'playing', in turn_order.
   * If nobody is left playing, returns null (round over).
   */
  const getNextPlayerId = useCallback((): string | null => {
    if (!room) return null;

    const activePlayers = players
      .filter((p) => p.status === "playing")
      .sort((a, b) => a.turn_order - b.turn_order);

    if (activePlayers.length === 0) return null;

    const currentIndex = activePlayers.findIndex(
      (p) => p.id === room.current_player_id
    );

    // Next in circular order
    const nextIndex = (currentIndex + 1) % activePlayers.length;
    const nextPlayer = activePlayers[nextIndex];

    // If we've looped back to the current player and they are the only one left
    if (nextPlayer.id === room.current_player_id && activePlayers.length === 1) {
      return null;
    }

    return nextPlayer.id;
  }, [room, players]);

  /**
   * Draw a card from the deck.
   */
  const handleDraw = useCallback(async (): Promise<{
    success: boolean;
    busted: boolean;
    card: Card | null;
  }> => {
    if (!room || !localPlayerId || !isMyTurn || !localPlayer) {
      return { success: false, busted: false, card: null };
    }

    const deck = room.deck as Card[];
    if (deck.length === 0) {
      return { success: false, busted: false, card: null };
    }

    const { card, remainingDeck } = drawCard(deck);
    const currentCards = (localPlayer.cards_in_front ?? []) as Card[];
    const isBust = checkBust(currentCards, card);
    const updatedCards = [...currentCards, card];

    if (isBust) {
      // Player is busted: score goes to 0, next player's turn
      const nextPlayerId = getNextPlayerId();

      // Update player
      await supabase
        .from("players")
        .update({
          cards_in_front: updatedCards,
          current_round_score: 0,
          status: "busted",
        })
        .eq("id", localPlayerId);

      // Update room deck and current player
      await supabase
        .from("rooms")
        .update({
          deck: remainingDeck,
          current_player_id: nextPlayerId,
        })
        .eq("id", room.id);

      return { success: true, busted: true, card };
    } else {
      // Card is safe: add to front, update score
      const newScore = calculateScore(updatedCards);

      await supabase
        .from("players")
        .update({
          cards_in_front: updatedCards,
          current_round_score: newScore,
        })
        .eq("id", localPlayerId);

      // Update room deck
      await supabase
        .from("rooms")
        .update({
          deck: remainingDeck,
        })
        .eq("id", room.id);

      return { success: true, busted: false, card };
    }
  }, [room, localPlayerId, isMyTurn, localPlayer, getNextPlayerId]);

  /**
   * Secure current score and stop playing.
   */
  const handleSecure = useCallback(async () => {
    if (!room || !localPlayerId || !isMyTurn || !localPlayer) return;

    const roundScore = localPlayer.current_round_score ?? 0;
    const totalScore = (localPlayer.total_score ?? 0) + roundScore;
    const nextPlayerId = getNextPlayerId();

    await supabase
      .from("players")
      .update({
        total_score: totalScore,
        status: "stopped",
      })
      .eq("id", localPlayerId);

    await supabase
      .from("rooms")
      .update({
        current_player_id: nextPlayerId,
      })
      .eq("id", room.id);
  }, [room, localPlayerId, isMyTurn, localPlayer, getNextPlayerId]);

  return {
    isMyTurn,
    localPlayer,
    handleDraw,
    handleSecure,
  };
}
