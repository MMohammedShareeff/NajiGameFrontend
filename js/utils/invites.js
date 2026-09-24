(function () {
  const SOCKJS_URL = "https://cdn.jsdelivr.net/npm/sockjs-client@1/dist/sockjs.min.js";
  const STOMP_URL = "https://cdn.jsdelivr.net/npm/@stomp/stompjs@7/bundles/stomp.umd.min.js";
  const PRUNE_INTERVAL_MS = 30000;

  let invites = [];
  let client = null;
  let pruneTimerId = null;
  let elements = null;

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Could not load ${src}`));
      document.head.appendChild(script);
    });
  }

  async function ensureLibraries() {
    if (!window.SockJS) {
      await loadScript(SOCKJS_URL);
    }
    if (!window.StompJs) {
      await loadScript(STOMP_URL);
    }
  }

  function notify(kind, message) {
    if (window.Naji.toast) {
      window.Naji.toast[kind](message);
    }
  }

  function toInvite(payload) {
    return {
      id: payload.id,
      from: payload.from,
      passCode: payload.passCode,
      expiresAt: Date.now() + payload.secondsLeft * 1000
    };
  }

  function upsert(invite) {
    invites = invites.filter((existing) => existing.id !== invite.id);
    invites.unshift(invite);
  }

  function removeInvite(inviteId) {
    invites = invites.filter((invite) => invite.id !== inviteId);
    render();
  }

  function pruneExpired() {
    const before = invites.length;
    invites = invites.filter((invite) => invite.expiresAt > Date.now());
    if (invites.length !== before) {
      render();
    }
  }

  function minutesLeft(invite) {
    return Math.max(1, Math.ceil((invite.expiresAt - Date.now()) / 60000));
  }

  function buildItem(invite) {
    const item = document.createElement("div");
    item.className = "invites__item";

    const text = document.createElement("p");
    text.className = "invites__text";
    const from = document.createElement("strong");
    from.textContent = invite.from;
    text.append(from, ` invited you to ${invite.passCode}`);

    const meta = document.createElement("span");
    meta.className = "invites__meta";
    meta.textContent = `Expires in about ${minutesLeft(invite)} min`;

    const actions = document.createElement("div");
    actions.className = "invites__actions";

    const accept = document.createElement("button");
    accept.type = "button";
    accept.className = "btn btn-primary invites__btn";
    accept.textContent = "Accept";

    const decline = document.createElement("button");
    decline.type = "button";
    decline.className = "btn btn-secondary invites__btn";
    decline.textContent = "Decline";

    accept.addEventListener("click", () => {
      accept.disabled = true;
      decline.disabled = true;
      acceptInvite(invite).finally(() => {
        accept.disabled = false;
        decline.disabled = false;
      });
    });
    decline.addEventListener("click", () => declineInvite(invite));

    actions.append(accept, decline);
    item.append(text, meta, actions);
    return item;
  }

  function render() {
    if (!elements) {
      return;
    }

    elements.badge.textContent = String(invites.length);
    elements.badge.hidden = invites.length === 0;
    elements.panel.replaceChildren();

    if (invites.length === 0) {
      const empty = document.createElement("p");
      empty.className = "invites__empty";
      empty.textContent = "No invites right now.";
      elements.panel.appendChild(empty);
      return;
    }

    invites.forEach((invite) => elements.panel.appendChild(buildItem(invite)));
  }

  async function refresh() {
    try {
      const pending = await window.Naji.invite.mine();
      invites = pending.map(toInvite);
      render();
    } catch (error) {
      return;
    }
  }

  async function findActiveRoom() {
    const passCode = window.Naji.storage.getRoomPasscode();
    if (!passCode) {
      return "";
    }

    try {
      const players = await window.Naji.apiClient.get(`/room/get-players?passCode=${encodeURIComponent(passCode)}`);
      if (players.some((player) => player.userName === window.Naji.storage.getUsername())) {
        return passCode;
      }
    } catch (error) {
      if (error.status === 0) {
        return passCode;
      }
    }

    window.Naji.storage.clearRoomPasscode();
    return "";
  }

  async function leaveRoom(passCode) {
    try {
      await window.Naji.apiClient.post(`/room/leave?passCode=${encodeURIComponent(passCode)}`);
    } catch (error) {
      if (error.status !== 400 && error.status !== 404) {
        throw error;
      }
    }
    window.Naji.storage.clearRoomPasscode();
  }

  function confirmSwitch(currentRoom, targetRoom) {
    return new Promise((resolve) => {
      const backdrop = document.createElement("div");
      backdrop.className = "invite-dialog-backdrop";

      const dialog = document.createElement("div");
      dialog.className = "card invite-dialog";
      dialog.setAttribute("role", "dialog");
      dialog.setAttribute("aria-modal", "true");

      const title = document.createElement("h2");
      title.textContent = "You're already in a room";

      const body = document.createElement("p");
      body.textContent = `You're currently in ${currentRoom}. Leave it to join ${targetRoom}, or stay where you are.`;

      const actions = document.createElement("div");
      actions.className = "invite-dialog__actions";

      const stay = document.createElement("button");
      stay.type = "button";
      stay.className = "btn btn-secondary";
      stay.textContent = "Stay in my room";

      const leave = document.createElement("button");
      leave.type = "button";
      leave.className = "btn btn-danger";
      leave.textContent = "Leave and join";

      const finish = (decision) => {
        backdrop.remove();
        resolve(decision);
      };
      stay.addEventListener("click", () => finish(false));
      leave.addEventListener("click", () => finish(true));

      actions.append(stay, leave);
      dialog.append(title, body, actions);
      backdrop.appendChild(dialog);
      document.body.appendChild(backdrop);
    });
  }

  async function acceptInvite(invite) {
    try {
      const activeRoom = await findActiveRoom();
      if (activeRoom && activeRoom !== invite.passCode) {
        const shouldSwitch = await confirmSwitch(activeRoom, invite.passCode);
        if (!shouldSwitch) {
          return;
        }
        await leaveRoom(activeRoom);
      }

      const passCode = await window.Naji.invite.accept(invite.id);
      window.Naji.storage.saveRoomPasscode(passCode);
      window.location.href = "/pages/game.html";
    } catch (error) {
      notify("error", error.message || "Unable to accept that invite.");
      if (error.status === 400 || error.status === 404) {
        removeInvite(invite.id);
      }
    }
  }

  async function declineInvite(invite) {
    try {
      await window.Naji.invite.decline(invite.id);
    } catch (error) {
      if (error.status !== 400) {
        notify("error", error.message || "Unable to decline that invite.");
        return;
      }
    }
    removeInvite(invite.id);
  }

  function handleIncoming(payload) {
    const invite = toInvite(payload);
    upsert(invite);
    render();
    notify("info", `${invite.from} invited you to a game. Open Invites to answer.`);
  }

  async function connect() {
    try {
      await ensureLibraries();
    } catch (error) {
      return;
    }

    const wsUrl = `${window.Naji.apiClient.baseUrl}/game-webSocket?token=${encodeURIComponent(window.Naji.storage.getToken())}`;
    client = new StompJs.Client({
      webSocketFactory: () => new SockJS(wsUrl),
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe("/user/queue/invites", (message) => handleIncoming(JSON.parse(message.body)));
        refresh();
      }
    });
    client.activate();
  }

  function togglePanel(event) {
    event.stopPropagation();
    elements.panel.hidden = !elements.panel.hidden;
  }

  async function init() {
    const button = document.getElementById("navbar-invites");
    if (!button) {
      return;
    }

    elements = {
      button,
      badge: document.getElementById("navbar-invites-badge"),
      panel: document.getElementById("navbar-invites-panel")
    };

    button.addEventListener("click", togglePanel);
    document.addEventListener("click", (event) => {
      if (!elements.panel.hidden && !elements.panel.contains(event.target)) {
        elements.panel.hidden = true;
      }
    });

    render();
    await refresh();
    pruneTimerId = setInterval(pruneExpired, PRUNE_INTERVAL_MS);
    connect();
  }

  window.addEventListener("beforeunload", () => {
    if (pruneTimerId) {
      clearInterval(pruneTimerId);
    }
    if (client) {
      client.deactivate();
    }
  });

  window.Naji = window.Naji || {};
  window.Naji.invites = { init };
})();
