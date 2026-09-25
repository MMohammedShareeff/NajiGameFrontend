(function () {
  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[character]));
  }

  function linkClass(path) {
    return window.location.pathname.endsWith(path) ? "navbar__link is-active" : "navbar__link";
  }

  function navbarTemplate(isLoggedIn, hasRoom, isGuest, username) {
    const invitesControl = isLoggedIn && !isGuest
      ? `
        <div class="invites">
          <button type="button" class="invites__toggle" id="navbar-invites">
            Invites
            <span class="invites__badge" id="navbar-invites-badge" hidden>0</span>
          </button>
          <div class="invites__panel" id="navbar-invites-panel" hidden></div>
        </div>
      `
      : "";

    const userChip = isLoggedIn && username
      ? `<span class="navbar__user"><span class="dot"></span>${escapeHtml(username)}</span>`
      : "";

    const isArabic = window.Naji.i18n && window.Naji.i18n.language === "ar";
    const languageToggle = window.Naji.i18n
      ? `<button type="button" class="lang-toggle" id="navbar-lang" aria-label="Language">${isArabic ? "English" : "العربية"}</button>`
      : "";

    const authAction = isLoggedIn
      ? '<button type="button" class="btn btn-danger btn-sm" id="navbar-logout">Logout</button>'
      : '<a class="btn btn-primary btn-sm" href="/pages/login.html">Sign In</a>';

    const roomLink = hasRoom
      ? `<li><a class="${linkClass("/pages/game.html")}" href="/pages/game.html">Room</a></li>`
      : "";

    const accountLinks = isGuest
      ? ""
      : `
        <li><a class="${linkClass("/pages/friends.html")}" href="/pages/friends.html">Friends</a></li>
        <li><a class="${linkClass("/pages/dashboard.html")}" href="/pages/dashboard.html">Dashboard</a></li>
        <li><a class="${linkClass("/pages/profile.html")}" href="/pages/profile.html">Profile</a></li>
      `;

    const protectedLinks = isLoggedIn
      ? `
        <li><a class="${linkClass("/pages/lobby.html")}" href="/pages/lobby.html">Lobby</a></li>
        ${roomLink}
        ${accountLinks}
      `
      : "";

    const homeActive = window.location.pathname === "/" || window.location.pathname.endsWith("/index.html");

    return `
      <nav class="navbar">
        <div class="navbar__brand">
          <a class="navbar__logo gradient-text" href="/index.html">NAJI</a>
          ${userChip}
        </div>
        <ul class="navbar__links">
          <li><a class="${homeActive ? "navbar__link is-active" : "navbar__link"}" href="/index.html">Home</a></li>
          ${protectedLinks}
        </ul>
        <div class="navbar__actions">
          ${languageToggle}
          ${invitesControl}
          ${authAction}
        </div>
      </nav>
    `;
  }

  function addFooter() {
    if (document.querySelector(".site-footer")) {
      return;
    }
    const footer = document.createElement("footer");
    footer.className = "site-footer";
    footer.innerHTML = `
      <span class="site-footer__status"><span class="dot"></span><b>Naji protocol</b></span>
    `;
    document.body.appendChild(footer);
  }

  function loadNavbar(mountSelector) {
    const mount = document.querySelector(mountSelector);
    if (!mount) {
      return;
    }

    const isLoggedIn = window.Naji.storage.hasValidSession();
    const hasRoom = Boolean(window.Naji.storage.getRoomPasscode());
    const isGuest = isLoggedIn && window.Naji.storage.isGuest();
    const username = isLoggedIn ? window.Naji.storage.getUsername() : "";
    mount.innerHTML = navbarTemplate(isLoggedIn, hasRoom, isGuest, username);
    addFooter();

    const languageButton = document.getElementById("navbar-lang");
    if (languageButton) {
      languageButton.addEventListener("click", () => window.Naji.i18n.toggleLanguage());
    }

    if (isLoggedIn && !isGuest && window.Naji.invites && window.Naji.invite) {
      window.Naji.invites.init();
    }

    if (isLoggedIn) {
      document.getElementById("navbar-logout").addEventListener("click", () => {
        window.Naji.storage.clearToken();
        window.Naji.storage.clearUsername();
        window.location.href = "/index.html";
      });
    }
  }

  window.Naji = window.Naji || {};
  window.Naji.dom = { loadNavbar, escapeHtml };
})();
