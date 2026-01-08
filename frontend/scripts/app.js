const activities = [
  {
    id: "stem2048",
    title: "Fusion 2048",
    module: () => import("./modules/stem2048.js"),
  },
  {
    id: "missionQuiz",
    title: "Mission Control Quiz",
    module: () => import("./modules/missionQuiz.js"),
  },
  {
    id: "teamsGuide",
    title: "MS Teams Guide",
    module: () => import("./modules/pdfViewer.js"),
    pdfUrl: "ms team instructions.pdf",
  },
];

const state = {
  mountedActivity: null,
};

class AudioManager {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }
  toggle() {
    this.enabled = !this.enabled;
    if (!this.enabled && this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
    return this.enabled;
  }
  async initContext() {
    if (!this.enabled) return;
    if (!this.ctx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) {
        this.enabled = false;
        return;
      }
      this.ctx = new Ctx();
      if (this.ctx.state === "suspended") {
        await this.ctx.resume();
      }
    }
  }
  async playTap() {
    if (!this.enabled) return;
    await this.initContext();
    if (!this.ctx) return;
    const duration = 0.12;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(520, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.3, this.ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }
}

const audioManager = new AudioManager();

// DOM Elements
const homeView = document.getElementById("homeView");
const activityView = document.getElementById("activityView");
const activityFrame = document.getElementById("activityFrame");
const activityTitle = document.getElementById("activityTitle");
const backBtn = document.getElementById("backBtn");
const exitActivityButton = document.getElementById("exitActivityButton");
const muteButton = document.getElementById("muteButton");
const clockEl = document.getElementById("clock");
const screensaverEl = document.getElementById("screensaver");
const screensaverFrame = document.getElementById("screensaverFrame");
const exitOverlay = document.getElementById("exitOverlay");
const exitCancel = document.getElementById("exitCancel");

// Screensaver configuration
const SCREENSAVER_DELAY_MS = 3 * 60 * 1000;
const SCREENSAVER_ADVANCE_MS = 8000;

const screensaverState = {
  timerId: null,
  intervalId: null,
  active: false,
  index: 0,
  images: [],
  loading: false,
};

// Activity panel click handlers
function setupActivityPanels() {
  console.log("Setting up activity panels...");
  const panels = document.querySelectorAll("[data-activity-id]");
  console.log("Found panels:", panels.length);
  panels.forEach((panel) => {
    const activityId = panel.dataset.activityId;
    console.log("Adding click handler for:", activityId);
    panel.addEventListener("click", () => {
      console.log("Panel clicked:", activityId);
      openActivity(activityId);
    });
    panel.addEventListener("keydown", (evt) => {
      if (evt.key === "Enter" || evt.key === " ") {
        evt.preventDefault();
        openActivity(activityId);
      }
    });
  });
}

async function openActivity(activityId) {
  await audioManager.playTap();
  const selected = activities.find((activity) => activity.id === activityId);
  if (!selected) return;

  activityTitle.textContent = selected.title;
  homeView.classList.add("hidden");
  activityView.classList.remove("hidden");

  try {
    const module = await selected.module();
    if (state.mountedActivity && typeof state.mountedActivity.destroy === "function") {
      state.mountedActivity.destroy();
    }
    // Handle PDF activities
    if (selected.pdfUrl) {
      state.mountedActivity = module.mount(activityFrame);
      await state.mountedActivity.loadPDF(selected.pdfUrl);
    } else {
      state.mountedActivity = module.mount(activityFrame);
    }
  } catch (err) {
    console.error("Failed to load module", err);
    activityFrame.innerHTML = `<div class="activity-error">
      <h3>We hit a snag</h3>
      <p>Something went wrong loading this activity. Please try again.</p>
    </div>`;
  }
}

function closeActivity() {
  audioManager.playTap();
  if (state.mountedActivity && typeof state.mountedActivity.destroy === "function") {
    state.mountedActivity.destroy();
  }
  state.mountedActivity = null;
  activityFrame.innerHTML = "";
  activityView.classList.add("hidden");
  homeView.classList.remove("hidden");
}

function initClock() {
  function updateClock() {
    const now = new Date();
    const formatted = now.toLocaleString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    clockEl.textContent = formatted;
  }
  updateClock();
  setInterval(updateClock, 30 * 1000);
}

function registerControls() {
  backBtn.addEventListener("click", closeActivity);
  exitActivityButton.addEventListener("click", closeActivity);

  muteButton.addEventListener("click", async () => {
    const enabled = audioManager.toggle();
    const svg = muteButton.querySelector("svg");
    if (enabled) {
      svg.innerHTML = `<path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>`;
      await audioManager.playTap();
    } else {
      svg.innerHTML = `<path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>`;
    }
    muteButton.setAttribute("aria-pressed", (!enabled).toString());
  });

  // Exit dialog
  exitCancel.addEventListener("click", () => {
    exitOverlay.classList.add("hidden");
    audioManager.playTap();
  });

  // Keyboard shortcut to exit kiosk
  document.addEventListener("keydown", (evt) => {
    if (evt.ctrlKey && evt.shiftKey && evt.key === "Q") {
      evt.preventDefault();
      exitOverlay.classList.remove("hidden");
    }
    // Also allow closing with Escape
    if (evt.key === "Escape" && !exitOverlay.classList.contains("hidden")) {
      exitOverlay.classList.add("hidden");
    }
  });

  setupScreensaver();
}

// Screensaver functions
function setupScreensaver() {
  const activityEvents = ["mousemove", "mousedown", "keydown", "touchstart", "wheel"];
  activityEvents.forEach((evt) => {
    document.addEventListener(evt, handleUserActivity, { passive: evt === "touchstart" || evt === "wheel" });
  });

  screensaverEl.addEventListener("click", handleUserActivity);
  resetScreensaverTimer();
}

function resetScreensaverTimer() {
  if (screensaverState.timerId) {
    clearTimeout(screensaverState.timerId);
  }
  screensaverState.timerId = window.setTimeout(activateScreensaver, SCREENSAVER_DELAY_MS);
}

async function activateScreensaver() {
  if (screensaverState.active) return;
  const images = await loadScreensaverImages();
  if (!images.length) {
    resetScreensaverTimer();
    return;
  }
  closeActivity();
  screensaverState.active = true;
  screensaverState.index = 0;
  updateScreensaverImage();
  screensaverEl.classList.remove("hidden");
  screensaverState.intervalId = window.setInterval(() => {
    screensaverState.index = (screensaverState.index + 1) % screensaverState.images.length;
    updateScreensaverImage();
  }, SCREENSAVER_ADVANCE_MS);
}

function deactivateScreensaver() {
  if (!screensaverState.active) return;
  screensaverState.active = false;
  if (screensaverState.intervalId) {
    clearInterval(screensaverState.intervalId);
    screensaverState.intervalId = null;
  }
  screensaverEl.classList.add("hidden");
}

function handleUserActivity() {
  if (screensaverState.active) {
    deactivateScreensaver();
  }
  resetScreensaverTimer();
}

async function loadScreensaverImages() {
  if (screensaverState.images.length || screensaverState.loading) {
    return screensaverState.images;
  }
  screensaverState.loading = true;
  try {
    const response = await fetch("/__screensaver", { cache: "no-store" });
    if (!response.ok) return [];
    const data = await response.json();
    screensaverState.images = Array.isArray(data.images) ? data.images : [];
  } catch (err) {
    console.error("Failed to load screensaver images", err);
  } finally {
    screensaverState.loading = false;
  }
  return screensaverState.images;
}

function updateScreensaverImage() {
  if (!screensaverFrame || !screensaverState.images.length) return;
  const src = screensaverState.images[screensaverState.index];
  screensaverFrame.style.backgroundImage = `url(${src})`;
}

function init() {
  console.log("Init called, readyState:", document.readyState);
  setupActivityPanels();
  initClock();
  registerControls();
  console.log("Init complete");
}

console.log("App.js loaded, readyState:", document.readyState);
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
