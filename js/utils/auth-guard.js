(function () {
  function requireAuth() {
    const token = window.Naji.storage.getToken();
    if (!token) {
      window.location.href = "/pages/login.html";
      return false;
    }
    return true;
  }

  window.Naji = window.Naji || {};
  window.Naji.authGuard = { requireAuth };
})();
