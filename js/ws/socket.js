(function () {
  let client = null;

  function connect(token) {
    return new Promise((resolve, reject) => {
      const wsUrl = `${window.Naji.apiClient.baseUrl}/game-webSocket?token=${encodeURIComponent(token)}`;

      client = new StompJs.Client({
        webSocketFactory: () => new SockJS(wsUrl),
        reconnectDelay: 5000,
        onConnect: () => resolve(),
        onStompError: (frame) => {
          reject(new Error(frame.headers["message"] || "WebSocket connection error."));
        }
      });

      client.activate();
    });
  }

  function subscribe(topic, callback) {
    if (!client || !client.connected) {
      throw new Error("Cannot subscribe before the WebSocket connection is established.");
    }
    return client.subscribe(topic, (message) => callback(message.body));
  }

  function disconnect() {
    if (client) {
      client.deactivate();
      client = null;
    }
  }

  window.Naji = window.Naji || {};
  window.Naji.socket = { connect, subscribe, disconnect };
})();
