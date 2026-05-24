# BOX BATTLE

Mega Man / Hollow Knight battle arena prototype.

Ported over from a Gemini 2.5 Pro in Godot to React + TypeScript + Vite + Zustand

Play the live build here:
👉 **[Live Demo](https://stevencasteel.github.io/BOX-BATTLE/)**

---

## Player Controls

### Default Preset (Preset 1)

- **Move Left / Right**: `A` / `D` or `Left Arrow` / `Right Arrow`
- **Look / Move Up**: `W` or `Up Arrow`
- **Crouch / Move Down**: `S` or `Down Arrow`
- **Jump**: `Space` or `X`
- **Melee Attack**: `C`
- **Dash**: `Z`
- **Determination Heal**: Hold `Move Down` + Press `Jump` (Requires 1 active Heal Charge)

### Alternate Preset (Preset 2)

- **Move Left / Right**: `A` / `D`
- **Look / Move Up**: `W`
- **Crouch / Move Down**: `S`
- **Jump**: `.` (Period)
- **Melee Attack**: `,` (Comma)
- **Dash**: `/` (Slash)
- **Determination Heal**: Hold `Move Down` + Press `Jump` (Requires 1 active Heal Charge)

_Key bindings are fully customizable inside the Options menu._

---

## Technical Architecture

- **Presentation & UI**: React 19, TypeScript 6, Vite 8, Zustand 5
- **Physics Simulation**: Custom 60Hz Semi-Implicit Euler accumulator loop with swept collision checks and corner-nudging
- **Sound Design**: Pure procedural waveform synthesis utilizing native Web Audio API oscillators, filters, and envelope gains (zero external binary audio assets)

---

## Creator

Built by **[Steven Casteel](https://www.stevencasteel.com)** and Gemini Flash 3.5.
