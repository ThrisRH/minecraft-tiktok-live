let giftsCatalog = [];
let activeCategory = "all";
let searchQuery = "";
let selectedCount = 1;

document.addEventListener("DOMContentLoaded", () => {
  initApp();
});

async function initApp() {
  setupEventListeners();
  await loadGiftsCatalog();
  startLogPolling();
}

function setupEventListeners() {
  // Username input
  const usernameInput = document.getElementById("input-username");
  usernameInput.addEventListener("input", (e) => {
    localStorage.setItem("tester_username", e.target.value);
  });
  if (localStorage.getItem("tester_username")) {
    usernameInput.value = localStorage.getItem("tester_username");
  }

  // Count selector chips
  const chips = document.querySelectorAll(".count-chip");
  const countInput = document.getElementById("input-count");

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      selectedCount = Number(chip.dataset.count);
      countInput.value = selectedCount;
      updateTriggerButtonLabels();
    });
  });

  countInput.addEventListener("input", (e) => {
    selectedCount = Math.max(1, Number(e.target.value || 1));
    chips.forEach((c) => c.classList.remove("active"));
    updateTriggerButtonLabels();
  });

  // Search input
  const searchInput = document.getElementById("search-input");
  searchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value.toLowerCase().trim();
    renderGifts();
  });

  // Category Tabs
  const tabs = document.querySelectorAll(".tab-chip");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      activeCategory = tab.dataset.category;
      renderGifts();
    });
  });

  // Quick Action Buttons
  document.getElementById("btn-test-all").addEventListener("click", async () => {
    const username = getUsername();
    if (confirm(`Khởi chạy chuỗi test tự động tất cả các quà cho user "${username}"?`)) {
      await fetch("/api/test-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: selectedCount, delayMs: 1000, username }),
      });
    }
  });

  document.getElementById("btn-send-like").addEventListener("click", async () => {
    const username = getUsername();
    await fetch("/api/trigger-like", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ count: 500, username }),
    });
  });

  document.getElementById("btn-clear-log").addEventListener("click", () => {
    document.getElementById("console-logs").innerHTML = "";
  });
}

function getUsername() {
  const input = document.getElementById("input-username");
  return input.value.trim() || "StreamTester";
}

async function loadGiftsCatalog() {
  try {
    const res = await fetch("/api/gifts");
    giftsCatalog = await res.json();
    document.getElementById("count-all").textContent = giftsCatalog.length;
    renderGifts();
  } catch (err) {
    console.error("Failed to load gifts catalog:", err);
  }
}

function renderGifts() {
  const grid = document.getElementById("gifts-grid");
  grid.innerHTML = "";

  const filtered = giftsCatalog.filter((gift) => {
    const matchesCategory = activeCategory === "all" || gift.category === activeCategory;
    const matchesSearch =
      !searchQuery ||
      gift.name.toLowerCase().includes(searchQuery) ||
      gift.description.toLowerCase().includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 3rem;">Không tìm thấy quà phù hợp.</div>`;
    return;
  }

  filtered.forEach((gift) => {
    const card = document.createElement("div");
    card.className = "gift-card";

    card.innerHTML = `
      <div class="gift-header">
        <div class="gift-icon">${gift.icon}</div>
        <div class="gift-title">
          <h4>${gift.name}</h4>
          <span class="gift-tag ${gift.category}">${gift.category}</span>
        </div>
      </div>
      <div class="gift-desc">${gift.description}</div>
      <button class="btn-trigger" data-gift="${gift.id}">
        ⚡ TRIGGER (x<span class="lbl-count">${selectedCount}</span>)
      </button>
    `;

    const triggerBtn = card.querySelector(".btn-trigger");
    triggerBtn.addEventListener("click", () => {
      triggerGift(gift.id);
    });

    grid.appendChild(card);
  });
}

function updateTriggerButtonLabels() {
  document.querySelectorAll(".lbl-count").forEach((lbl) => {
    lbl.textContent = selectedCount;
  });
}

async function triggerGift(giftName) {
  const username = getUsername();
  try {
    await fetch("/api/trigger-gift", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        giftName,
        count: selectedCount,
        username,
      }),
    });
  } catch (err) {
    console.error("Trigger gift failed:", err);
  }
}

function startLogPolling() {
  const pollLogs = async () => {
    try {
      const res = await fetch("/api/logs");
      const logs = await res.json();
      renderLogs(logs);
    } catch {
      // ignore
    }
  };

  void pollLogs();
  setInterval(pollLogs, 1000);
}

function renderLogs(logs) {
  const container = document.getElementById("console-logs");
  const html = logs
    .map(
      (log) => `
    <div class="log-entry ${log.type}">
      <span class="log-time">[${log.timestamp}]</span>
      <span class="log-msg">${escapeHtml(log.message)}</span>
    </div>
  `,
    )
    .join("");

  container.innerHTML = html;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
