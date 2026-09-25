# Naji Frontend — Ticket Board

Stack: **Vue 3 via CDN** (no build step), plain CSS, native `fetch`, STOMP over WebSocket for live updates.
Work top to bottom — each ticket produces something you can open in a browser and click through before moving to the next.


Note: no comments anywhere in the code unless asked otherwise.
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

- Hero section: NAJI logo art (placeholder image is fine for now), headline, description, "Play Now" button linking to the lobby (which sends signed-out visitors to sign in).
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

## FE-13: Guest mode  (DONE)
**Goal:** play without creating an account.

- Backend: `POST /player/guest?name=` creates a throwaway player (optional nickname, random `Guest-NNNN` otherwise, suffix added if the name is taken) and returns a JWT carrying `guest: true`.
- Guests can create and join rooms and play; they can't edit an account, and Dashboard/Profile are hidden and guarded for them.
- "Play as guest" with an optional nickname on the login page.

---

## FE-14: Player-to-player game invites  (DONE)
- Backend: `InviteController` / `InviteService` (Redis, 10 minute expiry): send, list mine, accept, decline; a private `/user/queue/invites` push per player.
- Rules: only registered players send or receive invites; the sender must be in the room; no duplicates, self-invites, full or closed rooms; accepting while still in another room is refused.
- Frontend: "Send invite" box in the game page player panel (registered players, before a game starts); navbar "Invites" button with a live badge and Accept/Decline panel on every page; a toast on arrival; a confirmation popup when accepting while already in another room.

---

## FE-15: Room lifecycle and game continuity  (DONE)
**Goal:** rooms and games behave sensibly when people join, leave, refresh or walk away.

- Live players list over `/topic/room/{id}/players` (join, kick, leave, host change) with toasts; kicked players are told.
- Leave room (host role passes on, last player closes the room), End game (closes the room for everyone), both behind a confirmation popup; kick bug fixed.
- `GET /game/state` restores round, timer, submitted state, results overlay, final popup and leaderboard after a refresh or a trip to another tab; unsent answer drafts survive in session storage.
- Live "Answers in" panel with per-player submit times (`/topic/room/{id}/submissions`).
- "Already in a room" popup in the lobby when creating or joining another room.
- Board hidden until the host starts the game; final popup offers Play again / Leave room.

---

## FE-16: Account security and forms  (DONE)
- Show/hide password, caps-lock warning, live rule checklist, confirm-password on sign up, profile and reset.
- Forgot-password page (`PUT /player/reset-password` fixed on the backend).
- Profile changes send a code to the current email; changing the email also needs a second code sent to the new address (`POST /verification/verify-update`). Codes are case-sensitive and single-use.

---

## FE-17: Multiple simultaneous games  (DONE, backend)
- `GameService` is now a single shared bean. Per-room state (running flag, round state, submissions, results, timers) is keyed by room id; nothing per-room lives in instance fields any more.
- One scheduler pool (8 threads) serves all rooms, and a per-room lock stops a timer and an early finish from judging the same round twice.
- Verified with two rooms playing all 5 rounds at once: each room got only its own results, leaderboard and final standings.

---

## FE-18: Guest account cleanup  (DONE, backend)
- New `player.created_at` column (migration V6) and an hourly `GuestCleanupJob`.
- Deletes guests older than `GUEST_RETENTION_HOURS` (default 48, longer than the 24 hour token life) that are not in any room and not a room admin, along with their submissions, scores and dashboard rows. Registered players are never touched.
- Schedule and retention are configurable with `GUEST_CLEANUP_CRON` and `GUEST_RETENTION_HOURS`.
- Verified against a database with 29 guests (all backdated): 21 purged, the 8 still in rooms kept, registered players untouched.

---

## FE-19: Scenario variety and AI rating  (DONE)
- Every game now plays a themed arc: round 1 real-world emergency, 2 comedy (absurd or awkward), 3 imagination (fantasy, sci-fi or monsters), 4 surreal or impossible, 5 epic finale or wild mash-up. The theme inside each slot is picked at random, so no two games match.
- Scenarios are one or two vivid sentences (up to 35 words) instead of ten words, and the AI is shown the last few scenarios in the room to avoid repeats.
- The round message and game state carry a `theme` label, not shown on screen (kept for future use).
- Rating rubric rewritten for a party game: funny or wildly imaginative plans get at least 6, funny and clever 8 to 10, smart practical 7 to 9, ordinary sincere 5 to 6, lazy or vague 2 to 4. Checked with real AI calls: a sensible plan 8, a funny plan 8, "idk i walk" 3.
- Scoring rules make the story match the rating (survived plans get survived stories) and give the benefit of the doubt: sheltering, hiding somewhere safe, or asking for help scores 6 or more.
- Plans that make no real attempt (crying, giving up, doing nothing, "idk") must score exactly 0.
- If the timer is about to run out (2 seconds left) and the player wrote something but did not press Send, the game page sends the text automatically.
- Scenarios are written in simple everyday English (about B1 level: common words, short sentences, no slang or fancy words), at most 30 words.
- Still open if wanted later: a configurable survive threshold and moving the AI model name into an environment variable.

---

## FE-20: Email delivery for development  (DONE)
- `docker-compose.mail.yaml` adds a Mailpit container (web inbox on http://localhost:8025, SMTP on 1025) and points the app at it. Start it with `docker compose -f docker-compose.yaml -f docker-compose.mail.yaml up -d --build app mailpit`; leave the override out to use the real SMTP settings again.
- Fixed a real bug found on the way: the sender was the invalid address `najiGame`, which strict SMTP servers reject. It is now `SPRING_MAIL_USERNAME` (or `NAJI_MAIL_FROM`, or `noreply@naji.local`).
- Verified: register, code email, verify and login; password reset email; all landing in Mailpit.

---

## FE-21: Backend hardening  (DONE)
- Only register, login, guest, reset-password, verify-email and health/swagger are public; all else needs a token.
- `POST /room/add-player` joins as the caller; `GET /room/get-players|room-id|admin` need the caller to be in that room (403 otherwise).
- Dashboards, account reads and account deletion are owner-only; `GET /player/all` and `GET /Submission/by-id` are gone.
- Kick, start and stop role rules apply (the permit-all that shadowed them is gone).
- Login lockout (10 failures, 10 minutes), verification-code attempt limit (5 tries), and per-IP rate limits on register (10 / 10 min), reset-password (5), guest (30) and verify-email (20), answering 429.

---

## FE-22: Friends list  (DONE)
- Backend: `friend` table (migration V7); `GET /friends`, `POST /friends/add?userName`, `DELETE /friends/{userName}`. Registered players only, one-way (adding someone does not add you to their list), duplicates, self and guests refused.
- Frontend: Friends page with add and remove, a "Friends" navbar link, and on the game page a friends list with a one-click Invite button (greyed "In room" for players already there) plus "Add to friends" next to the manual username box.

---

## FE-23: Deployment preparation  (DONE, hosting steps pending)
Goal: run the game online for a small public group at about $0 with no domain (approved plan).
- AI cost: a scenario bank (100 starter scenarios in the database, rotated least-used first, topped up daily by the AI) and one batched judging call per round. A whole game went from about 30 AI calls to about 5. Calls are size-limited (`max_tokens`), and a host can start `GAME_DAILY_LIMIT` games a day.
- Production safety: no tokens or verification codes in logs, quiet logging and no SQL output in the `prod` profile, swagger off, CORS and WebSocket origins limited to `CORS_ALLOWED_ORIGINS`, real client IP behind the proxy for rate limits, Redis password support.
- Frontend uses the same address as the page when not on a local dev port, so no code change is needed to move it.
- `NajiGameBackend/deploy/`: `docker-compose.prod.yaml` (app, Postgres, Redis, Caddy with automatic HTTPS), `Caddyfile`, `.env.example`, `backup.sh` and a step-by-step `README.md`.
- Verified locally with the production stack behind Caddy: pages, API, WebSocket, a full game, rate limiting per client, CORS rejection of other origins, no published database or Redis ports, clean logs, restart recovery.
- Still to do by hand: create the server, the DuckDNS name, real keys and the mail account, then follow `deploy/README.md`.

---

### Notes for whoever picks up a ticket
- No backend endpoint paths above are guaranteed exact — the backend context file lists what's known and what needs a quick check against the controller source before wiring a call.
- Keep `js/api/client.js`'s base URL as the *only* place the backend host is hardcoded, so switching between local Docker and anything else later is a one-line change.
## FE-24: UI refactor to the terminal theme (DONE)

Dark CRT look across every page: tokens and shared pieces in `css/base.css` and `css/components.css`, corner-bracket `.panel`/`.card`, `[ BRACKET ]` primary buttons, active navbar link, username chip and an automatic footer bar (`js/utils/dom.js`). All existing screens and behaviour are kept; only markup and CSS changed. Cache suffix is now `20260925a`.

## FE-25: Arabic support (DONE)

Interface language switch (English / Arabic) with right-to-left layout in `js/i18n/*` and `css/rtl.css`. Backend: `lang` parameter on `/game/start`, `scenario_bank.lang` (V9 with 100 Arabic scenarios), Arabic scenario and judging prompts (`GameLanguage`, `OpenAiService`, `RoundService`). Backend error messages and AI failure reasons that are not in `ar.js` stay in English.
