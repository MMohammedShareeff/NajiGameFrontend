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

  function verifyUpdate(email, code) {
    const query = new URLSearchParams({
      email,
      verificationCode: code,
      isUpdate: "true",
      isPassReset: "false"
    });
    return window.Naji.apiClient.post(`/verification/verify-email?${query}`);
  }

  window.Naji = window.Naji || {};
  window.Naji.profile = { getMyProfile, requestUpdate, verifyUpdate };
})();
