# Naji Frontend — Ticket Board

Stack: **Vue 3 via CDN** (no build step), plain CSS, native `fetch`, STOMP over WebSocket for live updates.
Work top to bottom — each ticket produces something you can open in a browser and click through before moving to the next.


#Note that i do not need you to write comments anywhere in the code unless i said the opposite.
---

## FE-0: Project scaffold + design system
**Goal:** empty shell that loads Vue and shows the color/type system, nothing functional yet.

- Create the folder structure:
  ```
  NajiGameFrontend/
    index.html
    pages/ (login.html, lobby.html, game.html, dashboard.html)
    css/base.css, css/components.css, css/pages/*.css
    js/api/, js/ws/, js/pages/, js/utils/
    assets/images/, assets/icons/
  ```
- `css/base.css`: CSS variables for the theme — dark background (`#16241f`-ish), teal-to-green gradient accent (`#2d9d8f` → `#3ecf8e`), white card background, pixel/display font for headings (Google Fonts: "Press Start 2P" or similar), body font for readable text.
- `index.html`: loads Vue 3 from CDN, includes `base.css`, shows a placeholder `<div id="app">Naji loading...</div>` driven by a tiny Vue app that just proves Vue is wired up.
- Navbar component (logo, Home / Dashboard / Contact links, Sign In / Logout button that swaps based on a fake "logged in" flag) — static for now, matches the screenshots.

**Done when:** you open `index.html` in a browser, see the dark theme, the navbar, and a Vue-rendered placeholder.

---

## FE-1: API client
**Goal:** one place that talks to the backend; nothing visual.

- `js/api/client.js`: wraps `fetch`. Reads backend base URL from a constant at the top of the file (e.g. `http://localhost:8080`). Attaches `Authorization: Bearer <token>` from storage automatically when a token exists. Throws a normalized error object `{status, message}` on non-2xx responses (parses the backend's JSON error body).
- `js/utils/storage.js`: `saveToken`, `getToken`, `clearToken`, plus the same for "current room pass code" and "logged-in username."
- `js/api/auth.js`: `register(payload)`, `login(payload)`, calling the real `/player/...` endpoints (confirm exact paths against your `PlayerController` before wiring — see the backend context file).

**Done when:** you can call `login()` from the browser console and see a token get stored, or a clean error object on a bad password.

---

## FE-2: Home / Landing page
**Goal:** the page in your first screenshot, fully static.

- Hero section: NAJI logo art (placeholder image is fine for now), headline, description, "Register Today!" button linking to the auth page.
- Navbar from FE-0, reused via a small include pattern (a `loadNavbar()` JS helper that injects the same HTML into every page, since there's no build step for real components yet).

**Done when:** the landing page matches the theme and the button navigates to `pages/login.html`.

---

## FE-3: Auth page (Sign Up / Login)
**Goal:** the card from your second screenshot, wired to FE-1's `auth.js`.

- Tab toggle between Sign Up and Login (pure Vue `data()` state, no page reload).
- Login form: username + password → calls `login()` → on success, stores the token and redirects to `pages/lobby.html`. On failure, shows the error message inline (no `alert()`).
- Sign Up form: whatever fields your `/player/register` endpoint needs (username, email, password at minimum) → calls `register()` → on success, switches to the Login tab with a "check your email to verify" message if your backend requires email verification.
- Basic client-side validation: empty fields, password length — just enough to avoid obviously bad requests.

**Done when:** you can register a real account against your running backend and log in with it.

---

## FE-4: Route guard + navbar auth state
**Goal:** pages know whether someone is logged in.

- `js/utils/auth-guard.js`: a function each protected page calls on load — if no token, redirect to `login.html`.
- Navbar shows "Sign In" when logged out, "Logout" (red, like your screenshot) when logged in; Logout clears storage and redirects home.

**Done when:** visiting `lobby.html` directly with no token bounces you to login; logging in and clicking Logout bounces you back.

---

## FE-5: Room lobby (join / create)
**Goal:** the screen from your third screenshot.

- `js/api/room.js`: `createRoom()`, `joinRoom(passCode)`, calling your `/room/...` endpoints.
- Lobby page: "Join a Room" card (code input + Join button) and "Create Room" button, styled as in the screenshot.
- On successful create/join, store the room pass code and redirect to `pages/game.html`.
- Show the backend's error inline if a room code doesn't exist or a room is full — whatever your backend actually enforces.

**Done when:** two browser tabs (or one normal + one incognito) can join the same room by code.

---

## FE-6: WebSocket connection
**Goal:** live connection to the backend, no UI yet.

- `js/ws/socket.js`: wraps STOMP-over-WebSocket (STOMP.js from CDN, same idea as Vue — no build step). Exposes `connect(token)`, `subscribe(topic, callback)`, `disconnect()`.
- Confirm the exact topic paths against `WebSocketController.java` (see backend context file) — likely something like `/topic/room/{roomId}/updates`, `/topic/room/{roomId}/round`, `/topic/room/{roomId}/leaderboard`, `/topic/room/{roomId}/final_leaderboard`.
- On the lobby page, subscribe to the room's `updates` topic and log incoming messages to the console as a smoke test.

**Done when:** starting a game from the backend (or Postman) prints a message in the browser console.

---

## FE-7: Game screen — shell
**Goal:** the layout from your fourth screenshot, static data first.

- Three-column layout: Players (left), Scenario + answer box (center), Leaderboard (right).
- Wire the WebSocket subscriptions from FE-6: scenario text updates when a round starts, leaderboard list updates when scores come in.
- Player list: shown from the room data fetched on page load (not necessarily live yet).

**Done when:** starting a game updates the scenario text on screen in real time, using your real backend.

---

## FE-8: Game screen — submitting an answer
**Goal:** the textarea + Send button actually work.

- `js/api/game.js`: `submitAnswer(text)` calling your `/Submission/...` endpoint.
- Disable the input after sending (your backend only accepts one answer per round per player) and show a "waiting for other players..." state until the round ends.
- Handle the "round has ended" / "already answered" errors from the backend with a clear inline message instead of a raw error.

**Done when:** you can play a full round end-to-end: see scenario, type an answer, submit, and see the leaderboard update afterward.

---

## FE-9: Room admin controls
**Goal:** the room creator can start the game and manage players.

- Show a "Start Game" button only to the room admin (compare logged-in username to the room's admin from the API response).
- Wire it to `/game/start`.
- Optional: kick-player button next to each name in the player list, admin-only, wired to your kick endpoint.
- Handle and display the "AI service unavailable" style errors your backend now sends — these should show as a clear banner, not a silent failure.

**Done when:** the admin can start a game from the lobby and everyone in the room sees round 1 begin.

---

## FE-10: Dashboard page
**Goal:** player stats page.

- Fetch and display whatever `/dashboard/...` returns for the logged-in player: games played/won/lost/drawn, win streak, highest score, average score per round.
- Simple stat cards, matching the theme.

**Done when:** playing a game and revisiting the dashboard shows updated numbers.

---

## FE-11: Polish pass
**Goal:** things that make it feel finished, done last on purpose.

- A shared toast/notification component instead of scattered inline error `<div>`s.
- Loading spinners on buttons during API calls (disable double-submits).
- Mobile-friendly check on the three-column game screen (stack columns on narrow widths).
- 404 / "room not found" / "session expired" friendly states.

---

## FE-12: Player profile page
**Goal:** logged-in players can view and edit their account info.

- New protected page (e.g. `pages/profile.html`), linked from the navbar alongside Lobby/Dashboard (same logged-in-only pattern established in FE-4).
- Fetch and display the current player's info (username, email).
- Edit form wired to `PUT /player/update` (confirmed real endpoint on `PlayerController` — takes `userName`/`email`/`password`). Note: `PlayerServiceImpl.updatePlayer` re-triggers email verification on update, same two-step flow as registration — the UI needs to account for that, not assume an instant save.
- Basic validation matching what the register/login forms already enforce.

**Done when:** a player can submit a profile change and, after verifying via the emailed code, see it reflected.

---

## FE-13: Guest mode
**Goal:** play without creating an account, using temporary local state instead of a real login.

- **Needs scoping before implementation** — the backend currently has no concept of a guest/anonymous player. Room joining, submissions, and the leaderboard all key off a real authenticated `Player` row with a DB id. Guest mode needs either real backend support for ephemeral players, or a frontend-only illusion (silently auto-registering a throwaway account behind the scenes). Don't assume either approach — this needs a design decision when picked up, not a guess.
- Once scoped: a "Play as Guest" entry point on the auth page, storing a temporary display name client-side, skipping the login form for casual play.

**Done when:** TBD, pending the scoping decision above.

---

## FE-14: Player-to-player game invites
**Goal:** logged-in players can invite each other to a room directly on the platform, instead of only sharing a room code out-of-band.

- **Needs scoping before implementation** — this is entirely new backend surface, not just a frontend gap. Nothing in the current API supports looking up other players to invite, sending/receiving an invite, or notifying someone in real time that they've been invited. At minimum this needs: a way to find another player (by username/email — decide what's searchable and what isn't), an invite/notification data model, REST endpoints to send/accept/decline, and likely a new WebSocket topic (per-player, not per-room like everything else so far) to deliver the invite live.
- Depends on **FE-12** existing first (need a real profile identity to invite *to*) and probably benefits from a notification-center-style UI element, not just a modal.

**Done when:** TBD, pending backend scoping above.

---

### Notes for whoever picks up a ticket
- No backend endpoint paths above are guaranteed exact — the backend context file lists what's known and what needs a quick check against the controller source before wiring a call.
- Keep `js/api/client.js`'s base URL as the *only* place the backend host is hardcoded, so switching between local Docker and anything else later is a one-line change.