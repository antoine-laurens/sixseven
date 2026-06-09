import { Card } from './types';
import { createBaseDeck } from './constants';

/**
 * Fisher-Yates shuffle — produces an unbiased permutation.
 */
export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Creates a freshly shuffled deck for a new round.
 */
export function generateDeck(): Card[] {
  return shuffleDeck(createBaseDeck());
}

/**
 * Draws the top card from the deck.
 * Returns the drawn card and the remaining deck.
 */
export function drawCard(deck: Card[]): { card: Card; remainingDeck: Card[] } {
  if (deck.length === 0) {
    throw new Error('Deck is empty');
  }
  const [card, ...remainingDeck] = deck;
  return { card, remainingDeck };
}

/**
 * Checks if drawing `newCard` would bust the player.
 * A bust occurs when a NUMBER card's value is already present in the player's cards.
 * Special cards never cause a bust.
 */
export function checkBust(cardsInFront: Card[], newCard: Card): boolean {
  if (newCard.type !== 'number') return false;
  return cardsInFront.some(
    (c) => c.type === 'number' && c.value === newCard.value
  );
}

/**
 * Calculates the sum of all number card values.
 * Special cards contribute 0 to the score.
 */
export function calculateScore(cards: Card[]): number {
  return cards.reduce((sum, card) => sum + (card.value ?? 0), 0);
}

/**
 * Generates a random 5-letter uppercase room code.
 */
export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // Removed I and O to avoid confusion
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}
