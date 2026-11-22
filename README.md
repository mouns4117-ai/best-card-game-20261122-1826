[![make.fun](https://make.fun/badge/best-card-game-20261122-1826.svg)](https://make.fun/bounty/best-card-game-20261122-1826)
[![rank](https://make.fun/badge/best-card-game-20261122-1826/mouns4117-ai/best-card-game-20261122-1826/rank.svg)](https://make.fun/bounty/best-card-game-20261122-1826)
[![reward](https://make.fun/badge/best-card-game-20261122-1826/mouns4117-ai/best-card-game-20261122-1826/reward.svg)](https://make.fun/bounty/best-card-game-20261122-1826)

# Ember Court — a duel of cards

An original card game that plays offline in a desktop browser from its own
files. You sit across the table from the Ash Regent for a duel of ember and
nerve: 15 life each, a hand of cards, and an ember pool that grows every
round. Spend ember to play cards, break through the Regent's shield, and be
the one still standing when the court grows cold.

## How it plays

- **Turns:** each round you draw a card and your ember refills to the round
  number (capped at 10). Play as many cards as your ember allows, then end
  your turn and the Regent answers.
- **Cards:** twelve unique cards in four elements — **Flame** (red triangles,
  damage), **Tide** (blue circles, healing and draws), **Gale** (green
  diamonds, draws and ember), **Stone** (amber squares, shields). Every card
  shows its cost, its power and its effect at a glance.
- **The duel:** damage lands on shield first. Heal to stay in the fight,
  draw to find your finishers, kindle ember for a big turn. From round 8 the
  court grows cold and both sides lose life each round, so no duel stalls.
- **Winning:** reduce the Regent to 0 life. Lose all of yours and the court
  keeps you.

## Controls

- **Click** a card to play it, or press **1–7** for the cards in your hand.
- **E** or **Space** ends your turn; click the End Turn button works too.
- **R** starts a new duel from the win or loss screen. **M** mutes the sound.

## Running it

```sh
node serve.ts          # serves game/ at http://localhost:8080
```

Open the page in desktop Chrome and play. All art is drawn on canvas and all
sound is synthesized in the browser — no network requests, no assets.

## Handing it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, standard library only) copies `game/` and `screenshots/`
to the output directory and writes `dossier.json` with the kit's vendored
library. Run it twice and the output is byte-identical.

## Layout

- `game/index.html` — the page; `game/src/main.js` boots the game.
- `game/src/config.js` — table, card and layout constants.
- `game/src/cards.js` — the twelve cards and the deck recipe.
- `game/src/world.js` — the table state and the rules.
- `game/src/ai.js` — the Regent's choices and the screenshot autopilots.
- `game/src/render.js` — everything the table shows, drawn on canvas.
- `game/src/audio.js` — procedural WebAudio effects.
- `game/src/input.js` — mouse and keyboard, with canvas hit-testing.
- `game/src/shots.js` — the staged screenshot scenes (`?shot=`).
- `main.ts` — the hand-in program; `serve.ts` — the dev server.
- `shots.json` — the four screenshots and the scene each one shows.
