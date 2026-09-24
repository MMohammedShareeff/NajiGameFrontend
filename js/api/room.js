(function () {
  function parseCreateRoomMessage(message) {
    const match = message.match(/passCode is: (.+?)\. Your new token is: (.+)$/);
    if (!match) {
      throw { status: 0, message: "Unexpected response from the server while creating the room." };
    }
    return { passCode: match[1], token: match[2] };
  }

  async function createRoom() {
    const message = await window.Naji.apiClient.post("/room/create");
    const { passCode, token } = parseCreateRoomMessage(message);
    window.Naji.storage.saveToken(token);
    window.Naji.storage.saveRoomPasscode(passCode);
    return passCode;
  }

  async function joinRoom(passCode) {
    const userName = window.Naji.storage.getUsername();
    try {
      await window.Naji.apiClient.post(
        `/room/add-player?passCode=${encodeURIComponent(passCode)}&userName=${encodeURIComponent(userName)}`
      );
    } catch (error) {
      if (error.message !== "Player is already in this room") {
        throw error;
      }
    }
    window.Naji.storage.saveRoomPasscode(passCode);
    return passCode;
  }

  function getPlayersInRoom(passCode) {
    return window.Naji.apiClient.get(`/room/get-players?passCode=${encodeURIComponent(passCode)}`);
  }

  function getRoomAdmin(passCode) {
    return window.Naji.apiClient.get(`/room/admin?passCode=${encodeURIComponent(passCode)}`);
  }

  function kickPlayer(passCode, playerName) {
    return window.Naji.apiClient.del(
      `/room/kick-player/${encodeURIComponent(playerName)}?passCode=${encodeURIComponent(passCode)}`
    );
  }

  window.Naji = window.Naji || {};
  window.Naji.room = { createRoom, joinRoom, getPlayersInRoom, getRoomAdmin, kickPlayer };
})();
