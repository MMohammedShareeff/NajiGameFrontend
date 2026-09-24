(function () {
  const DISMISS_MS = { error: 6000, success: 3500, info: 4000 };
  const LEAVE_MS = 250;

  function getContainer() {
    let container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      container.className = "toast-container";
      container.setAttribute("aria-live", "polite");
      document.body.appendChild(container);
    }
    return container;
  }

  function dismiss(toast) {
    if (!toast.isConnected) {
      return;
    }
    toast.classList.add("toast--leaving");
    setTimeout(() => toast.remove(), LEAVE_MS);
  }

  function show(message, type = "info") {
    const container = getContainer();
    const alreadyShown = Array.from(container.children).some((toast) => toast.textContent === message);
    if (alreadyShown) {
      return;
    }

    const toast = document.createElement("div");
    toast.className = `toast toast--${type}`;
    toast.setAttribute("role", type === "error" ? "alert" : "status");
    toast.textContent = message;
    toast.addEventListener("click", () => dismiss(toast));
    container.appendChild(toast);

    setTimeout(() => dismiss(toast), DISMISS_MS[type] ?? DISMISS_MS.info);
  }

  window.Naji = window.Naji || {};
  window.Naji.toast = {
    show,
    error: (message) => show(message, "error"),
    success: (message) => show(message, "success"),
    info: (message) => show(message, "info")
  };
})();
