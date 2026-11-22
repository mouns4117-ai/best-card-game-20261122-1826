// Ember Court — the browser entry point.
// Owns the canvas, the frame loop and the turn timer. The rules live in
// world.js, the drawing in render.js, the sounds in audio.js; this file only
// wires them together and answers the player's clicks and keys.

import { SCREENS, TABLE } from './config.js';
import { hitTest, installInput } from './input.js';
import { render } from './render.js';
import { stageShot } from './shots.js';
import { Court, PHASE_AI, PHASE_OVER, PHASE_PLAYER } from './world.js';
import { isMuted, setMuted, sfx } from './audio.js';

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const ctx = canvas.getContext('2d');
canvas.width = TABLE.width;
canvas.height = TABLE.height;

const params = new URLSearchParams(window.location.search);
const shotName = params.get('shot');
const shotSeed = Number.parseInt(params.get('seed') || '1', 10) || 1;

const court = new Court(shotSeed);
let screen = SCREENS.TITLE;
let hover = -1;
let aiTimer = null;

function announce(text) {
  if (status) status.textContent = text;
}

function afterPlay(kind) {
  if (kind === 'strike') sfx.hit();
  else if (kind === 'mend') sfx.heal();
  else if (kind === 'guard') sfx.shield();
  else if (kind === 'draw' || kind === 'kindle') sfx.draw();
  if (court.phase === PHASE_OVER) {
    if (court.winner === 'me') sfx.win();
    else sfx.lose();
    screen = court.winner === 'me' ? SCREENS.WIN : SCREENS.LOSS;
    announce(screen === SCREENS.WIN ? 'Victory! The court is yours.' : 'Defeat. The Regent keeps the court.');
  }
}

/** Play one of the player's hand cards. */
function playCard(index) {
  if (screen !== SCREENS.PLAY || court.phase !== PHASE_PLAYER) return;
  const card = court.me.hand[index];
  if (!card || card.def.cost > court.me.ember) return;
  sfx.play();
  court.playCard('me', index);
  afterPlay(card.def.kind);
  announce(`You played ${card.def.name}. ${court.me.life} life, ${court.foe.life} for the Regent.`);
}

/** Run the Regent's turn one card at a time, then start the next round. */
function runAiTurn() {
  const planned = court.beginAiTurn();
  if (planned === 0) {
    court.finishAiTurn();
    announce(`Round ${court.round} — your turn. ${court.me.life} life, ${court.foe.life} for the Regent.`);
    return;
  }
  let step = 0;
  aiTimer = window.setInterval(() => {
    const card = court.aiStep();
    if (card) afterPlay(card.def.kind);
    step += 1;
    if (card === null || step >= planned + 1 || court.phase === PHASE_OVER) {
      window.clearInterval(aiTimer);
      aiTimer = null;
      if (court.phase !== PHASE_OVER) {
        court.finishAiTurn();
        announce(`Round ${court.round} — your turn. ${court.me.life} life, ${court.foe.life} for the Regent.`);
      }
    }
  }, 650);
}

function endTurn() {
  if (screen !== SCREENS.PLAY || court.phase !== PHASE_PLAYER) return;
  sfx.click();
  runAiTurn();
}

function restart() {
  if (aiTimer !== null) {
    window.clearInterval(aiTimer);
    aiTimer = null;
  }
  court.reset();
  screen = SCREENS.PLAY;
  announce('A new duel begins. Your turn.');
}

installInput(canvas, {
  hover(x, y) {
    if (screen !== SCREENS.PLAY) {
      hover = -1;
      return;
    }
    const hit = hitTest(court, x, y);
    hover = hit.kind === 'card' ? hit.index : -1;
    canvas.style.cursor = hit.kind === 'none' ? 'default' : 'pointer';
  },
  click(x, y) {
    if (screen === SCREENS.TITLE) {
      sfx.click();
      screen = SCREENS.PLAY;
      announce('A new duel begins. Your turn.');
      return;
    }
    if (screen === SCREENS.WIN || screen === SCREENS.LOSS) {
      restart();
      return;
    }
    const hit = hitTest(court, x, y);
    if (hit.kind === 'card') playCard(hit.index);
    else if (hit.kind === 'end') endTurn();
  },
  key(key) {
    if (key === 'Enter' && screen === SCREENS.TITLE) {
      screen = SCREENS.PLAY;
      announce('A new duel begins. Your turn.');
      return;
    }
    if ((key === 'r' || key === 'R') && (screen === SCREENS.WIN || screen === SCREENS.LOSS)) {
      restart();
      return;
    }
    if (key === 'm' || key === 'M') {
      setMuted(!isMuted());
      return;
    }
    if (screen !== SCREENS.PLAY) return;
    if (key >= '1' && key <= '7') playCard(Number.parseInt(key, 10) - 1);
    else if (key === 'e' || key === 'E' || key === ' ') endTurn();
  },
});

// A ?shot= URL stages one fixed scene instead of the title screen, for the
// screenshots. The frame is drawn once with a frozen clock, so it is stable.
if (shotName) {
  const staged = stageShot(shotName, court, shotSeed);
  screen = staged.screen;
  render(ctx, court, screen, { hover: -1 }, Date.now());
  announce(`Ember Court, ${shotName} scene.`);
} else {
  const loop = () => {
    render(ctx, court, screen, { hover }, Date.now());
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}
