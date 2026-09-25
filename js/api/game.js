(function () {
  function submitAnswer(text) {
    return window.Naji.apiClient.post(`/Submission/create?text=${encodeURIComponent(text)}`);
  }

  function startGame(passCode) {
    const lang = window.Naji.i18n ? window.Naji.i18n.language : "en";
    return window.Naji.apiClient.post(`/game/start?passCode=${encodeURIComponent(passCode)}&lang=${lang}`);
  }

  function setLanguage(passCode) {
    const lang = window.Naji.i18n ? window.Naji.i18n.language : "en";
    return window.Naji.apiClient.post(`/game/language?passCode=${encodeURIComponent(passCode)}&lang=${lang}`);
  }

  function stopGame(passCode) {
    return window.Naji.apiClient.post(`/game/stop?passCode=${encodeURIComponent(passCode)}`);
  }

  function getGameState(passCode) {
    return window.Naji.apiClient.get(`/game/state?passCode=${encodeURIComponent(passCode)}`);
  }

  window.Naji = window.Naji || {};
  window.Naji.game = { submitAnswer, startGame, setLanguage, stopGame, getGameState };
})();
