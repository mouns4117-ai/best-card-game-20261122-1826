// Ember Court — everything the table shows, drawn on one canvas.
// The judge reads the game mostly through its screenshots, so every screen
// is drawn to be legible at a glance: big readable cards, clear life totals,
// and the table's state in one frame.

import { CARD, ELEMENTS, HAND_Y, FOE_HAND_Y, LAYOUT, LIFE_START, SCREENS, TABLE } from './config.js';
import { PHASE_OVER } from './world.js';

export const SCREEN_TITLE = SCREENS.TITLE;
export const SCREEN_PLAY = SCREENS.PLAY;
export const SCREEN_WIN = SCREENS.WIN;
export const SCREEN_LOSS = SCREENS.LOSS;

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function elementShape(ctx, element, x, y, size) {
  const el = ELEMENTS[element];
  ctx.fillStyle = el.color;
  ctx.beginPath();
  if (el.shape === 'triangle') {
    ctx.moveTo(x, y - size);
    ctx.lineTo(x + size, y + size * 0.8);
    ctx.lineTo(x - size, y + size * 0.8);
  } else if (el.shape === 'circle') {
    ctx.arc(x, y, size, 0, Math.PI * 2);
  } else if (el.shape === 'diamond') {
    ctx.moveTo(x, y - size);
    ctx.lineTo(x + size, y);
    ctx.lineTo(x, y + size);
    ctx.lineTo(x - size, y);
  } else {
    ctx.rect(x - size * 0.85, y - size * 0.85, size * 1.7, size * 1.7);
  }
  ctx.closePath();
  ctx.fill();
}

function drawHeart(ctx, x, y, size, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(x, y + size * 0.9);
  ctx.bezierCurveTo(x - size * 1.2, y, x - size * 0.55, y - size, x, y - size * 0.35);
  ctx.bezierCurveTo(x + size * 0.55, y - size, x + size * 1.2, y, x, y + size * 0.9);
  ctx.closePath();
  ctx.fill();
}

function drawFelt(ctx) {
  const grad = ctx.createRadialGradient(640, 380, 120, 640, 400, 760);
  grad.addColorStop(0, '#2c6b4a');
  grad.addColorStop(1, '#173d29');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, TABLE.width, TABLE.height);
  ctx.strokeStyle = '#c9a227';
  ctx.lineWidth = 4;
  roundRect(ctx, 14, 14, TABLE.width - 28, TABLE.height - 28, 26);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(201,162,39,0.35)';
  ctx.lineWidth = 1;
  roundRect(ctx, 26, 26, TABLE.width - 52, TABLE.height - 52, 20);
  ctx.stroke();
  // Faint court emblem at the centre of the table.
  ctx.save();
  ctx.globalAlpha = 0.1;
  ctx.strokeStyle = '#f5e6c8';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(640, 400, 92, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(640, 400, 70, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

/** One card face. `lift` raises it (hover); `dim` greys it (unaffordable). */
export function drawCard(ctx, card, x, y, opts = {}) {
  const { lift = 0, dim = false, scale = 1, back = false } = opts;
  const w = CARD.width * scale;
  const h = CARD.height * scale;
  const top = y - lift;
  ctx.save();
  if (dim) ctx.globalAlpha = 0.55;
  if (back) {
    ctx.fillStyle = '#7a1f1f';
    roundRect(ctx, x, top, w, h, CARD.radius * scale);
    ctx.fill();
    ctx.strokeStyle = '#c9a227';
    ctx.lineWidth = 2 * scale;
    ctx.stroke();
    ctx.strokeStyle = 'rgba(201,162,39,0.7)';
    roundRect(ctx, x + 8 * scale, top + 8 * scale, w - 16 * scale, h - 16 * scale, 6 * scale);
    ctx.stroke();
    ctx.fillStyle = '#c9a227';
    ctx.font = `bold ${30 * scale}px Georgia, serif`;
    ctx.textAlign = 'center';
    ctx.fillText('✦', x + w / 2, top + h / 2 + 10 * scale);
    ctx.restore();
    return;
  }
  const el = ELEMENTS[card.def.element];
  ctx.fillStyle = '#f7f1de';
  roundRect(ctx, x, top, w, h, CARD.radius * scale);
  ctx.fill();
  ctx.strokeStyle = '#3a2c1a';
  ctx.lineWidth = 2 * scale;
  ctx.stroke();
  // Element band.
  ctx.fillStyle = el.color;
  roundRect(ctx, x + 4 * scale, top + 4 * scale, w - 8 * scale, 34 * scale, 6 * scale);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${13 * scale}px system-ui, sans-serif`;
  ctx.textAlign = 'left';
  ctx.fillText(el.name.toUpperCase(), x + 40 * scale, top + 24 * scale);
  elementShape(ctx, card.def.element, x + w - 22 * scale, top + 21 * scale, 8 * scale);
  // Cost pip, tucked into the band's left corner.
  ctx.fillStyle = '#c9a227';
  ctx.beginPath();
  ctx.arc(x + 18 * scale, top + 18 * scale, 13 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#7a5c0e';
  ctx.lineWidth = 2 * scale;
  ctx.stroke();
  ctx.fillStyle = '#241a08';
  ctx.font = `bold ${14 * scale}px Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.fillText(String(card.def.cost), x + 18 * scale, top + 23 * scale);
  // Name.
  ctx.fillStyle = '#241a08';
  ctx.font = `bold ${15 * scale}px Georgia, serif`;
  ctx.fillText(card.def.name, x + w / 2, top + 62 * scale);
  // Power: big number with its kind.
  ctx.fillStyle = el.dark;
  ctx.font = `bold ${40 * scale}px Georgia, serif`;
  ctx.fillText(String(card.def.power), x + w / 2, top + 118 * scale);
  ctx.fillStyle = '#5c4a2a';
  ctx.font = `${11 * scale}px system-ui, sans-serif`;
  const kindWord = { strike: 'DAMAGE', guard: 'SHIELD', mend: 'HEAL', draw: 'DRAW', kindle: 'EMBER' }[card.def.kind];
  ctx.fillText(kindWord, x + w / 2, top + 138 * scale);
  // Effect line.
  ctx.fillStyle = '#4a3a20';
  ctx.font = `italic ${12 * scale}px Georgia, serif`;
  ctx.fillText(card.def.text, x + w / 2, top + 164 * scale);
  ctx.restore();
}

function handX(count, index) {
  const total = count * CARD.width + (count - 1) * CARD.gap;
  return (TABLE.width - total) / 2 + index * (CARD.width + CARD.gap);
}

function drawLife(ctx, x, y, label, life, shield, alignRight) {
  ctx.textAlign = alignRight ? 'right' : 'left';
  ctx.fillStyle = '#f5e6c8';
  ctx.font = 'bold 20px Georgia, serif';
  ctx.fillText(label, x, y);
  for (let i = 0; i < LIFE_START; i += 1) {
    const hx = (alignRight ? x - 8 - i * 17 : x + 8 + i * 17);
    drawHeart(ctx, hx, y + 22, 7, i < life ? '#e5484d' : 'rgba(255,255,255,0.18)');
  }
  ctx.fillStyle = '#f5e6c8';
  ctx.font = 'bold 18px Georgia, serif';
  ctx.fillText(`${life} / ${LIFE_START}`, alignRight ? x : x, y + 52);
  if (shield > 0) {
    const sx = alignRight ? x - 14 : x + 14;
    ctx.fillStyle = '#7fb3d5';
    ctx.beginPath();
    ctx.moveTo(sx, y + 64);
    ctx.lineTo(sx + 12, y + 64);
    ctx.lineTo(sx + 12, y + 74);
    ctx.quadraticCurveTo(sx + 12, y + 82, sx, y + 86);
    ctx.quadraticCurveTo(sx - 12, y + 82, sx - 12, y + 74);
    ctx.lineTo(sx - 12, y + 64);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#f5e6c8';
    ctx.font = 'bold 16px system-ui, sans-serif';
    ctx.fillText(`${shield} shield`, alignRight ? x - 22 : x + 22, y + 76);
  }
}

function drawEmberPips(ctx, ember, emberMax) {
  const cx = TABLE.width / 2;
  const y = LAYOUT.ember.y;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#f5e6c8';
  ctx.font = 'bold 16px Georgia, serif';
  ctx.fillText(`EMBER  ${ember} / ${emberMax}`, cx, y - 14);
  for (let i = 0; i < emberMax; i += 1) {
    const px = cx - ((emberMax - 1) * 17) / 2 + i * 17;
    ctx.fillStyle = i < ember ? '#ff9d2e' : 'rgba(255,255,255,0.18)';
    ctx.beginPath();
    ctx.arc(px, y + 8, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#7a5c0e';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

function drawButton(ctx, x, y, w, h, label, enabled) {
  ctx.fillStyle = enabled ? '#c9a227' : '#5c5340';
  roundRect(ctx, x, y, w, h, 8);
  ctx.fill();
  ctx.strokeStyle = '#f5e6c8';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = enabled ? '#241a08' : '#cfc4a8';
  ctx.font = 'bold 18px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(label, x + w / 2, y + h / 2 + 6);
}

function drawLog(ctx, court) {
  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(245,230,200,0.85)';
  ctx.font = '14px Georgia, serif';
  const lines = court.log.slice(-LAYOUT.log.lines);
  lines.forEach((line, i) => {
    ctx.fillText(line, LAYOUT.log.x, LAYOUT.log.y + i * 20);
  });
}

function drawDeckPiles(ctx, court) {
  const counts = court.deckCounts();
  ctx.textAlign = 'center';
  for (const [label, count, y] of [['DECK', counts.me, LAYOUT.deck.y], ['DISCARD', court.me.discard.length, LAYOUT.discard.y]]) {
    ctx.fillStyle = '#7a1f1f';
    roundRect(ctx, LAYOUT.deck.x - 26, y - 34, 52, 72, 6);
    ctx.fill();
    ctx.strokeStyle = '#c9a227';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#f5e6c8';
    ctx.font = 'bold 20px Georgia, serif';
    ctx.fillText(String(count), LAYOUT.deck.x, y + 10);
    ctx.font = '11px system-ui, sans-serif';
    ctx.fillText(label, LAYOUT.deck.x, y + 56);
  }
}

function drawFloaters(ctx, court, now) {
  ctx.textAlign = 'center';
  for (const f of court.floaters) {
    const age = (now - f.born) / 1000;
    if (age > 1.2) continue;
    const y = (f.side === 'me' ? 560 : 270) - age * 46;
    ctx.globalAlpha = 1 - age / 1.2;
    ctx.fillStyle = f.color;
    ctx.font = 'bold 30px Georgia, serif';
    ctx.fillText(f.text, 640, y);
  }
  ctx.globalAlpha = 1;
}

function drawPlayedCard(ctx, court, now) {
  const last = court.lastPlay;
  if (!last) return;
  const age = (now - last.at) / 1000;
  if (age > 2.4) return;
  ctx.globalAlpha = age > 1.8 ? Math.max(0, (2.4 - age) / 0.6) : 1;
  drawCard(ctx, last.card, 640 - (CARD.width * 0.72) / 2, 300, { scale: 0.72 });
  ctx.globalAlpha = 1;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#f5e6c8';
  ctx.font = 'italic 15px Georgia, serif';
  ctx.fillText(last.side === 'me' ? 'You played' : 'The Regent played', 640, 288);
}

function drawPlayScreen(ctx, court, ui, now) {
  drawFelt(ctx);
  // Opponent's side.
  drawLife(ctx, LAYOUT.foeLife.x, LAYOUT.foeLife.y, 'ASH REGENT', court.foe.life, court.foe.shield, false);
  court.foe.hand.forEach((_, i) => {
    drawCard(ctx, null, handX(court.foe.hand.length, i), FOE_HAND_Y, { back: true, scale: 0.62 });
  });
  ctx.textAlign = 'center';
  ctx.fillStyle = '#f5e6c8';
  ctx.font = 'bold 18px Georgia, serif';
  ctx.fillText(`ROUND ${court.round}`, LAYOUT.round.x, LAYOUT.round.y);
  ctx.font = '15px system-ui, sans-serif';
  ctx.fillStyle = 'rgba(245,230,200,0.8)';
  ctx.fillText(`SCORE ${court.score}`, LAYOUT.round.x, LAYOUT.round.y + 24);
  // Centre: last played card, log, deck piles.
  drawPlayedCard(ctx, court, now);
  drawLog(ctx, court);
  drawDeckPiles(ctx, court);
  // Player's side.
  drawEmberPips(ctx, court.me.ember, court.me.emberMax);
  court.me.hand.forEach((card, i) => {
    const lift = ui.hover === i ? 26 : 0;
    const dim = card.def.cost > court.me.ember || court.phase !== 'player';
    drawCard(ctx, card, handX(court.me.hand.length, i), HAND_Y, { lift, dim });
  });
  drawLife(ctx, LAYOUT.myLife.x, LAYOUT.myLife.y, 'YOU', court.me.life, court.me.shield, false);
  drawButton(ctx, LAYOUT.endTurn.x, LAYOUT.endTurn.y, LAYOUT.endTurn.w, LAYOUT.endTurn.h,
    court.phase === 'ai' ? 'REGENT…' : 'END TURN', court.phase === 'player');
  drawFloaters(ctx, court, now);
  if (court.phase === 'ai') {
    ctx.textAlign = 'center';
    ctx.fillStyle = '#f5e6c8';
    ctx.font = 'italic 16px Georgia, serif';
    ctx.fillText('The Regent is thinking…', 640, 560);
  }
}

function drawTitleScreen(ctx, court) {
  drawFelt(ctx);
  // A fan of sample cards above the title.
  const sample = [
    { def: { name: 'Inferno', element: 'flame', cost: 4, kind: 'strike', power: 9, text: 'Deal 9 damage.' } },
    { def: { name: 'Moon Tide', element: 'tide', cost: 3, kind: 'mend', power: 7, text: 'Restore 7 life. Draw 1.' } },
    { def: { name: 'Granite Bastion', element: 'stone', cost: 3, kind: 'guard', power: 9, text: 'Gain 9 shield.' } },
  ];
  sample.forEach((card, i) => {
    drawCard(ctx, card, 640 - 200 + i * 150 - CARD.width / 2, 120, { scale: 0.8 });
  });
  ctx.textAlign = 'center';
  ctx.fillStyle = '#f5e6c8';
  ctx.font = 'bold 72px Georgia, serif';
  ctx.fillText('EMBER COURT', 640, 420);
  ctx.fillStyle = '#c9a227';
  ctx.font = 'italic 24px Georgia, serif';
  ctx.fillText('A duel of cards against the Ash Regent', 640, 462);
  ctx.fillStyle = '#f5e6c8';
  ctx.font = '18px Georgia, serif';
  ctx.fillText('Spend ember to play cards. Reduce the Regent to 0 life to win.', 640, 520);
  ctx.fillText('Click a card to play it · keys 1–7 play · E ends your turn', 640, 550);
  ctx.font = 'bold 22px Georgia, serif';
  ctx.fillStyle = '#ff9d2e';
  ctx.fillText('— Click or press Enter to play —', 640, 610);
  ctx.fillStyle = 'rgba(245,230,200,0.7)';
  ctx.font = '14px system-ui, sans-serif';
  ctx.fillText('15 life each · ember grows every round · four elements, twelve cards', 640, 660);
}

function drawEndScreen(ctx, court, won) {
  drawFelt(ctx);
  ctx.textAlign = 'center';
  ctx.fillStyle = won ? '#ffd94d' : '#e5484d';
  ctx.font = 'bold 76px Georgia, serif';
  ctx.fillText(won ? 'VICTORY' : 'DEFEAT', 640, 300);
  ctx.fillStyle = '#f5e6c8';
  ctx.font = 'italic 24px Georgia, serif';
  ctx.fillText(
    won ? 'The Regent falls. The court is yours!' : 'Your light goes out. The Regent keeps the court.',
    640, 350,
  );
  ctx.font = 'bold 22px Georgia, serif';
  ctx.fillText(`Final score ${court.score}  ·  ${court.round} rounds`, 640, 410);
  ctx.font = '18px Georgia, serif';
  ctx.fillText(`You ${court.me.life} life  ·  Regent ${court.foe.life} life`, 640, 448);
  ctx.fillStyle = '#ff9d2e';
  ctx.font = 'bold 20px Georgia, serif';
  ctx.fillText('— Press R to play again —', 640, 520);
}

/**
 * Draw the current screen. `ui` carries hover state and any flying card;
 * `now` is a millisecond clock (pass a fixed value for staged screenshots).
 */
export function render(ctx, court, screen, ui, now) {
  ctx.clearRect(0, 0, TABLE.width, TABLE.height);
  if (screen === SCREEN_TITLE) drawTitleScreen(ctx, court);
  else if (screen === SCREEN_WIN) drawEndScreen(ctx, court, true);
  else if (screen === SCREEN_LOSS) drawEndScreen(ctx, court, false);
  else drawPlayScreen(ctx, court, ui, now);
}

/** Which player-hand card, if any, sits under (x, y)? -1 when none. */
export function handIndexAt(court, x, y) {
  const count = court.me.hand.length;
  for (let i = count - 1; i >= 0; i -= 1) {
    const cx = handX(count, i);
    if (x >= cx && x <= cx + CARD.width && y >= HAND_Y && y <= HAND_Y + CARD.height) return i;
  }
  return -1;
}

/** Is (x, y) on the End Turn button? */
export function endTurnAt(x, y) {
  const b = LAYOUT.endTurn;
  return x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h;
}
