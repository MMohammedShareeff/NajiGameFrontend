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

  async function loginAsGuest(nickname) {
    const query = nickname ? `?name=${encodeURIComponent(nickname)}` : "";
    const token = await window.Naji.apiClient.post(`/player/guest${query}`);
    window.Naji.storage.saveToken(token);
    window.Naji.storage.saveUsername(window.Naji.storage.readTokenPayload()?.sub || "Guest");
    return token;
  }

  function requestPasswordReset({ email, newPassword, newPasswordAgain }) {
    return window.Naji.apiClient.put("/player/reset-password", { email, newPassword, newPasswordAgain });
  }

  function verifyPasswordReset(email, code) {
    const query = new URLSearchParams({
      email,
      verificationCode: code,
      isUpdate: "false",
      isPassReset: "true"
    });
    return window.Naji.apiClient.post(`/verification/verify-email?${query}`);
  }

  window.Naji = window.Naji || {};
  window.Naji.auth = { register, login, loginAsGuest, requestPasswordReset, verifyPasswordReset };
})();
