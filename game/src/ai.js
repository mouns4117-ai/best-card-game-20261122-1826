// Ember Court — the Regent's mind, and the autopilots that stage screenshots.
// One heuristic scores every playable card; the Regent plays the best one
// until nothing affordable is worth playing. The same scorer, with different
// tastes, steers the player's side in the staged scenes.

import { LIFE_START } from './config.js';

function scoreCard(court, name, card) {
  const me = court.side(name);
  const foe = court.other(name);
  const def = card.def;
  if (def.kind === 'strike') {
    let value = def.power;
    if (foe.shield > 0) value *= 0.6;
    if (def.power >= foe.life + foe.shield) value += 100;
    return value;
  }
  if (def.kind === 'guard') {
    const hurt = me.life <= 8 ? 1.6 : me.life <= 13 ? 1.1 : 0.7;
    return def.power * hurt;
  }
  if (def.kind === 'mend') {
    const missing = LIFE_START - me.life;
    if (missing <= 0) return -1;
    return Math.min(def.power, missing) * 1.4;
  }
  if (def.kind === 'draw') {
    return def.power * 1.5 + (me.hand.length <= 3 ? 1 : 0);
  }
  if (def.kind === 'kindle') {
    return def.power * 0.9 + 0.5;
  }
  return 0;
}

/** The card uids the Regent will play, in order, from the current state. */
export function chooseAiMoves(court, rng) {
  const plan = [];
  // Simulate on a light copy of the hand so uids stay valid as cards leave.
  const hand = court.foe.hand.map((card) => ({ card }));
  let ember = court.foe.ember;
  for (;;) {
    let best = null;
    let bestScore = 0.4;
    for (const entry of hand) {
      if (entry.card.def.cost > ember) continue;
      const score = scoreCard(court, 'foe', entry.card) + rng() * 0.2;
      if (score > bestScore) {
        bestScore = score;
        best = entry;
      }
    }
    if (!best) break;
    plan.push(best.card.uid);
    ember -= best.card.def.cost;
    hand.splice(hand.indexOf(best), 1);
  }
  return plan;
}

/**
 * Play one full player turn for `court` with a taste:
 * 'balanced' plays the best card by the same scorer, 'fierce' takes strikes
 * first, 'timid' never strikes. Ends the turn; returns nothing.
 */
export function autoplayTurn(court, taste) {
  for (;;) {
    let best = null;
    let bestScore = 0.4;
    for (let i = 0; i < court.me.hand.length; i += 1) {
      const card = court.me.hand[i];
      if (card.def.cost > court.me.ember) continue;
      let score = scoreCard(court, 'me', card);
      if (taste === 'fierce' && card.def.kind === 'strike') score += 3;
      if (taste === 'fierce' && card.def.kind !== 'strike') score -= 1;
      if (taste === 'timid' && card.def.kind === 'strike') score = -1;
      if (score > bestScore) {
        bestScore = score;
        best = i;
      }
    }
    if (best === null) break;
    court.playCard('me', best);
    if (court.phase === 'over') return;
  }
  court.beginAiTurn();
  while (court.aiStep() !== null) {
    if (court.phase === 'over') return;
  }
  court.finishAiTurn();
}

/** Play whole rounds with `taste` until `stop` says so, or the game ends. */
export function autoplayRounds(court, taste, stop) {
  let guard = 0;
  while (court.phase !== 'over' && guard < 60) {
    autoplayTurn(court, taste);
    guard += 1;
    if (stop && stop(court)) break;
  }
}
