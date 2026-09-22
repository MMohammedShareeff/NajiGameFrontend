(function () {
  function register({ userName, password, email }) {
    return window.Naji.apiClient.post("/player/register", { userName, password, email });
  }

  async function login({ userName, password }) {
    const token = await window.Naji.apiClient.post("/player/login", { userName, password });
    window.Naji.storage.saveToken(token);
    window.Naji.storage.saveUsername(userName);
    return token;
  }

  window.Naji = window.Naji || {};
  window.Naji.auth = { register, login };
})();
