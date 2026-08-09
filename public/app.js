let giftsCatalog = [];
let activeCategory = "all";
let searchQuery = "";
let selectedCount = 1;

document.addEventListener("DOMContentLoaded", () => {
  initApp();
});

async function initApp() {
  setupEventListeners();
  await loadCurrentMode();
  await loadGiftsCatalog();
  await loadDeathsCount();
  startLogPolling();
}

async function loadCurrentMode() {
  try {
    const res = await fetch("/api/mode");
    const data = await res.json();
    if (data.mode) {
      document.getElementById("select-gameplay-mode").value = data.mode;
    }
  } catch (err) {
    console.error("Failed to load mode:", err);
  }
}

function setupEventListeners() {
  // Gameplay mode selector
  const modeSelect = document.getElementById("select-gameplay-mode");
  modeSelect.addEventListener("change", async (e) => {
    const newMode = e.target.value;
    try {
      await fetch("/api/mode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: newMode }),
      });
      await loadGiftsCatalog();
    } catch (err) {
      console.error("Failed to change mode:", err);
    }
  });

  // TikTok Live connection
  const tiktokInput = document.getElementById("input-tiktok-username");
  const btnConnectTiktok = document.getElementById("btn-connect-tiktok");

  const savedTiktokUser = localStorage.getItem("tiktok_username");
  if (savedTiktokUser && tiktokInput) {
    tiktokInput.value = savedTiktokUser;
  }

  if (btnConnectTiktok) {
    btnConnectTiktok.addEventListener("click", async () => {
      const username = tiktokInput.value.trim();
      if (!username) {
        alert("Vui lòng nhập TikTok Username");
        return;
      }

      localStorage.setItem("tiktok_username", username);
      btnConnectTiktok.disabled = true;
      btnConnectTiktok.textContent = "⏳ Đang kết nối...";

      try {
        const res = await fetch("/api/connect-tiktok", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username }),
        });

        const data = await res.json();
        if (res.ok) {
          btnConnectTiktok.textContent = "🟢 Đã Kết Nối";
          btnConnectTiktok.style.backgroundColor = "var(--color-success, #10b981)";
        } else {
          alert("Lỗi kết nối TikTok Live: " + (data.error || "Không thể kết nối"));
          btnConnectTiktok.textContent = "🔗 Kết nối Live";
          btnConnectTiktok.style.backgroundColor = "";
        }
      } catch (err) {
        alert("Lỗi kết nối TikTok Live: " + err.message);
        btnConnectTiktok.textContent = "🔗 Kết nối Live";
        btnConnectTiktok.style.backgroundColor = "";
      } finally {
        btnConnectTiktok.disabled = false;
      }
    });
  }

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

  const playerNameInput = document.getElementById("input-player-name");
  const savedPlayerName = localStorage.getItem("target_player_name");
  if (savedPlayerName) {
    playerNameInput.value = savedPlayerName;
    void fetch("/api/target-player", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerName: savedPlayerName }),
    });
  }

  playerNameInput.addEventListener("change", async (e) => {
    const playerName = e.target.value.trim() || "Thrisx0310";
    localStorage.setItem("target_player_name", playerName);
    try {
      await fetch("/api/target-player", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerName }),
      });
    } catch (err) {
      console.error("Failed to sync target player name:", err);
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

  document.getElementById("btn-reset-deaths").addEventListener("click", async () => {
    try {
      const res = await fetch("/api/reset-deaths", { method: "POST" });
      const data = await res.json();
      document.getElementById("lbl-death-count").textContent = data.deaths ?? 0;
    } catch (err) {
      console.error("Failed to reset deaths:", err);
    }
  });

  document.getElementById("btn-trigger-death").addEventListener("click", async () => {
    const playerName = getPlayerName();
    try {
      const res = await fetch("/api/trigger-death", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerName }),
      });
      const data = await res.json();
      document.getElementById("lbl-death-count").textContent = data.deaths ?? 0;
    } catch (err) {
      console.error("Failed to trigger death:", err);
    }
  });

  document.getElementById("btn-clear-log").addEventListener("click", () => {
    document.getElementById("console-logs").innerHTML = "";
  });
}

async function loadDeathsCount() {
  try {
    const res = await fetch("/api/deaths");
    const data = await res.json();
    document.getElementById("lbl-death-count").textContent = data.deaths ?? 0;
    document.getElementById("lbl-max-deaths").textContent = data.maxDeaths ?? 5;
    if (data.targetPlayer && document.activeElement !== document.getElementById("input-player-name")) {
      document.getElementById("input-player-name").value = data.targetPlayer;
    }
  } catch {
    // ignore
  }

  try {
    const ammoRes = await fetch("/api/ammo-timer");
    const ammoData = await ammoRes.json();
    if (typeof ammoData.countdown === "number") {
      document.getElementById("lbl-ammo-countdown").textContent = ammoData.countdown;
    }
  } catch {
    // ignore
  }
}

function getPlayerName() {
  const input = document.getElementById("input-player-name");
  return input.value.trim() || "Thrisx0310";
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
