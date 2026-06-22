# Congestion Reward Simulator

A dashboard for simulating reward-based congestion pricing on a single road corridor. Built for the MTSAi take-home assignment.

## Stack

- **Backend:** Node.js + Express
- **Frontend:** React (Vite)
- **Styling:**  CSS, no framework
- **Chart:** Chart.js (used only for the volume chart, per the assignment's allowance)
- **Data:** `seed-data.json`, no database

## How to Run

### Backend

```bash
cd backend
npm install
node server.js
```

Runs on `http://localhost:3001`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:5173`. Open this in your browser. The backend must be running first, since the frontend fetches seed data and config from it on load.

## Key Design Decisions

**Calculation logic lives entirely in `backend/calculator.js`.** This file has no Express, HTTP, or JSON-handling code — it's pure functions that take volumes and config and return numbers. `server.js` only handles routing, validation, and shaping responses. This separation means the data source could become a database or live feed later without touching the math.

**The shift endpoint follows the spec literally.** Volume is moved from the single most-congested hour to the single least-congested hour — one source, one destination, identified by finding the highest and lowest values in the volumes array. Spreading the shift across multiple off-peak hours would be closer to how a real incentive program works, but the spec is explicit about a single hour pair. A multi-hour distribution is noted under "What I'd Do With More Time."

**Moved vehicles are rounded to whole numbers** (`Math.round(volumes[peakIdx] * shiftPercent / 100)`), since fractional vehicles aren't meaningful. This means very small shift percentages on already-low-volume hours can round to zero vehicles moved — the UI reflects this rather than hiding it.

**All currency values are rounded to 2 decimal places** server-side, using a shared `round2()` helper, so the frontend never has to deal with floating-point artifacts like `$8.400000000001`.

**State lives entirely in `App.jsx`.** All child components are presentational — they receive data and callbacks as props and never call `fetch()` themselves. This keeps the data flow predictable: one source of truth, one place where API calls happen.

**The `/shift` endpoint returns both baseline and shifted results in a single response**, rather than requiring two separate calls, since the frontend always needs both to render the comparison view.

**Status badges (toll / reward / neutral)** are computed in the backend and included in each hour's result object, rather than re-derived in the frontend from raw ratios. This keeps the "what counts as toll vs reward" logic in one place.

**Stretch goal chosen: live-updating shift slider + flipped-hour highlighting.** Dragging the slider re-calls `/shift` on every change and updates the comparison instantly. The hourly table also highlights any row where the status (toll/reward/neutral) changed between baseline and shifted scenarios, with a toll/reward delta shown per row. I treated this as one combined stretch goal since both pieces are part of the same comparison feature.

## Assumptions Made

- `underThreshold` must be strictly between 0 and 1 (exclusive). A value of exactly 1 would mean every hour under capacity gets a reward, which seemed unintended.
- `capacity` and `baseRate` must be positive numbers; zero or negative values are rejected at the API level.
- Volumes must be non-negative integers; the array must contain exactly 24 values, one per hour, with index 0 representing midnight as specified.
- When multiple hours tie for peak or quietest, the implementation picks the first occurrence in array order (hour 0 wins ties). This wasn't specified and is a reasonable default.
- The shift always moves volume from the single peak hour to the single quietest hour, even if they're adjacent or otherwise unusual — no special-casing was added for edge cases like the peak and quiet hour being the same (which can only happen with constant volumes across the day).


## What I'd Do With More Time

- **Multi-hour shift distribution:** spread shifted volume across several of the least-congested hours proportionally, rather than dumping it all into a single hour — closer to how a real incentive program would actually redistribute demand.
- **Debounce the shift slider** so it doesn't fire a network request on every single pixel of drag, only after the user pauses.


## Use of AI Tools


I used Claude (Anthropic) as a coding assistant throughout this project.

**Architecture and structure** — I designed the overall project structure, including the decision to keep all mathematical logic in a dedicated `calculator.js` module fully separated from the Express routing layer. I used Claude to help implement that structure once the design was decided, specifically for `calculator.js` and `server.js`.

**Understanding the model** — I used Claude to walk through the BPR-style formula with concrete examples from the seed data before writing any code, to make sure I understood what each calculation was producing and why.

**React components** — Claude generated the initial implementation of the React components based on the architecture I laid out. I reviewed every function and understood what it was doing before incorporating it.

**CSS and layout** — Claude generated the CSS. I reviewed it, corrected alignment issues, and adjusted spacing decisions to match the layout I wanted.

**Edge cases and testing** — I used Claude to think through edge cases (zero base rate, volumes at exactly the threshold boundary, shift percentage of 0 or 100) and understand how the validation and calculations would behave under those inputs.

I am prepared to explain and extend any part of the code in a live session.
