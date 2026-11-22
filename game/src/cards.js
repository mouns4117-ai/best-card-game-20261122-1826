// Ember Court — the cards.
// Twelve unique cards in four elements. Each card has a cost in ember, one
// effect, and a power number; the deck is a fixed recipe of copies so both
// sides draw from the same mix.

export const KINDS = {
  STRIKE: 'strike', // deal damage to the other side
  GUARD: 'guard', // gain shield that soaks damage first
  MEND: 'mend', // restore life
  DRAW: 'draw', // draw cards
  KINDLE: 'kindle', // gain ember this round
};

// id, name, element, cost, kind, power, copies in a deck, short effect text.
export const CARD_DEFS = [
  { id: 'spark', name: 'Spark', element: 'flame', cost: 0, kind: 'strike', power: 1, copies: 3, text: 'Deal 1 damage.' },
  { id: 'ember-fang', name: 'Ember Fang', element: 'flame', cost: 1, kind: 'strike', power: 3, copies: 3, text: 'Deal 3 damage.' },
  { id: 'cinder-slash', name: 'Cinder Slash', element: 'flame', cost: 2, kind: 'strike', power: 5, copies: 3, text: 'Deal 5 damage.' },
  { id: 'inferno', name: 'Inferno', element: 'flame', cost: 4, kind: 'strike', power: 9, copies: 2, text: 'Deal 9 damage.' },
  { id: 'still-water', name: 'Still Water', element: 'tide', cost: 1, kind: 'mend', power: 4, copies: 3, text: 'Restore 4 life.' },
  { id: 'moon-tide', name: 'Moon Tide', element: 'tide', cost: 3, kind: 'mend', power: 7, copies: 1, text: 'Restore 7 life. Draw 1.' },
  { id: 'deep-current', name: 'Deep Current', element: 'tide', cost: 2, kind: 'draw', power: 2, copies: 2, text: 'Draw 2 cards.' },
  { id: 'swift-wind', name: 'Swift Wind', element: 'gale', cost: 1, kind: 'draw', power: 1, copies: 3, text: 'Draw 1 card.' },
  { id: 'gale-rush', name: 'Gale Rush', element: 'gale', cost: 2, kind: 'draw', power: 2, copies: 2, text: 'Draw 2 cards.' },
  { id: 'zephyr', name: 'Zephyr', element: 'gale', cost: 1, kind: 'kindle', power: 2, copies: 2, text: 'Gain 2 ember.' },
  { id: 'pebble', name: 'Pebble', element: 'stone', cost: 0, kind: 'guard', power: 2, copies: 1, text: 'Gain 2 shield.' },
  { id: 'stone-wall', name: 'Stone Wall', element: 'stone', cost: 1, kind: 'guard', power: 4, copies: 3, text: 'Gain 4 shield.' },
  { id: 'granite-bastion', name: 'Granite Bastion', element: 'stone', cost: 3, kind: 'guard', power: 9, copies: 2, text: 'Gain 9 shield.' },
];

export const DECK_COUNT = CARD_DEFS.reduce((sum, def) => sum + def.copies, 0);

const BY_ID = new Map(CARD_DEFS.map((def) => [def.id, def]));

export function cardDef(id) {
  return BY_ID.get(id);
}

/** A fresh 30-card deck: one card object per copy, in recipe order. */
export function buildDeck() {
  const deck = [];
  for (const def of CARD_DEFS) {
    for (let i = 0; i < def.copies; i += 1) {
      deck.push({ uid: `${def.id}-${i}`, def });
    }
  }
  return deck;
}

/** The one-line effect a card shows under its name. */
export function effectLine(card) {
  return card.def.text;
}
