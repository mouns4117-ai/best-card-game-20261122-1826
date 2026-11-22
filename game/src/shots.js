// Ember Court — the screenshot scenes behind ?shot=start|play|win|loss.
// Each scene plays the real rules forward from a fresh court for a fixed
// number of rounds, steered by an autopilot taste, so the frame is what a
// short game really looks like and the same seed always gives the same frame.

import { SCREENS } from './config.js';
import { autoplayRounds } from './ai.js';
import { Court } from './world.js';

const MAX_SEED_TRIES = 40;
const MAX_ROUNDS = 40;

/** Run `taste` from `seed` until the game ends or the round cap; return the court. */
function simulate(seed, taste) {
  const court = new Court(seed);
  autoplayRounds(court, taste, (c) => c.round > MAX_ROUNDS);
  return court;
}

/** First seed at or after `from` whose game ends with `winner`. */
function findSeed(from, taste, winner) {
  for (let s = from; s < from + MAX_SEED_TRIES; s += 1) {
    const court = simulate(s, taste);
    if (court.winner === winner) return { court, seed: s };
  }
  return null;
}

/**
 * Set `court` to the named scene and return the screen to draw.
 * start: the title over a fresh court. play: a mid-game table. win/loss:
 * a finished game, found by trying seeds in order from `seed`.
 */
export function stageShot(name, court, seed = 1) {
  if (name === 'play') {
    const staged = new Court(seed);
    autoplayRounds(staged, 'balanced', (c) => c.round >= 6);
    court.copyFrom(staged);
    return { screen: SCREENS.PLAY, seed };
  }
  if (name === 'win' || name === 'loss') {
    const taste = name === 'win' ? 'fierce' : 'timid';
    const winner = name === 'win' ? 'me' : 'foe';
    const found = findSeed(seed, taste, winner);
    if (found) {
      court.copyFrom(found.court);
      return { screen: winner === 'me' ? SCREENS.WIN : SCREENS.LOSS, seed: found.seed };
    }
    // No seed in range finished that way: show the closest game instead.
    const staged = simulate(seed, taste);
    court.copyFrom(staged);
    return { screen: SCREENS.PLAY, seed };
  }
  court.reset();
  return { screen: SCREENS.TITLE, seed };
}
