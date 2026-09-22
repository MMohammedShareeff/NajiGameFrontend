(function () {
  function navbarTemplate() {
    return `
      <nav class="navbar">
        <a class="navbar__logo gradient-text" href="/index.html">NAJI</a>
        <ul class="navbar__links">
          <li><a class="navbar__link" href="/index.html">Home</a></li>
          <li><a class="navbar__link" href="/pages/dashboard.html">Dashboard</a></li>
          <li><a class="navbar__link" href="#">Contact</a></li>
        </ul>
        <div class="navbar__actions">
          <a class="btn btn-primary" href="/pages/login.html">Sign In</a>
        </div>
      </nav>
    `;
  }

  function loadNavbar(mountSelector) {
    const mount = document.querySelector(mountSelector);
    if (mount) {
      mount.innerHTML = navbarTemplate();
    }
  }

  window.Naji = window.Naji || {};
  window.Naji.dom = { loadNavbar };
})();
