// Ember Court — mouse and keyboard input.
// Hit-testing lives here so main.js only decides what a hit means. Pointer
// coordinates are translated into canvas space (the canvas is scaled to fit
// its element, so a click's client position is not a canvas position).

import { endTurnAt, handIndexAt } from './render.js';

export function canvasPoint(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY,
  };
}

export function installInput(canvas, handlers) {
  canvas.addEventListener('pointermove', (event) => {
    const p = canvasPoint(canvas, event);
    handlers.hover(p.x, p.y);
  });
  canvas.addEventListener('pointerleave', () => handlers.hover(-1, -1));
  canvas.addEventListener('click', (event) => {
    const p = canvasPoint(canvas, event);
    handlers.click(p.x, p.y);
  });
  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    handlers.key(event.key);
  });
}

/** What sits under (x, y) on the play screen: a hand card or the button. */
export function hitTest(court, x, y) {
  const card = handIndexAt(court, x, y);
  if (card >= 0) return { kind: 'card', index: card };
  if (endTurnAt(x, y)) return { kind: 'end' };
  return { kind: 'none' };
}
