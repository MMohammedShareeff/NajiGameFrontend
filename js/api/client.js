(function () {
  const API_BASE_URL = "http://localhost:8080";

  async function request(path, { method = "GET", body, headers = {} } = {}) {
    const requestHeaders = { ...headers };

    if (body !== undefined) {
      requestHeaders["Content-Type"] = "application/json";
    }

    const token = window.Naji.storage.getToken();
    if (token) {
      requestHeaders["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: requestHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined
    });

    const contentType = response.headers.get("Content-Type") || "";
    const rawText = await response.text();
    const data = contentType.includes("application/json") && rawText
      ? JSON.parse(rawText)
      : rawText;

    if (!response.ok) {
      const message = typeof data === "string" && data
        ? data
        : `Request failed with status ${response.status}`;
      throw { status: response.status, message };
    }

    return data;
  }

  window.Naji = window.Naji || {};
  window.Naji.apiClient = {
    get: (path) => request(path),
    post: (path, body) => request(path, { method: "POST", body }),
    put: (path, body) => request(path, { method: "PUT", body }),
    del: (path) => request(path, { method: "DELETE" })
  };
})();
