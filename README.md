# Naji: Frontend

The web client for **Naji**, an online multiplayer survival game. Players join a room, get a survival scenario every round, write how they would survive and get scored by an AI judge over five rounds.

The API is in the sibling repo `NajiGameBackend`.

## Screens

Home, login and sign up (with email code and guest play), forgot password, lobby, game room (players, scenario, timer, answers, results, leaderboard, final table), friends, dashboard, profile, and invites in the navbar.

## Highlights

- Dark terminal look: scanline buttons, bracket panels, pixel titles
- English and Arabic with right-to-left layout; the switch is in the navbar and the scenario follows each player's language
- Live updates over WebSockets; the round timer is display only and is seeded from the server
- No build step and no npm: Vue 3 loaded from a CDN, plain CSS and plain scripts sharing a global `window.Naji`

## Run it locally

1. Start the backend (see the backend README). It listens on http://localhost:8080.
2. Serve this folder with any static server on a non-standard port, for example:

   ```
   python -m http.server 5500
   ```

3. Open http://localhost:5500

On local ports the client talks to `http://localhost:8080`. On any other address it calls the same origin as the page, which is how production works behind the Caddy server from the backend `deploy` folder.

## Structure

```
index.html, 404.html
pages/    login, forgot-password, lobby, game, friends, dashboard, profile
css/      base.css (theme tokens), components.css, rtl.css, pages/*.css
js/api/   fetch wrapper and one file per API area
js/ws/    SockJS and STOMP wrapper
js/i18n/  language engine and the Arabic dictionary
js/utils/ storage, navbar, toasts, invites panel, auth guard
assets/   images
```

## Adding text

New interface text needs an entry in `js/i18n/ar.js` (keyed by the exact English text), otherwise it shows in English for Arabic users. After changing scripts or styles, raise the `?v=` number on the script and link tags so browsers do not keep old files.

## Deploy

Served as static files by the Caddy container described in `NajiGameBackend/deploy/README.md`. No build is needed.
