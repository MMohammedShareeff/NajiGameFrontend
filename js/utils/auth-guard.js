(function () {
  const LOGIN_URL = "/pages/login.html";

  function requireAuth() {
    if (window.Naji.storage.hasValidSession()) {
      return true;
    }

    const hadToken = Boolean(window.Naji.storage.getToken());
    window.Naji.storage.clearSession();
    window.location.href = hadToken ? `${LOGIN_URL}?expired=1` : LOGIN_URL;
    return false;
  }

  function requireAccount() {
    if (!requireAuth()) {
      return false;
    }

    if (window.Naji.storage.isGuest()) {
      window.location.href = "/pages/lobby.html";
      return false;
    }

    return true;
  }

  function handleSessionExpired() {
    window.Naji.storage.clearSession();
    window.location.href = `${LOGIN_URL}?expired=1`;
  }

  window.Naji = window.Naji || {};
  window.Naji.authGuard = { requireAuth, requireAccount, handleSessionExpired };
})();
