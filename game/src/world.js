// Ember Court — the table state and the rules.
// Pure logic: no canvas, no audio, no DOM. The interactive game and the
// screenshot scenes both drive the same Court, so a staged frame is a real
// game state reached by the real rules.

import { buildDeck } from './cards.js';
import { EMBER_CAP, HAND_MAX, HAND_START, LIFE_START } from './config.js';
import { chooseAiMoves } from './ai.js';
import { makeRng, shuffle } from './rng.js';

export const PHASE_PLAYER = 'player';
export const PHASE_AI = 'ai';
export const PHASE_OVER = 'over';

function freshSide(deck) {
  return { life: LIFE_START, shield: 0, ember: 1, emberMax: 1, deck, hand: [], discard: [] };
}

export class Court {
  constructor(seed = 1) {
    this.seed = seed;
    this.reset();
  }

  reset() {
    this.rng = makeRng(this.seed);
    this.round = 1;
    this.phase = PHASE_PLAYER;
    this.winner = null;
    this.score = 0;
    this.log = ['The court is set. Ember flows.'];
    this.lastPlay = null;
    this.floaters = [];
    this.aiPlan = [];
    this.me = freshSide(shuffle(buildDeck(), this.rng));
    this.foe = freshSide(shuffle(buildDeck(), this.rng));
    this.me.emberMax = 1;
    this.foe.emberMax = 1;
    this.drawCards('me', HAND_START);
    this.drawCards('foe', HAND_START);
  }

  side(name) {
    return name === 'me' ? this.me : this.foe;
  }

  other(name) {
    return name === 'me' ? this.foe : this.me;
  }

  say(text) {
    this.log.push(text);
    if (this.log.length > 7) this.log.shift();
  }

  drawCards(name, n) {
    const side = this.side(name);
    for (let i = 0; i < n; i += 1) {
      if (side.hand.length >= HAND_MAX) break;
      if (side.deck.length === 0) {
        if (side.discard.length === 0) break;
        side.deck = shuffle(side.discard, this.rng);
        side.discard = [];
        this.say(`${name === 'me' ? 'You' : 'The Regent'} reshuffle the discard.`);
      }
      side.hand.push(side.deck.pop());
    }
  }

  canPlay(name, index) {
    if (this.phase === PHASE_OVER) return false;
    if (name === 'me' && this.phase !== PHASE_PLAYER) return false;
    if (name === 'foe' && this.phase !== PHASE_AI) return false;
    const side = this.side(name);
    const card = side.hand[index];
    if (!card) return false;
    return card.def.cost <= side.ember;
  }

  /** Play hand[index] for `name`. Returns the played card, or null. */
  playCard(name, index) {
    if (!this.canPlay(name, index)) return null;
    const side = this.side(name);
    const target = this.other(name);
    const [card] = side.hand.splice(index, 1);
    side.discard.push(card);
    side.ember -= card.def.cost;
    const who = name === 'me' ? 'You' : 'The Regent';
    const def = card.def;
    if (def.kind === 'strike') {
      const dealt = this.damage(name === 'me' ? 'foe' : 'me', def.power);
      this.score += name === 'me' ? dealt : 0;
      this.say(dealt === 0
        ? `${who} play ${def.name} — blocked by shield.`
        : `${who} play ${def.name} — ${dealt} damage.`);
    } else if (def.kind === 'guard') {
      side.shield += def.power;
      this.say(`${who} raise ${def.power} shield.`);
    } else if (def.kind === 'mend') {
      const healed = Math.min(LIFE_START - side.life, def.power);
      side.life += healed;
      this.say(`${who} restore ${healed} life.`);
      if (card.def.id === 'moon-tide') this.drawCards(name, 1);
    } else if (def.kind === 'draw') {
      this.drawCards(name, def.power);
      this.say(`${who} draw ${def.power}.`);
    } else if (def.kind === 'kindle') {
      side.ember += def.power;
      this.say(`${who} kindle +${def.power} ember.`);
    }
    this.lastPlay = { side: name, card, at: Date.now() };
    return card;
  }

  /** Damage `name` by `amount`, shield first. Returns damage that got through. */
  damage(name, amount) {
    const side = this.side(name);
    const soaked = Math.min(side.shield, amount);
    side.shield -= soaked;
    const through = amount - soaked;
    side.life = Math.max(0, side.life - through);
    // A strike fully soaked by shield shows no damage number.
    if (through > 0) {
      this.floaters.push({
        text: `-${through}`,
        side: name,
        color: '#ff6b4a',
        born: Date.now(),
      });
    }
    if (side.life <= 0) {
      this.winner = name === 'me' ? 'foe' : 'me';
      this.phase = PHASE_OVER;
      if (this.winner === 'me') this.score += 500;
      this.say(this.winner === 'me' ? 'The Regent falls. The court is yours!' : 'Your light goes out. The Regent keeps the court.');
    }
    return through;
  }

  /** End the player's turn: the Regent plays, then a new round begins. */
  beginAiTurn() {
    if (this.phase !== PHASE_PLAYER) return 0;
    this.phase = PHASE_AI;
    this.aiPlan = chooseAiMoves(this, this.rng);
    return this.aiPlan.length;
  }

  /** Play the Regent's next planned card. Returns it, or null when done. */
  aiStep() {
    if (this.phase !== PHASE_AI) return null;
    const uid = this.aiPlan.shift();
    if (uid === undefined) return null;
    const index = this.foe.hand.findIndex((card) => card.uid === uid);
    if (index < 0) return null;
    return this.playCard('foe', index);
  }

  finishAiTurn() {
    if (this.phase !== PHASE_AI) return;
    this.round += 1;
    const cap = Math.min(this.round, EMBER_CAP);
    this.me.emberMax = cap;
    this.me.ember = cap;
    this.foe.emberMax = cap;
    this.foe.ember = cap;
    this.drawCards('me', 1);
    this.drawCards('foe', 1);
    this.phase = PHASE_PLAYER;
    this.say(`Round ${this.round} — ember rises to ${cap}.`);
    // The court grows cold: from round 8 the embers drain both sides, so
    // no duel can stall forever.
    if (this.round >= 8) {
      const drain = this.round - 7;
      this.say(`The court grows cold — both sides lose ${drain} life.`);
      this.damage('me', drain);
      if (this.phase === PHASE_OVER) return;
      this.damage('foe', drain);
    }
  }

  /** Copy another court's whole state into this one (screenshot staging). */
  copyFrom(other) {
    const cloneSide = (s) => ({
      life: s.life,
      shield: s.shield,
      ember: s.ember,
      emberMax: s.emberMax,
      deck: s.deck.slice(),
      hand: s.hand.slice(),
      discard: s.discard.slice(),
    });
    this.seed = other.seed;
    this.rng = other.rng;
    this.round = other.round;
    this.phase = other.phase;
    this.winner = other.winner;
    this.score = other.score;
    this.log = other.log.slice();
    this.lastPlay = other.lastPlay;
    this.floaters = other.floaters.slice();
    this.aiPlan = other.aiPlan.slice();
    this.me = cloneSide(other.me);
    this.foe = cloneSide(other.foe);
  }

  /** How many cards are left in each deck, for the HUD. */
  deckCounts() {
    return { me: this.me.deck.length, foe: this.foe.deck.length };
  }
}
