const sessionTitles = new Map([
  ["about", ":   shuyu (suri) peng"],
  ["graphics", "graphics"],
  ["mograph", "mograph"],
]);

const activeTitle = document.querySelector("[data-active-title]");
const activeMark = document.querySelector("[data-active-mark]");
const activeTagline = document.querySelector("[data-active-tagline]");
const activeHeader = document.querySelector("[data-active-session]");
const page = document.querySelector(".page");
const nav = document.querySelector(".nav");
const panels = [...document.querySelectorAll("[data-panel]")];
const buttons = [...document.querySelectorAll("[data-session]")];
const popup = document.querySelector("[data-image-popup]");
const popupImage = document.querySelector("[data-popup-image]");
const popupCloseButtons = [...document.querySelectorAll("[data-popup-close]")];
let activeSession = activeHeader?.dataset.activeSession || "about";
let isSwitching = false;

const transitionMs = 420;

function setActiveHeader(session) {
  activeHeader.dataset.activeSession = session;
  activeTitle.textContent = sessionTitles.get(session);
  activeMark.hidden = session === "about";
  activeTagline.hidden = session !== "about";
}

function makeFlyer(source, start, end) {
  if (!source || !start || !end) {
    return null;
  }

  const flyer = source.cloneNode(true);

  flyer.hidden = false;
  flyer.classList.add("session-flyer");
  flyer.style.left = `${start.left}px`;
  flyer.style.top = `${start.top}px`;
  flyer.style.width = `${start.width}px`;
  flyer.style.height = `${start.height}px`;
  document.body.append(flyer);

  requestAnimationFrame(() => {
    flyer.style.left = `${end.left}px`;
    flyer.style.top = `${end.top}px`;
    flyer.style.width = `${end.width}px`;
    flyer.style.height = `${end.height}px`;
  });

  return flyer;
}

function getBottomRowTarget() {
  const navBox = nav.getBoundingClientRect();
  return {
    left: navBox.left,
    top: navBox.bottom - 40,
    width: navBox.width,
    height: 40,
  };
}

function showSession(nextSession) {
  if (!sessionTitles.has(nextSession) || nextSession === activeSession || isSwitching) {
    return;
  }

  const previousSession = activeSession;
  const previousPanel = panels.find((panel) => panel.dataset.panel === previousSession);
  const nextPanel = panels.find((panel) => panel.dataset.panel === nextSession);
  const previousButton = buttons.find((button) => button.dataset.session === previousSession);
  const nextButton = buttons.find((button) => button.dataset.session === nextSession);
  const headerBox = activeHeader.getBoundingClientRect();
  const incomingFlyer = nextButton
    ? makeFlyer(nextButton, nextButton.getBoundingClientRect(), headerBox)
    : null;
  const outgoingFlyer = previousButton
    ? makeFlyer(previousButton, headerBox, getBottomRowTarget())
    : null;

  isSwitching = true;
  page.classList.add("is-switching");
  activeSession = nextSession;

  window.scrollTo({ top: 0, behavior: "smooth" });

  if (previousPanel) {
    previousPanel.classList.remove("panel--active", "panel--entering");
    previousPanel.classList.add("panel--leaving");
  }

  if (nextPanel) {
    nextPanel.classList.remove("panel--leaving");
    nextPanel.classList.add("panel--active", "panel--entering");
  }

  if (nextButton) {
    nextButton.style.visibility = "hidden";
  }

  setTimeout(() => {
    setActiveHeader(nextSession);

    panels.forEach((panel) => {
      panel.classList.remove("panel--entering", "panel--leaving");
      panel.classList.toggle("panel--active", panel.dataset.panel === nextSession);
    });

    incomingFlyer?.remove();
    outgoingFlyer?.remove();

    if (previousButton) {
      previousButton.hidden = false;
      nav.append(previousButton);
    }

    if (nextButton) {
      nextButton.style.visibility = "";
      nextButton.hidden = true;
    }

    page.classList.remove("is-switching");
    isSwitching = false;
  }, transitionMs);
}

function syncInitialState() {
  setActiveHeader(activeSession);

  panels.forEach((panel) => {
    panel.classList.toggle("panel--active", panel.dataset.panel === activeSession);
  });

  buttons.forEach((button) => {
    button.hidden = button.dataset.session === activeSession;
  });

  const hiddenActiveButton = buttons.find((button) => button.dataset.session === activeSession);
  if (hiddenActiveButton) {
    nav.append(hiddenActiveButton);
  }
}

syncInitialState();

buttons.forEach((button) => {
  button.addEventListener("click", () => showSession(button.dataset.session));
});

function openImagePopup(image) {
  if (!popup || !popupImage || !image) {
    return;
  }

  popupImage.src = image.currentSrc || image.src;
  popupImage.alt = image.alt || "Image preview";
  popup.hidden = false;
}

function closeImagePopup() {
  if (!popup || !popupImage) {
    return;
  }

  popup.hidden = true;
  popupImage.removeAttribute("src");
  popupImage.alt = "";
}

document.querySelectorAll(".graphic-item img").forEach((image) => {
  image.addEventListener("click", () => openImagePopup(image));
});

popupCloseButtons.forEach((button) => {
  button.addEventListener("click", closeImagePopup);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && popup && !popup.hidden) {
    closeImagePopup();
  }
});
