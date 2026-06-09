import { Card } from './types';

/**
 * Generates the full deck composition:
 * - 1×"1", 2×"2", 3×"3", ... 12×"12"  (78 number cards)
 * - 3× "Geler", 3× "Pioche 3", 3× "Seconde Chance" (9 special cards)
 * Total: 87 cards
 */
export function createBaseDeck(): Card[] {
  const cards: Card[] = [];
  let idCounter = 0;

  // Number cards: N copies of card N
  for (let n = 1; n <= 12; n++) {
    for (let copy = 0; copy < n; copy++) {
      cards.push({
        id: `card-${idCounter++}`,
        type: 'number',
        value: n,
        label: String(n),
      });
    }
  }

  // Special cards
  const specials: { type: 'freeze' | 'draw3' | 'second_chance'; label: string }[] = [
    { type: 'freeze', label: 'Geler' },
    { type: 'draw3', label: 'Pioche 3' },
    { type: 'second_chance', label: 'Seconde Chance' },
  ];

  for (const special of specials) {
    for (let copy = 0; copy < 3; copy++) {
      cards.push({
        id: `card-${idCounter++}`,
        type: special.type,
        value: null,
        label: special.label,
      });
    }
  }

  return cards;
}

export const ROOM_CODE_LENGTH = 5;
