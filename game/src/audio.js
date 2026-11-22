// Ember Court — small procedural sounds, no audio files.
// Every effect is a few oscillators through one gain node, made on the first
// user gesture so the browser's autoplay rules stay happy.

let ctx = null;
let muted = false;

function ensure() {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  return ctx;
}

function tone(freq, dur, type, vol, when = 0, slideTo = null) {
  if (muted) return;
  const ac = ensure();
  if (!ac) return;
  const t0 = ac.currentTime + when;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

export const sfx = {
  click() { tone(660, 0.06, 'triangle', 0.12); },
  play() { tone(420, 0.12, 'triangle', 0.16, 0, 840); },
  draw() { tone(520, 0.08, 'sine', 0.1, 0, 700); },
  hit() { tone(180, 0.18, 'sawtooth', 0.16, 0, 70); tone(90, 0.22, 'square', 0.1); },
  heal() { tone(520, 0.16, 'sine', 0.12); tone(780, 0.2, 'sine', 0.1, 0.08); },
  shield() { tone(300, 0.14, 'triangle', 0.12, 0, 240); },
  win() {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.32, 'triangle', 0.14, i * 0.12));
  },
  lose() {
    [330, 262, 196].forEach((f, i) => tone(f, 0.4, 'sawtooth', 0.1, i * 0.16));
  },
};

export function setMuted(value) {
  muted = value;
}

export function isMuted() {
  return muted;
}
