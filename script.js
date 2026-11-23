const bubbleLayer = document.querySelector(".bubble-layer");
const confettiLayer = document.querySelector(".confetti-layer");
const views = [...document.querySelectorAll(".view")];
const pawCursor = document.querySelector(".paw-cursor");
const bubbleTransition = document.querySelector(".bubble-transition");
const formView = document.querySelector(".form-view");
const googleEmbed = formView.querySelector("iframe");
const embedButtons = formView.querySelectorAll("[data-embed]");
let activeEmbedPair = "one";
const embedSources = {
  one: {
    form: "https://docs.google.com/forms/d/e/1FAIpQLSe2ogIm7tbw0D5VBYoz-KBFnjT5TKmGe0Rc_pvP8KjWvE0m-g/viewform?embedded=true",
    sheet: "https://docs.google.com/spreadsheets/d/12kNb8gHsN_EfBI_O76SBDG-0avNjnYn_mZ2_Cz7-xtU/edit?usp=drivesdk&embedded=true&rm=minimal",
  },
  two: {
    form: "https://forms.gle/TJ4GkLc77uZC3vtbA",
    sheet: "https://docs.google.com/spreadsheets/d/1saTOnuUznrUwD2aipkfbP9cTCKvzDsT6XioAtTXC4os/edit?usp=drivesdk&embedded=true&rm=minimal",
  },
};

const menuDoodles = document.querySelector(".menu-doodles");
document.querySelectorAll(".biodata-view, .gallery-view").forEach((view) => {
  const pageDoodles = menuDoodles.cloneNode(true);
  pageDoodles.classList.add("page-doodles");
  view.prepend(pageDoodles);
});

// Show a helpful surface until each locally supplied media file is available.
document.querySelectorAll(".media-window").forEach((frame) => {
  const image = frame.querySelector("img");
  const video = frame.querySelector("video");

  if (image) {
    const syncImageState = () => {
      frame.classList.toggle("is-empty", !image.complete || image.naturalWidth === 0);
    };
    image.addEventListener("load", syncImageState);
    image.addEventListener("error", syncImageState);
    syncImageState();
  }

  if (video) {
    const syncVideoState = () => {
      // Keep the placeholder until the browser has a decoded frame to display.
      frame.classList.toggle("is-empty", video.readyState < 2);
    };
    video.addEventListener("loadeddata", syncVideoState);
    video.addEventListener("canplay", syncVideoState);
    video.addEventListener("error", syncVideoState);
    syncVideoState();
  }
});

if (window.matchMedia("(pointer: fine)").matches && pawCursor) {
  document.body.classList.add("custom-cursor-enabled");
  window.addEventListener("pointermove", (event) => {
    pawCursor.style.left = `${event.clientX}px`;
    pawCursor.style.top = `${event.clientY}px`;
    pawCursor.classList.add("is-visible");
  });
  window.addEventListener("pointerdown", () => {
    pawCursor.classList.remove("is-clicking");
    void pawCursor.offsetWidth;
    pawCursor.classList.add("is-clicking");
  });
  pawCursor.addEventListener("animationend", (event) => {
    if (event.animationName === "paw-tap") pawCursor.classList.remove("is-clicking");
  });
  window.addEventListener("blur", () => pawCursor.classList.remove("is-visible"));
  window.addEventListener("focus", () => pawCursor.classList.add("is-visible"));
}

for (let i = 0; i < 22; i += 1) {
  const bubble = document.createElement("span");
  bubble.className = "bubble";
  bubble.setAttribute("aria-hidden", "true");
  bubble.style.left = `${Math.random() * 100}%`;
  bubble.style.setProperty("--size", `${12 + Math.random() * 34}px`);
  bubble.style.setProperty("--duration", `${11 + Math.random() * 15}s`);
  bubble.style.setProperty("--delay", `${-Math.random() * 24}s`);
  bubble.style.setProperty("--drift", `${-65 + Math.random() * 130}px`);
  bubbleLayer.append(bubble);
}

const confettiColors = ["#fff0a8", "#ffffff", "#ffd2d9", "#c8f5ec", "#d8d1ff", "#ffd6a1"];
for (let i = 0; i < 48; i += 1) {
  const piece = document.createElement("span");
  piece.className = "confetti";
  piece.setAttribute("aria-hidden", "true");
  piece.style.setProperty("--left", `${Math.random() * 100}%`);
  piece.style.setProperty("--width", `${4 + Math.random() * 5}px`);
  piece.style.setProperty("--height", `${7 + Math.random() * 8}px`);
  piece.style.setProperty("--color", confettiColors[Math.floor(Math.random() * confettiColors.length)]);
  piece.style.setProperty("--duration", `${8 + Math.random() * 12}s`);
  piece.style.setProperty("--delay", `${-Math.random() * 20}s`);
  piece.style.setProperty("--turn", `${Math.random() * 360}deg`);
  piece.style.setProperty("--sway", `${-80 + Math.random() * 160}px`);
  confettiLayer.append(piece);
}

function showView(name) {
  const current = document.querySelector(".view.is-active");
  const next = views.find((view) => view.dataset.view === name);
  if (!current || !next || current === next) return;

  const movingForward = views.indexOf(next) > views.indexOf(current);
  const leavingClass = movingForward ? "is-past" : "is-future";
  const enteringClass = movingForward ? "is-future" : "is-past";

  current.classList.remove("is-active");
  current.classList.add(leavingClass, "is-leaving");
  current.setAttribute("aria-hidden", "true");

  next.classList.remove("is-past", "is-future");
  next.classList.add(enteringClass, "is-entering");
  next.setAttribute("aria-hidden", "false");
  void next.offsetWidth;
  next.classList.remove(enteringClass);
  next.classList.add("is-active");

  window.setTimeout(() => {
    current.classList.remove("is-past", "is-future", "is-leaving");
    next.classList.remove("is-entering");
  }, 720);
}

document.querySelectorAll("[data-open]").forEach((button) => {
  button.addEventListener("click", () => showView(button.dataset.open));
});

document.querySelectorAll("[data-form-pair]").forEach((button) => {
  button.addEventListener("click", () => {
    activeEmbedPair = button.dataset.formPair;
    setEmbedMode("form");
    showView("google-tools");
  });
});

function showThroughBubbles(name) {
  if (bubbleTransition.classList.contains("is-covering")) return;
  bubbleTransition.replaceChildren();

  const columns = window.innerWidth < 600 ? 4 : 6;
  const rows = 4;
  const cellSize = Math.max(window.innerWidth / columns, window.innerHeight / rows);
  const bubbleSize = Math.max(72, Math.min(330, cellSize * 1.8));

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const bubble = document.createElement("span");
      bubble.className = "transition-bubble";
      bubble.style.setProperty("--size", `${bubbleSize * (.94 + Math.random() * .12)}px`);
      bubble.style.setProperty("--left", `${((column + .5 + (Math.random() - .5) * .06) / columns) * 100}%`);
      bubble.style.setProperty("--top", `${((row + .5 + (Math.random() - .5) * .06) / rows) * 100}%`);
      bubble.style.setProperty("--delay", `${Math.random() * .42}s`);
      bubble.style.setProperty("--clear-delay", `${Math.random() * .28}s`);
      bubble.style.setProperty("--start-x", `${-80 + Math.random() * 160}px`);
      bubble.style.setProperty("--start-y", `${-90 + Math.random() * 180}px`);
      bubble.style.setProperty("--drift-x", `${-130 + Math.random() * 260}px`);
      bubble.style.setProperty("--drift-y", `${-180 + Math.random() * 240}px`);
      bubbleTransition.append(bubble);
    }
  }

  void bubbleTransition.offsetWidth;
  bubbleTransition.classList.add("is-covering");
  window.setTimeout(() => {
    showView(name);
    bubbleTransition.classList.remove("is-covering");
    bubbleTransition.classList.add("is-clearing");
    window.setTimeout(() => {
      bubbleTransition.classList.remove("is-clearing");
      bubbleTransition.replaceChildren();
    }, 1250);
  }, 1220);
}

document.querySelectorAll("[data-bubble-transition]").forEach((button) => {
  button.addEventListener("click", () => showThroughBubbles(button.dataset.bubbleTransition));
});

function setEmbedMode(mode) {
  googleEmbed.src = embedSources[activeEmbedPair][mode];
  googleEmbed.title = mode === "form" ? "Google Form" : "Google Spreadsheet";
  embedButtons.forEach((button) => {
    const isSelected = button.dataset.embed === mode;
    button.classList.toggle("is-selected", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
  });
}

embedButtons.forEach((button) => {
  button.addEventListener("click", () => setEmbedMode(button.dataset.embed));
});

