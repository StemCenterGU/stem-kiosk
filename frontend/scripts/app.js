const activities = [
  {
    id: "stem2048",
    title: "Fusion 2048",
    short: "Merge number tiles to unlock science insights.",
    blurb: "Slide energy tiles together, reach new fusion milestones, and collect STEM facts as you climb.",
    bannerTone: "#0ea5e9",
    bannerImage: "linear-gradient(120deg, rgba(14,165,233,0.7), rgba(59,130,246,0.35))",
    module: () => import("./modules/stem2048.js"),
  },
  {
    id: "missionQuiz",
    title: "Mission Control Quiz",
    short: "Launch your rocket with rapid-fire STEM trivia.",
    blurb: "Answer timed engineering questions, earn mission badges, and push your crew toward orbit.",
    bannerTone: "#22c55e",
    bannerImage: "linear-gradient(140deg, rgba(34,197,94,0.7), rgba(16,185,129,0.35))",
    module: () => import("./modules/missionQuiz.js"),
  },
  {
    id: "teamsGuide",
    title: "📄 MS Team Instructions",
    short: "Learn Microsoft Teams notification settings.",
    blurb: "Step-by-step guide to configure Microsoft Teams notifications for optimal productivity.",
    bannerTone: "#6366f1",
    bannerImage: "linear-gradient(135deg, rgba(99,102,241,0.7), rgba(139,92,246,0.35))",
    module: () => import("./modules/pdfViewer.js"),
    pdfUrl: "ms team instructions.pdf",
  },
];

console.log('STEM Kiosk script loaded with', activities.length, 'activities');

const state = {
  activeIndex: 0,
  intervalId: null,
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

const slideshowEl = document.getElementById("slideshow");
const indicatorsEl = document.getElementById("heroIndicators");
const gridEl = document.getElementById("activityGrid");
const activityView = document.getElementById("activityView");
const activityFrame = document.getElementById("activityFrame");
const activityTitle = document.getElementById("activityTitle");
const homeButton = document.getElementById("homeButton");
const exitActivityButton = document.getElementById("exitActivityButton");
const muteButton = document.getElementById("muteButton");
const restartButton = document.getElementById("restartButton");
const exitKioskButton = document.getElementById("exitKioskButton");

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

let screensaverOverlay = null;
let screensaverImage = null;

function buildSlideshow() {
  slideshowEl.style.width = `${activities.length * 100}%`;
  slideshowEl.innerHTML = "";
  indicatorsEl.innerHTML = "";
  activities.forEach((activity, index) => {
    const slide = document.createElement("article");
    slide.className = "slide";
    slide.style.backgroundImage = activity.bannerImage;
    slide.dataset.activityId = activity.id;
    slide.innerHTML = `
      <div class="slide-content">
        <h2>${activity.title}</h2>
        <p>${activity.blurb}</p>
        <span class="slide-cta">Tap to start ></span>
      </div>
    `;
    slide.addEventListener("click", () => openActivity(activity.id));
    slide.addEventListener("keydown", (evt) => {
      if (evt.key === "Enter" || evt.key === " ") {
        evt.preventDefault();
        openActivity(activity.id);
      }
    });
    slide.setAttribute("tabindex", "0");
    slideshowEl.appendChild(slide);

    const indicator = document.createElement("button");
    indicator.className = "indicator";
    indicator.type = "button";
    indicator.setAttribute("aria-label", `Go to ${activity.title}`);
    indicator.addEventListener("click", () => {
      state.activeIndex = index;
      updateSlidePosition();
      resetSlideshowTimer();
    });
    indicatorsEl.appendChild(indicator);
  });
}

function updateSlidePosition() {
  slideshowEl.style.transform = `translateX(-${state.activeIndex * 100}%)`;
  [...indicatorsEl.children].forEach((child, idx) => {
    child.classList.toggle("active", idx === state.activeIndex);
  });
}

function startSlideshow() {
  stopSlideshow();
  state.intervalId = setInterval(() => {
    state.activeIndex = (state.activeIndex + 1) % activities.length;
    updateSlidePosition();
  }, 9000);
}

function stopSlideshow() {
  if (state.intervalId) {
    clearInterval(state.intervalId);
    state.intervalId = null;
  }
}

function resetSlideshowTimer() {
  stopSlideshow();
  startSlideshow();
}

function buildActivityGrid() {
  gridEl.innerHTML = "";
  console.log('Building activity grid with', activities.length, 'activities');
  console.log('Activities:', activities.map(a => a.title));
  
  activities.forEach((activity, index) => {
    try {
      console.log(`Creating tile ${index + 1} for:`, activity.title, 'ID:', activity.id);
      const tile = document.createElement("article");
      tile.className = "tile";
      tile.dataset.activityId = activity.id;
      tile.style.setProperty("--tile-accent", activity.bannerTone);
      
      // Special styling for PDF viewer
      if (activity.id === 'teamsGuide') {
        tile.style.border = '2px solid #6366f1';
        tile.style.boxShadow = '0 0 20px rgba(99, 102, 241, 0.3)';
      }
      
      tile.innerHTML = `
        <h3>${activity.title}</h3>
        <p>${activity.short}</p>
        <span class="slide-cta" style="background:${activity.bannerTone};color:#020617;justify-content:center;">${activity.id === 'teamsGuide' ? '📄 View PDF' : 'Launch'}</span>
      `;
      tile.addEventListener("click", () => openActivity(activity.id));
      tile.addEventListener("keydown", (evt) => {
        if (evt.key === "Enter" || evt.key === " ") {
          evt.preventDefault();
          openActivity(activity.id);
        }
      });
      tile.setAttribute("tabindex", "0");
      gridEl.appendChild(tile);
      console.log(`Tile ${index + 1} added to grid successfully`);
    } catch (error) {
      console.error(`Error creating tile ${index + 1} for ${activity.title}:`, error);
    }
  });
  
  console.log('Grid build complete. Total tiles:', gridEl.children.length);
}

async function openActivity(activityId) {
  await audioManager.playTap();
  const selected = activities.find((activity) => activity.id === activityId);
  if (!selected) return;
  activityTitle.textContent = selected.title;
  gridEl.classList.add("hidden");
  activityView.classList.remove("hidden");
  homeButton.disabled = true;
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
  } finally {
    homeButton.disabled = false;
  }
}

function closeActivity() {
  if (state.mountedActivity && typeof state.mountedActivity.destroy === "function") {
    state.mountedActivity.destroy();
  }
  state.mountedActivity = null;
  activityFrame.innerHTML = "";
  activityView.classList.add("hidden");
  gridEl.classList.remove("hidden");
}

function initClock() {
  const clockEl = document.getElementById("clock");
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
  homeButton.addEventListener("click", () => {
    closeActivity();
    audioManager.playTap();
  });
  exitActivityButton.addEventListener("click", () => {
    closeActivity();
    audioManager.playTap();
  });
  muteButton.addEventListener("click", async () => {
    const enabled = audioManager.toggle();
    muteButton.textContent = enabled ? "Sound On" : "Muted";
    muteButton.setAttribute("aria-pressed", (!enabled).toString());
    if (enabled) {
      await audioManager.playTap();
    }
  });

  if (restartButton) {
    restartButton.addEventListener("click", () => {
      triggerWithTap(() => {
        // Clear all caches and force reload
        if ('caches' in window) {
          caches.keys().then(names => {
            names.forEach(name => caches.delete(name));
          });
        }
        
        // Clear localStorage and sessionStorage
        localStorage.clear();
        sessionStorage.clear();
        
        // Force hard reload with cache busting
        const timestamp = Date.now();
        const cleanUrl = window.location.href.split("#")[0];
        window.location.replace(`${cleanUrl}?v=${timestamp}&t=${Math.random()}`);
      });
    });
  }

  if (exitKioskButton) {
    exitKioskButton.addEventListener("click", () => {
      triggerWithTap(() => requestKioskExit());
    });
  }

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      stopSlideshow();
    } else {
      startSlideshow();
    }
  });

  setupScreensaver();
}

function init() {
  buildSlideshow();
  buildActivityGrid();
  updateSlidePosition();
  startSlideshow();
  initClock();
  registerControls();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

function triggerWithTap(action) {
  return Promise.resolve()
    .then(() => audioManager.playTap())
    .catch((err) => {
      console.warn("Audio feedback unavailable", err);
    })
    .then(() => {
      if (typeof action === "function") {
        return action();
      }
      return action;
    })
    .catch((err) => {
      console.error("Utility action failed", err);
    });
}

function showExitInstructions() {
  const overlay = document.getElementById("exitOverlay");
  if (overlay) {
    overlay.classList.remove("hidden");
    return;
  }

  const exitOverlay = document.createElement("div");
  exitOverlay.id = "exitOverlay";
  exitOverlay.className = "exit-overlay";
  exitOverlay.innerHTML = `
    <div class="exit-dialog">
      <h3>Need to exit the kiosk?</h3>
      <p>Use the system controls to close Chromium:</p>
      <ul>
        <li><span class="key-hint">Alt</span> + <span class="key-hint">F4</span></li>
        <li>Tap the desktop <strong>STEM Discovery Kiosk</strong> icon to relaunch.</li>
      </ul>
      <button id="closeExitOverlay" class="secondary-btn">Stay in Kiosk</button>
    </div>
  `;
  document.body.appendChild(exitOverlay);
  const closeBtn = document.getElementById("closeExitOverlay");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      exitOverlay.classList.add("hidden");
    });
  }
}

async function requestKioskExit() {
  try {
    const response = await fetch("/__control?action=exit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action: "exit" }),
    });
    if (!response.ok) {
      throw new Error(`Control endpoint returned ${response.status}`);
    }
    // Give Chromium a moment to process shutdown.
    setTimeout(() => {
      showExitInstructions();
    }, 800);
  } catch (err) {
    console.error("Exit request failed", err);
    showExitInstructions();
  }
}

function setupScreensaver() {
  if (!screensaverOverlay) {
    screensaverOverlay = document.createElement("div");
    screensaverOverlay.id = "screensaverOverlay";
    screensaverOverlay.className = "screensaver-overlay hidden";
    screensaverOverlay.innerHTML = `
      <div class="screensaver-frame">
        <img id="screensaverImage" alt="Screensaver slideshow" />
      </div>
    `;
    document.body.appendChild(screensaverOverlay);
    screensaverImage = document.getElementById("screensaverImage");
    screensaverOverlay.addEventListener("click", handleUserActivity);
  }

  const activityEvents = ["mousemove", "mousedown", "keydown", "touchstart", "wheel"];
  activityEvents.forEach((evt) => {
    document.addEventListener(evt, handleUserActivity, { passive: evt === "touchstart" || evt === "wheel" });
  });

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
  stopSlideshow();
  closeActivity();
  screensaverState.active = true;
  screensaverState.index = 0;
  updateScreensaverImage();
  screensaverOverlay.classList.remove("hidden");
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
  screensaverOverlay.classList.add("hidden");
  startSlideshow();
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
  if (!screensaverImage || !screensaverState.images.length) return;
  const src = screensaverState.images[screensaverState.index];
  screensaverImage.src = src;
}
