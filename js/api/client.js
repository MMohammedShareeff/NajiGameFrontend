(function () {
  const LOCAL_DEV_API_URL = "http://localhost:8080";
  const STANDARD_WEB_PORTS = ["", "80", "443"];
  const isLocalDevPage = ["localhost", "127.0.0.1"].includes(window.location.hostname)
    && !STANDARD_WEB_PORTS.includes(window.location.port);
  const API_BASE_URL = isLocalDevPage ? LOCAL_DEV_API_URL : "";
  const NETWORK_ERROR_MESSAGE = "Can't reach the server. Check your connection and try again.";
  const AUTH_PATHS = ["/player/login", "/player/register"];

  function expireSession() {
    if (window.Naji.authGuard) {
      window.Naji.authGuard.handleSessionExpired();
    } else {
      window.Naji.storage.clearSession();
    }
  }

  async function request(path, { method = "GET", body, headers = {} } = {}) {
    const requestHeaders = { ...headers };

    if (body !== undefined) {
      requestHeaders["Content-Type"] = "application/json";
    }

    if (window.Naji.storage.hasValidSession()) {
      requestHeaders["Authorization"] = `Bearer ${window.Naji.storage.getToken()}`;
    }

    let response;
    try {
      response = await fetch(`${API_BASE_URL}${path}`, {
        method,
        headers: requestHeaders,
        body: body !== undefined ? JSON.stringify(body) : undefined
      });
    } catch {
      throw { status: 0, message: NETWORK_ERROR_MESSAGE };
    }

    const contentType = response.headers.get("Content-Type") || "";
    const rawText = await response.text();
    const data = contentType.includes("application/json") && rawText
      ? JSON.parse(rawText)
      : rawText;

    if (!response.ok) {
      if (response.status === 401 && !AUTH_PATHS.includes(path)) {
        expireSession();
      }
      const message = typeof data === "string" && data
        ? data
        : `Request failed with status ${response.status}`;
      throw { status: response.status, message };
    }

    return data;
  }

  window.Naji = window.Naji || {};
  window.Naji.apiClient = {
    baseUrl: API_BASE_URL,
    get: (path) => request(path),
    post: (path, body) => request(path, { method: "POST", body }),
    put: (path, body) => request(path, { method: "PUT", body }),
    del: (path) => request(path, { method: "DELETE" })
  };
})();
