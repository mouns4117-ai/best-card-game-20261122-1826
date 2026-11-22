// Ember Court — table, card and layout constants.
// One place for every number the renderer and the rules both need, so a
// tweak to the table size or a card's size lands everywhere at once.

export const TABLE = { width: 1280, height: 800 };

export const LIFE_START = 15;
export const HAND_START = 5;
export const HAND_MAX = 7;
export const DECK_SIZE = 30;
export const EMBER_CAP = 10;

// The four elements. Each one has a colour and a shape, so a card's element
// is told apart by both — never by its name alone.
export const ELEMENTS = {
  flame: { name: 'Flame', color: '#d94f30', dark: '#8f2a16', shape: 'triangle', glyph: '▲' },
  tide: { name: 'Tide', color: '#2f7fc9', dark: '#174a7d', shape: 'circle', glyph: '●' },
  gale: { name: 'Gale', color: '#3da35d', dark: '#1e5c31', shape: 'diamond', glyph: '◆' },
  stone: { name: 'Stone', color: '#b98a2f', dark: '#6e4f14', shape: 'square', glyph: '■' },
};

// Card geometry on the table.
export const CARD = { width: 132, height: 184, radius: 10, gap: 14 };
export const HAND_Y = 596;
export const FOE_HAND_Y = 118;

// Layout anchors for the table chrome.
export const LAYOUT = {
  foeLife: { x: 64, y: 44 },
  myLife: { x: 64, y: 694 },
  round: { x: 640, y: 34 },
  ember: { x: 640, y: 96 },
  endTurn: { x: 1088, y: 636, w: 150, h: 52 },
  log: { x: 64, y: 300, w: 210, lines: 7 },
  deck: { x: 1130, y: 300 },
  discard: { x: 1130, y: 470 },
};

export const SCREENS = {
  TITLE: 'title',
  PLAY: 'play',
  WIN: 'win',
  LOSS: 'loss',
};
