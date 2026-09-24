(function () {
  function getMyDashboard() {
    const playerId = window.Naji.storage.getPlayerId();
    if (playerId === null) {
      return Promise.reject({ status: 401, message: "Your session has expired. Please sign in again." });
    }
    return window.Naji.apiClient.get(`/dashboard/get-by-id/${playerId}`);
  }

  window.Naji = window.Naji || {};
  window.Naji.dashboard = { getMyDashboard };
})();
