(function () {
  function list() {
    return window.Naji.apiClient.get("/friends");
  }

  function add(userName) {
    return window.Naji.apiClient.post(`/friends/add?userName=${encodeURIComponent(userName)}`);
  }

  function remove(userName) {
    return window.Naji.apiClient.del(`/friends/${encodeURIComponent(userName)}`);
  }

  window.Naji = window.Naji || {};
  window.Naji.friends = { list, add, remove };
})();
