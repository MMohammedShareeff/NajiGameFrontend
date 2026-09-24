(function () {
  function navbarTemplate(isLoggedIn, hasRoom, isGuest) {
    const authAction = isLoggedIn
      ? '<button type="button" class="btn btn-danger" id="navbar-logout">Logout</button>'
      : '<a class="btn btn-primary" href="/pages/login.html">Sign In</a>';

    const roomLink = hasRoom
      ? '<li><a class="navbar__link" href="/pages/game.html">Room</a></li>'
      : "";

    const accountLinks = isGuest
      ? ""
      : `
        <li><a class="navbar__link" href="/pages/dashboard.html">Dashboard</a></li>
        <li><a class="navbar__link" href="/pages/profile.html">Profile</a></li>
      `;

    const protectedLinks = isLoggedIn
      ? `
        <li><a class="navbar__link" href="/pages/lobby.html">Lobby</a></li>
        ${roomLink}
        ${accountLinks}
      `
      : "";

    return `
      <nav class="navbar">
        <a class="navbar__logo gradient-text" href="/index.html">NAJI</a>
        <ul class="navbar__links">
          <li><a class="navbar__link" href="/index.html">Home</a></li>
          ${protectedLinks}
          <li><a class="navbar__link" href="#">Contact</a></li>
        </ul>
        <div class="navbar__actions">
          ${authAction}
        </div>
      </nav>
    `;
  }

  function loadNavbar(mountSelector) {
    const mount = document.querySelector(mountSelector);
    if (!mount) {
      return;
    }

    const isLoggedIn = window.Naji.storage.hasValidSession();
    const hasRoom = Boolean(window.Naji.storage.getRoomPasscode());
    const isGuest = isLoggedIn && window.Naji.storage.isGuest();
    mount.innerHTML = navbarTemplate(isLoggedIn, hasRoom, isGuest);

    if (isLoggedIn) {
      document.getElementById("navbar-logout").addEventListener("click", () => {
        window.Naji.storage.clearToken();
        window.Naji.storage.clearUsername();
        window.location.href = "/index.html";
      });
    }
  }

  window.Naji = window.Naji || {};
  window.Naji.dom = { loadNavbar };
})();
