(function () {
  function send(passCode, userName) {
    const query = new URLSearchParams({ passCode, userName });
    return window.Naji.apiClient.post(`/invite/send?${query}`);
  }

  function mine() {
    return window.Naji.apiClient.get("/invite/mine");
  }

  function accept(inviteId) {
    return window.Naji.apiClient.post(`/invite/${encodeURIComponent(inviteId)}/accept`);
  }

  function decline(inviteId) {
    return window.Naji.apiClient.post(`/invite/${encodeURIComponent(inviteId)}/decline`);
  }

  window.Naji = window.Naji || {};
  window.Naji.invite = { send, mine, accept, decline };
})();
