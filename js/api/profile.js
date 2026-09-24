(function () {
  function getMyProfile() {
    return window.Naji.apiClient.get("/player/me");
  }

  function requestUpdate({ userName, email, password }) {
    const payload = { email };
    if (userName) {
      payload.userName = userName;
    }
    if (password) {
      payload.password = password;
    }
    return window.Naji.apiClient.put("/player/update", payload);
  }

  function verifyUpdate(code) {
    const query = new URLSearchParams({ verificationCode: code });
    return window.Naji.apiClient.post(`/verification/verify-update?${query}`);
  }

  window.Naji = window.Naji || {};
  window.Naji.profile = { getMyProfile, requestUpdate, verifyUpdate };
})();
