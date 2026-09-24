(function () {
  function submitAnswer(text) {
    return window.Naji.apiClient.post(`/Submission/create?text=${encodeURIComponent(text)}`);
  }

  function startGame(passCode) {
    return window.Naji.apiClient.post(`/game/start?passCode=${encodeURIComponent(passCode)}`);
  }

  window.Naji = window.Naji || {};
  window.Naji.game = { submitAnswer, startGame };
})();
