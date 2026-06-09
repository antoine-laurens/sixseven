// ─── Card Types ───────────────────────────────────────────────

export type CardType = 'number' | 'freeze' | 'draw3' | 'second_chance';

export interface Card {
  id: string;
  type: CardType;
  value: number | null;
  label: string;
}

// ─── Room ─────────────────────────────────────────────────────

export type RoomStatus = 'waiting' | 'playing' | 'finished';

export interface Room {
  id: string;
  code: string;
  status: RoomStatus;
  deck: Card[];
  current_player_id: string | null;
  created_at: string;
}

// ─── Player ───────────────────────────────────────────────────

export type PlayerStatus = 'playing' | 'busted' | 'stopped';

export interface Player {
  id: string;
  room_id: string;
  pseudo: string;
  total_score: number;
  current_round_score: number;
  cards_in_front: Card[];
  is_host: boolean;
  turn_order: number;
  status: PlayerStatus;
}
