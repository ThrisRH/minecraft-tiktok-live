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
  await initTikTokConnection();
}

function setupEventListeners() {
  // TikTok ID input
  const tiktokIdInput = document.getElementById("input-tiktok-id");
  if (localStorage.getItem("tiktok_id")) {
    tiktokIdInput.value = localStorage.getItem("tiktok_id");
  }
  tiktokIdInput.addEventListener("input", (e) => {
    localStorage.setItem("tiktok_id", e.target.value.trim());
  });

  const btnConnectTikTok = document.getElementById("btn-connect-tiktok");
  btnConnectTikTok.addEventListener("click", async () => {
    const isConnected = btnConnectTikTok.dataset.connected === "true";
    if (isConnected) {
      await disconnectTikTok();
    } else {
      const username = tiktokIdInput.value.trim();
      if (!username) {
        alert("Vui lòng nhập TikTok ID (Livestream Unique ID)");
        return;
      }
      await connectTikTok(username);
    }
  });

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

  const categoryNames = {
    gacha: "🎲 Gacha",
    event: "🐉 Sự Kiện",
    mob: "🧟 Mob",
    item: "🍎 Vật Phẩm",
    trap: "💣 Bẫy",
  };

  const filtered = giftsCatalog.filter((gift) => {
    const matchesCategory = activeCategory === "all" || gift.category === activeCategory;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      gift.name.toLowerCase().includes(searchLower) ||
      (gift.titleVi && gift.titleVi.toLowerCase().includes(searchLower)) ||
      gift.description.toLowerCase().includes(searchLower) ||
      (gift.effectVi && gift.effectVi.toLowerCase().includes(searchLower)) ||
      gift.id.toLowerCase().includes(searchLower);
    return matchesCategory && matchesSearch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3>Không tìm thấy quà phù hợp</h3>
        <p>Thử tìm theo tên tiếng Việt như "Heo May Mắn", "Corgi", "Zombie" hoặc chọn danh mục khác.</p>
      </div>`;
    return;
  }

  filtered.forEach((gift) => {
    const card = document.createElement("div");
    card.className = `gift-card category-${gift.category}`;

    const catName = categoryNames[gift.category] || gift.category;
    const titleViDisplay = gift.titleVi ? `<span class="title-vi" title="${escapeHtml(gift.titleVi)}">${escapeHtml(gift.titleVi)}</span>` : "";
    const effectPill = gift.effectVi ? `<div class="effect-pill" title="${escapeHtml(gift.effectVi)}">${escapeHtml(gift.effectVi)}</div>` : "";

    card.innerHTML = `
      <div class="gift-header">
        <div class="gift-icon">${gift.icon}</div>
        <div class="gift-title-group">
          <div class="gift-name-row">
            <h4 title="${escapeHtml(gift.name)}">${escapeHtml(gift.name)}</h4>
            <span class="gift-tag ${gift.category}">${catName}</span>
          </div>
          ${titleViDisplay}
        </div>
      </div>
      
      <div class="gift-body">
        ${effectPill}
        <p class="gift-desc" title="${escapeHtml(gift.description)}">${escapeHtml(gift.description)}</p>
      </div>

      <button class="btn-trigger" data-gift="${gift.id}">
        <span class="btn-left">
          <span class="btn-icon">⚡</span>
          <span class="btn-text">KÍCH HOẠT</span>
        </span>
        <span class="btn-badge">x<span class="lbl-count">${selectedCount}</span></span>
      </button>
    `;

    const triggerBtn = card.querySelector(".btn-trigger");
    triggerBtn.addEventListener("click", async () => {
      triggerBtn.classList.add("triggering");
      triggerBtn.disabled = true;
      await triggerGift(gift.id);
      setTimeout(() => {
        triggerBtn.classList.remove("triggering");
        triggerBtn.disabled = false;
      }, 400);
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

async function initTikTokConnection() {
  const status = await checkTikTokStatus();
  const savedTikTokId = localStorage.getItem("tiktok_id");

  if (!status.connected && savedTikTokId) {
    // Tự động kết nối luôn nếu đã lưu TikTok ID từ trước
    void connectTikTok(savedTikTokId);
  }
}

async function checkTikTokStatus() {
  const badge = document.getElementById("tiktok-status-badge");
  const badgeText = document.getElementById("tiktok-status-text");
  const btnConnect = document.getElementById("btn-connect-tiktok");
  const inputTikTokId = document.getElementById("input-tiktok-id");

  try {
    const res = await fetch("/api/tiktok-status");
    const data = await res.json();

    if (data.connected && data.username) {
      badge.className = "status-badge online";
      badgeText.textContent = `TikTok Live (@${data.username})`;
      btnConnect.textContent = "🔌 Ngắt Kết Nối";
      btnConnect.dataset.connected = "true";
      if (!inputTikTokId.value) {
        inputTikTokId.value = data.username;
      }
      return data;
    } else {
      badge.className = "status-badge offline";
      badgeText.textContent = "TikTok Disconnected";
      btnConnect.textContent = "🔗 Kết Nối Live";
      btnConnect.dataset.connected = "false";
      return { connected: false, username: null };
    }
  } catch {
    badge.className = "status-badge offline";
    badgeText.textContent = "TikTok Disconnected";
    btnConnect.textContent = "🔗 Kết Nối Live";
    btnConnect.dataset.connected = "false";
    return { connected: false, username: null };
  }
}

async function connectTikTok(username) {
  const badge = document.getElementById("tiktok-status-badge");
  const badgeText = document.getElementById("tiktok-status-text");
  const btnConnect = document.getElementById("btn-connect-tiktok");

  badge.className = "status-badge connecting";
  badgeText.textContent = `⏳ Đang kết nối @${username}...`;
  btnConnect.textContent = "⏳ Đang kết nối...";

  try {
    const res = await fetch("/api/connect-tiktok", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });

    const data = await res.json();
    if (res.ok && data.status === "success") {
      badge.className = "status-badge online";
      badgeText.textContent = `TikTok Live (@${data.username})`;
      btnConnect.textContent = "🔌 Ngắt Kết Nối";
      btnConnect.dataset.connected = "true";
      localStorage.setItem("tiktok_id", data.username);
    } else {
      badge.className = "status-badge offline";
      badgeText.textContent = "Lỗi kết nối";
      btnConnect.textContent = "🔗 Kết Nối Live";
      btnConnect.dataset.connected = "false";
      alert(`Kết nối TikTok Live thất bại: ${data.message || "Lỗi không xác định"}`);
    }
  } catch (err) {
    badge.className = "status-badge offline";
    badgeText.textContent = "Lỗi kết nối";
    btnConnect.textContent = "🔗 Kết Nối Live";
    btnConnect.dataset.connected = "false";
    alert(`Không thể kết nối tới server: ${err.message}`);
  }
}

async function disconnectTikTok() {
  try {
    await fetch("/api/disconnect-tiktok", { method: "POST" });
  } catch {
    // ignore
  }
  await checkTikTokStatus();
}
