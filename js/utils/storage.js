(function () {
  const TOKEN_KEY = "naji.token";
  const ROOM_PASSCODE_KEY = "naji.roomPasscode";
  const USERNAME_KEY = "naji.username";

  function saveToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
  }

  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
  }

  function saveRoomPasscode(passcode) {
    localStorage.setItem(ROOM_PASSCODE_KEY, passcode);
  }

  function getRoomPasscode() {
    return localStorage.getItem(ROOM_PASSCODE_KEY);
  }

  function clearRoomPasscode() {
    localStorage.removeItem(ROOM_PASSCODE_KEY);
  }

  function saveUsername(username) {
    localStorage.setItem(USERNAME_KEY, username);
  }

  function getUsername() {
    return localStorage.getItem(USERNAME_KEY);
  }

  function clearUsername() {
    localStorage.removeItem(USERNAME_KEY);
  }

  window.Naji = window.Naji || {};
  window.Naji.storage = {
    saveToken,
    getToken,
    clearToken,
    saveRoomPasscode,
    getRoomPasscode,
    clearRoomPasscode,
    saveUsername,
    getUsername,
    clearUsername
  };
})();
