import initBanner from "./modules/banner.js";

const activities = [
  {
    id: "stem2048",
    title: "Fusion 2048",
    module: () => import("./modules/stem2048.js"),
  },
  {
    id: "missionQuiz",
    title: "Mission Quiz",
    module: () => import("./modules/missionQuiz.js"),
  },
  {
    id: "stemTicTacToe",
    title: "Atom vs Electron",
    module: () => import("./modules/stemTicTacToe.js"),
  },
  {
    id: "snakeGame",
    title: "Snake Game",
    module: () => import("./modules/snakeGame.js"),
  },
  {
    id: "whiteboard",
    title: "Whiteboard",
    module: () => import("./modules/whiteboard.js"),
  },
  {
    id: "ideaIncubator",
    title: "Idea Incubator",
    module: () => import("./modules/ideaIncubator.js"),
  },
  {
    id: "teamsGuide",
    title: "Teams Guide",
    module: () => import("./modules/pdfViewer.js"),
    pdfUrl: "ms team instructions.pdf",
  },
];

// Navigation pages (not games)
const navigationPages = {
  leaderboard: {
    title: "Leaderboards",
    module: () => import("./modules/leaderboard.js"),
  },
  statistics: {
    title: "Statistics",
    module: () => import("./modules/statistics.js"),
  },
};

const state = {
  mountedActivity: null,
};

// Theme management
function initTheme() {
  const saved = localStorage.getItem("kiosk-theme") || "dark";
  document.documentElement.setAttribute("data-theme", saved);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("kiosk-theme", next);
}

// Audio Manager
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
    const duration = 0.1;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.2, this.ctx.currentTime + 0.01);
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
const themeToggle = document.getElementById("themeToggle");
const refreshButton = document.getElementById("refreshButton");
const clockEl = document.getElementById("clock");
const screensaverEl = document.getElementById("screensaver");
const screensaverLayer1 = document.getElementById("screensaverLayer1");
const screensaverLayer2 = document.getElementById("screensaverLayer2");
const screensaverBlur1 = document.getElementById("screensaverBlur1");
const screensaverBlur2 = document.getElementById("screensaverBlur2");
const exitOverlay = document.getElementById("exitOverlay");
const exitCancel = document.getElementById("exitCancel");

// Screensaver config
const SCREENSAVER_DELAY_MS = 1 * 60 * 1000; // 1 minute to activate screensaver (for testing)
const SCREENSAVER_ADVANCE_MS = 8000; // 8 seconds between background images
const MODE_SWITCH_DELAY_MS = 1 * 60 * 1000; // 1 minute before switching modes (for testing)
const APP_PREVIEW_ADVANCE_MS = 5000; // 5 seconds between app cards

const screensaverState = {
  timerId: null,
  intervalId: null,
  appIntervalId: null,
  modeSwitchTimerId: null,
  active: false,
  currentMode: 'images', // 'images' or 'apps'
  index: 0,
  appIndex: 0,
  images: [],
  loading: false,
  currentLayer: 1, // Toggle between 1 and 2 for crossfade
  appCards: [],
};

// Activity cards
function setupActivityCards() {
  const cards = document.querySelectorAll("[data-activity-id]");
  cards.forEach((card) => {
    const activityId = card.dataset.activityId;
    card.addEventListener("click", () => openActivity(activityId));
    card.addEventListener("keydown", (evt) => {
      if (evt.key === "Enter" || evt.key === " ") {
        evt.preventDefault();
        openActivity(activityId);
      }
    });
  });
}

async function openActivity(activityId) {
  await audioManager.playTap();
  const selected = activities.find((a) => a.id === activityId);
  if (!selected) return;

  activityTitle.textContent = selected.title;
  homeView.classList.add("hidden");
  activityView.classList.remove("hidden");

  try {
    const module = await selected.module();
    if (state.mountedActivity && typeof state.mountedActivity.destroy === "function") {
      state.mountedActivity.destroy();
    }
    if (selected.pdfUrl) {
      state.mountedActivity = module.mount(activityFrame);
      await state.mountedActivity.loadPDF(selected.pdfUrl);
    } else {
      state.mountedActivity = module.mount(activityFrame);
    }
  } catch (err) {
    console.error("Failed to load activity", err);
    activityFrame.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-muted);font-size:1.25rem;">
      <p>Failed to load. Please try again.</p>
    </div>`;
  }
}

async function openNavigationPage(pageId) {
  console.log("Opening navigation page:", pageId);
  await audioManager.playTap();
  const page = navigationPages[pageId];
  if (!page) {
    console.error("Page not found:", pageId);
    return;
  }

  activityTitle.textContent = page.title;
  homeView.classList.add("hidden");
  activityView.classList.remove("hidden");

  try {
    console.log("Loading module for:", pageId);
    const module = await page.module();
    console.log("Module loaded:", module);
    if (state.mountedActivity && typeof state.mountedActivity.destroy === "function") {
      state.mountedActivity.destroy();
    }
    state.mountedActivity = module.mount(activityFrame);
    console.log("Page mounted successfully");
  } catch (err) {
    console.error("Failed to load page", err);
    activityFrame.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-muted);font-size:1.25rem;">
      <p>Failed to load. Please try again.</p>
      <p style="font-size:0.875rem;margin-top:10px;">Error: ${err.message}</p>
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
  function update() {
    const now = new Date();
    clockEl.textContent = now.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }
  update();
  setInterval(update, 30000);
}

function setupControls() {
  backBtn.addEventListener("click", closeActivity);
  exitActivityButton.addEventListener("click", closeActivity);

  // Theme toggle
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      toggleTheme();
      audioManager.playTap();
    });
  }

  // Mute button
  muteButton.addEventListener("click", async () => {
    const enabled = audioManager.toggle();
    const svg = muteButton.querySelector("svg");
    if (enabled) {
      svg.innerHTML = `<path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>`;
      await audioManager.playTap();
    } else {
      svg.innerHTML = `<path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>`;
    }
  });

  // Refresh button
  if (refreshButton) {
    refreshButton.addEventListener("click", async () => {
      await audioManager.playTap();
      // Add a slight delay for the tap sound, then do a hard reload with cache busting
      setTimeout(() => {
        // Force hard reload by clearing cache and reloading
        if ('caches' in window) {
          caches.keys().then(names => {
            names.forEach(name => caches.delete(name));
          });
        }
        // Use location.reload with forceReload flag
        window.location.reload(true);
      }, 100);
    });
  }

  // Exit dialog
  exitCancel.addEventListener("click", () => {
    exitOverlay.classList.add("hidden");
    audioManager.playTap();
  });

  document.addEventListener("keydown", (evt) => {
    if (evt.ctrlKey && evt.shiftKey && evt.key === "Q") {
      evt.preventDefault();
      exitOverlay.classList.remove("hidden");
    }
    if (evt.key === "Escape" && !exitOverlay.classList.contains("hidden")) {
      exitOverlay.classList.add("hidden");
    }
  });

  setupScreensaver();
}

// Screensaver
function setupScreensaver() {
  const events = ["mousemove", "mousedown", "keydown", "touchstart", "wheel"];
  events.forEach((evt) => {
    document.addEventListener(evt, handleUserActivity, { passive: true });
  });

  // Click on screensaver background returns to home
  screensaverEl.addEventListener("click", (e) => {
    // Only handle if clicking on the screensaver itself, not on app cards
    if (e.target === screensaverEl ||
        e.target.classList.contains("attract-mode__blur") ||
        e.target.classList.contains("attract-mode__img")) {
      handleUserActivity();
    }
  });

  resetScreensaverTimer();
}

function resetScreensaverTimer() {
  if (screensaverState.timerId) clearTimeout(screensaverState.timerId);
  screensaverState.timerId = setTimeout(activateScreensaver, SCREENSAVER_DELAY_MS);
}

// Create app preview cards
function createAppPreviewCards() {
  const appPreviewEl = document.getElementById("appPreview");
  if (!appPreviewEl) return;

  // Clear existing cards
  appPreviewEl.innerHTML = "";
  screensaverState.appCards = [];

  activities.forEach((activity, idx) => {
    const card = document.createElement("div");
    card.className = "attract-mode__app-card";
    card.dataset.activityId = activity.id;

    // Determine icon color class
    let iconColorClass = "";
    if (idx === 1 || idx === 3) iconColorClass = "attract-mode__app-icon--green";
    else if (idx === 2) iconColorClass = "attract-mode__app-icon--orange";
    else if (idx === 4 || idx === 5) iconColorClass = "attract-mode__app-icon--purple";
    else if (idx === 6) iconColorClass = "attract-mode__app-icon--yellow";

    // Get the activity card from home view to extract icon and description
    const homeCard = document.querySelector(`[data-activity-id="${activity.id}"]`);
    let iconSvg = "";
    let description = "";
    if (homeCard) {
      const iconEl = homeCard.querySelector(".activity-card__icon svg");
      iconSvg = iconEl ? iconEl.outerHTML : "";
      const descEl = homeCard.querySelector(".activity-card__desc");
      description = descEl ? descEl.textContent : "";
    }

    card.innerHTML = `
      <div class="attract-mode__app-icon ${iconColorClass}">
        ${iconSvg}
      </div>
      <h3 class="attract-mode__app-title">${activity.title}</h3>
      <p class="attract-mode__app-desc">${description}</p>
      <div class="attract-mode__app-tap-hint">👆 Tap to play</div>
    `;

    // Add click handler to launch the app
    card.addEventListener("click", (e) => {
      e.stopPropagation();
      deactivateScreensaver();
      openActivity(activity.id);
    });

    appPreviewEl.appendChild(card);
    screensaverState.appCards.push(card);
  });
}

// Update app preview rotation
function updateAppPreview() {
  if (!screensaverState.appCards.length) return;

  // Hide all cards
  screensaverState.appCards.forEach((card) => {
    card.classList.remove("active");
  });

  // Show current card
  const currentCard = screensaverState.appCards[screensaverState.appIndex];
  if (currentCard) {
    currentCard.classList.add("active");
  }
}

// Switch to app preview mode
function switchToAppMode() {
  if (!screensaverState.active || screensaverState.currentMode === 'apps') return;

  screensaverState.currentMode = 'apps';
  screensaverState.appIndex = 0;

  // Stop background image rotation
  if (screensaverState.intervalId) {
    clearInterval(screensaverState.intervalId);
    screensaverState.intervalId = null;
  }

  // Create app preview cards if not already created
  if (!screensaverState.appCards.length) {
    createAppPreviewCards();
  }

  // Add class for solid background
  screensaverEl.classList.add("showing-apps");

  // Hide screensaver layers and simple hint
  screensaverLayer1.classList.remove("active");
  screensaverLayer2.classList.remove("active");
  screensaverBlur1.classList.remove("active");
  screensaverBlur2.classList.remove("active");

  const simpleHintEl = document.getElementById("simpleHint");
  const appPreviewEl = document.getElementById("appPreview");
  const ctaEl = document.querySelector(".attract-mode__cta");
  const bannerEl = document.querySelector(".attract-mode__banner");

  if (simpleHintEl) simpleHintEl.style.display = "none";
  if (appPreviewEl) appPreviewEl.style.display = "flex";
  if (ctaEl) ctaEl.style.display = "block";
  if (bannerEl) bannerEl.style.display = "flex";

  updateAppPreview();

  // App preview rotation (every 5 seconds)
  screensaverState.appIntervalId = setInterval(() => {
    screensaverState.appIndex = (screensaverState.appIndex + 1) % screensaverState.appCards.length;
    updateAppPreview();
  }, APP_PREVIEW_ADVANCE_MS);

  // After 10 minutes, switch back to screensaver
  screensaverState.modeSwitchTimerId = setTimeout(() => {
    switchToImageMode();
  }, MODE_SWITCH_DELAY_MS);
}

// Switch to screensaver image mode
function switchToImageMode() {
  if (!screensaverState.active || screensaverState.currentMode === 'images') return;

  screensaverState.currentMode = 'images';
  screensaverState.index = 0;

  // Stop app rotation
  if (screensaverState.appIntervalId) {
    clearInterval(screensaverState.appIntervalId);
    screensaverState.appIntervalId = null;
  }

  // Remove class for solid background
  screensaverEl.classList.remove("showing-apps");

  // Hide app preview, CTA, and banner
  const simpleHintEl = document.getElementById("simpleHint");
  const appPreviewEl = document.getElementById("appPreview");
  const ctaEl = document.querySelector(".attract-mode__cta");
  const bannerEl = document.querySelector(".attract-mode__banner");

  if (appPreviewEl) appPreviewEl.style.display = "none";
  if (ctaEl) ctaEl.style.display = "none";
  if (bannerEl) bannerEl.style.display = "none";
  if (simpleHintEl) simpleHintEl.style.display = "block";

  // Hide all app cards
  screensaverState.appCards.forEach((card) => {
    card.classList.remove("active");
  });

  // Show screensaver images
  updateScreensaverImage();

  // Background image rotation (every 8 seconds)
  screensaverState.intervalId = setInterval(() => {
    screensaverState.index = (screensaverState.index + 1) % screensaverState.images.length;
    updateScreensaverImage();
  }, SCREENSAVER_ADVANCE_MS);

  // After 10 minutes, switch to app mode
  screensaverState.modeSwitchTimerId = setTimeout(() => {
    switchToAppMode();
  }, MODE_SWITCH_DELAY_MS);
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
  screensaverState.currentMode = 'images';
  screensaverState.index = 0;

  // Show simple hint, hide app previews, CTA, and banner initially
  const simpleHintEl = document.getElementById("simpleHint");
  const appPreviewEl = document.getElementById("appPreview");
  const ctaEl = document.querySelector(".attract-mode__cta");
  const bannerEl = document.querySelector(".attract-mode__banner");

  if (simpleHintEl) simpleHintEl.style.display = "block";
  if (appPreviewEl) appPreviewEl.style.display = "none";
  if (ctaEl) ctaEl.style.display = "none";
  if (bannerEl) bannerEl.style.display = "none";

  updateScreensaverImage();
  screensaverEl.classList.remove("hidden");

  // Background image rotation (every 8 seconds)
  screensaverState.intervalId = setInterval(() => {
    screensaverState.index = (screensaverState.index + 1) % screensaverState.images.length;
    updateScreensaverImage();
  }, SCREENSAVER_ADVANCE_MS);

  // After 10 minutes, switch to app mode (starts the cycle)
  screensaverState.modeSwitchTimerId = setTimeout(() => {
    switchToAppMode();
  }, MODE_SWITCH_DELAY_MS);
}

function deactivateScreensaver() {
  if (!screensaverState.active) return;
  screensaverState.active = false;
  screensaverState.currentMode = 'images';

  // Play wake-up sound feedback
  audioManager.playTap();

  // Clear all timers
  if (screensaverState.intervalId) {
    clearInterval(screensaverState.intervalId);
    screensaverState.intervalId = null;
  }

  if (screensaverState.appIntervalId) {
    clearInterval(screensaverState.appIntervalId);
    screensaverState.appIntervalId = null;
  }

  if (screensaverState.modeSwitchTimerId) {
    clearTimeout(screensaverState.modeSwitchTimerId);
    screensaverState.modeSwitchTimerId = null;
  }

  screensaverEl.classList.add("hidden");
  screensaverEl.classList.remove("showing-apps");

  // Clean up all layers (main + blur)
  screensaverLayer1.classList.remove("active");
  screensaverLayer2.classList.remove("active");
  screensaverBlur1.classList.remove("active");
  screensaverBlur2.classList.remove("active");
  screensaverState.currentLayer = 1;

  // Hide all app cards
  screensaverState.appCards.forEach((card) => {
    card.classList.remove("active");
  });

  // Hide app preview container and simple hint
  const appPreviewEl = document.getElementById("appPreview");
  const simpleHintEl = document.getElementById("simpleHint");
  const ctaEl = document.querySelector(".attract-mode__cta");
  const bannerEl = document.querySelector(".attract-mode__banner");

  if (appPreviewEl) appPreviewEl.style.display = "none";
  if (simpleHintEl) simpleHintEl.style.display = "none";
  if (ctaEl) ctaEl.style.display = "none";
  if (bannerEl) bannerEl.style.display = "none";
}

function handleUserActivity() {
  if (screensaverState.active) deactivateScreensaver();
  resetScreensaverTimer();
}

async function loadScreensaverImages() {
  if (screensaverState.images.length || screensaverState.loading) {
    return screensaverState.images;
  }
  screensaverState.loading = true;
  try {
    const res = await fetch("/__screensaver", { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    screensaverState.images = Array.isArray(data.images) ? data.images : [];
  } catch (err) {
    console.error("Failed to load screensaver images", err);
  } finally {
    screensaverState.loading = false;
  }
  return screensaverState.images;
}

function updateScreensaverImage() {
  if (!screensaverState.images.length) return;
  const src = screensaverState.images[screensaverState.index];

  // Determine which layer to activate (crossfade)
  const activeLayer = screensaverState.currentLayer === 1 ? screensaverLayer1 : screensaverLayer2;
  const inactiveLayer = screensaverState.currentLayer === 1 ? screensaverLayer2 : screensaverLayer1;
  const activeBlur = screensaverState.currentLayer === 1 ? screensaverBlur1 : screensaverBlur2;
  const inactiveBlur = screensaverState.currentLayer === 1 ? screensaverBlur2 : screensaverBlur1;

  // Set the new image on both main layer and blur layer
  activeLayer.style.backgroundImage = `url(${src})`;
  activeBlur.style.backgroundImage = `url(${src})`;

  // Remove active class from inactive layers
  inactiveLayer.classList.remove("active");
  inactiveBlur.classList.remove("active");

  // Activate new layers
  activeLayer.classList.add("active");
  activeBlur.classList.add("active");

  // Toggle layer for next image
  screensaverState.currentLayer = screensaverState.currentLayer === 1 ? 2 : 1;
}

// Setup navigation buttons
function setupNavigation() {
  const navLeaderboard = document.getElementById("navLeaderboard");
  const navStatistics = document.getElementById("navStatistics");

  console.log("Setting up navigation buttons:", { navLeaderboard, navStatistics });

  const handleNavClick = (pageId, buttonName) => {
    return (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log(`${buttonName} button clicked`);
      openNavigationPage(pageId);
    };
  };

  if (navLeaderboard) {
    navLeaderboard.addEventListener("click", handleNavClick("leaderboard", "Leaderboard"));
    navLeaderboard.addEventListener("touchstart", handleNavClick("leaderboard", "Leaderboard"), { passive: false });
    navLeaderboard.addEventListener("keydown", (evt) => {
      if (evt.key === "Enter" || evt.key === " ") {
        evt.preventDefault();
        openNavigationPage("leaderboard");
      }
    });
  } else {
    console.error("navLeaderboard button not found!");
  }

  if (navStatistics) {
    navStatistics.addEventListener("click", handleNavClick("statistics", "Statistics"));
    navStatistics.addEventListener("touchstart", handleNavClick("statistics", "Statistics"), { passive: false });
    navStatistics.addEventListener("keydown", (evt) => {
      if (evt.key === "Enter" || evt.key === " ") {
        evt.preventDefault();
        openNavigationPage("statistics");
      }
    });
  } else {
    console.error("navStatistics button not found!");
  }
}

// Init
function init() {
  initTheme();
  setupActivityCards();
  setupNavigation();
  initClock();
  setupControls();
  initBanner();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
