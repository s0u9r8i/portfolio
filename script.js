const sessionTitles = new Map([
  ["about", ":   shuyu (suri) peng"],
  ["graphics", "graphics"],
  ["uiux", "ui ux cases (mobile)"],
  ["mograph", "mograph"],
]);

const activeSessionStorageKey = "suriPortfolio.activeSession";
const activeProjectStorageKey = "suriPortfolio.activeProjects";
const scrollPositionStorageKey = "suriPortfolio.scrollPosition";

if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

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
const projectTabs = [...document.querySelectorAll("[data-project-tab]")];
const topProjectMenus = [...document.querySelectorAll("[data-project-tabs]")];
const bottomProjectMenus = [...document.querySelectorAll(".project-tabs--bottom")];
const emailCopyButton = document.querySelector("[data-email-copy]");
let isSwitching = false;
let lastScrollY = window.scrollY;
let isBottomProjectMenuVisible = false;
let scrollSaveTimer;
let isRestoringScroll = false;

const transitionMs = 420;

function getStoredActiveSession() {
  try {
    const storedSession = localStorage.getItem(activeSessionStorageKey);
    return sessionTitles.has(storedSession) ? storedSession : null;
  } catch (error) {
    return null;
  }
}

function storeActiveSession(session) {
  try {
    localStorage.setItem(activeSessionStorageKey, session);
  } catch (error) {
    // Local file previews can block storage in some browsers.
  }
}

function getStoredActiveProjects() {
  try {
    return JSON.parse(localStorage.getItem(activeProjectStorageKey) || "{}");
  } catch (error) {
    return {};
  }
}

function storeActiveProject(projectGroup, projectName) {
  const panel = projectGroup.closest("[data-panel]");
  const panelName = panel?.dataset.panel;

  if (!panelName) {
    return;
  }

  try {
    const projects = getStoredActiveProjects();
    projects[panelName] = projectName;
    localStorage.setItem(activeProjectStorageKey, JSON.stringify(projects));
  } catch (error) {
    // Local file previews can block storage in some browsers.
  }
}

function getStoredScrollPosition() {
  try {
    const storedPosition = Number(localStorage.getItem(scrollPositionStorageKey));
    return Number.isFinite(storedPosition) && storedPosition >= 0 ? storedPosition : null;
  } catch (error) {
    return null;
  }
}

function storeScrollPosition(position = window.scrollY) {
  try {
    localStorage.setItem(scrollPositionStorageKey, String(Math.max(0, Math.round(position))));
  } catch (error) {
    // Local file previews can block storage in some browsers.
  }
}

function queueScrollPositionSave() {
  if (isRestoringScroll) {
    return;
  }

  window.clearTimeout(scrollSaveTimer);
  scrollSaveTimer = window.setTimeout(() => storeScrollPosition(), 120);
}

function setProjectGroup(projectGroup, projectName) {
  projectGroup.querySelectorAll("[data-project-tab]").forEach((groupTab) => {
    const isTopTab = !groupTab.closest(".project-tabs--bottom");
    const isActive = isTopTab && groupTab.dataset.projectTab === projectName;
    groupTab.classList.toggle("project-card--active", isActive);
    groupTab.setAttribute("aria-selected", String(isActive));
  });

  projectGroup.querySelectorAll("[data-project-panel]").forEach((panel) => {
    panel.classList.toggle("project-panel--active", panel.dataset.projectPanel === projectName);
  });
}

function syncInitialProjects() {
  const storedProjects = getStoredActiveProjects();

  document.querySelectorAll("[data-project-group]").forEach((projectGroup) => {
    const panelName = projectGroup.closest("[data-panel]")?.dataset.panel;
    const storedProject = panelName ? storedProjects[panelName] : null;
    const fallbackProject = projectGroup.querySelector("[data-project-tab]")?.dataset.projectTab;
    const projectName = projectGroup.querySelector(`[data-project-panel="${storedProject}"]`)
      ? storedProject
      : fallbackProject;

    if (projectName) {
      setProjectGroup(projectGroup, projectName);
    }
  });
}

function scrollToPageTop() {
  window.scrollTo(0, 0);
  storeScrollPosition(0);
}

function restoreStoredScrollPosition() {
  const storedPosition = getStoredScrollPosition();

  if (storedPosition === null) {
    storeScrollPosition(0);
    return;
  }

  isRestoringScroll = true;

  const restore = () => {
    window.scrollTo(0, storedPosition);
    lastScrollY = window.scrollY;
    updateProjectMenuVisibility();
  };

  requestAnimationFrame(() => {
    restore();
    window.setTimeout(() => {
      restore();
      isRestoringScroll = false;
    }, 120);
  });
}

let activeSession = getStoredActiveSession() || activeHeader?.dataset.activeSession || "about";

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
  isBottomProjectMenuVisible = false;
  topProjectMenus.forEach((menu) => menu.classList.remove("project-tabs--hidden"));
  page.classList.add("is-switching");
  activeSession = nextSession;
  storeActiveSession(nextSession);

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
syncInitialProjects();
storeActiveSession(activeSession);
restoreStoredScrollPosition();

window.addEventListener("load", restoreStoredScrollPosition);
window.addEventListener("pageshow", restoreStoredScrollPosition);

buttons.forEach((button) => {
  button.addEventListener("click", () => showSession(button.dataset.session));
});

function showProject(tab) {
  const projectGroup = tab.closest("[data-project-group]");
  const projectName = tab.dataset.projectTab;

  if (!projectGroup || !projectName) {
    return;
  }

  isBottomProjectMenuVisible = false;
  projectGroup.querySelectorAll("[data-project-tabs]").forEach((menu) => {
    menu.classList.remove("project-tabs--hidden");
  });

  setProjectGroup(projectGroup, projectName);
  storeActiveProject(projectGroup, projectName);

  window.scrollTo({ top: 0, behavior: "smooth" });
}

projectTabs.forEach((tab) => {
  tab.addEventListener("click", () => showProject(tab));
});

function updateProjectMenuVisibility() {
  const currentScrollY = window.scrollY;
  const scrollDelta = currentScrollY - lastScrollY;
  const isScrollingDown = scrollDelta > 1;
  const isScrollingUp = scrollDelta < -1;
  const activeBottomVisible = bottomProjectMenus.some((menu) => {
    const menuPanel = menu.closest("[data-panel]");
    if (menuPanel?.dataset.panel !== activeSession) {
      return false;
    }

    const projectPanel = menu.closest("[data-project-panel]");
    if (projectPanel && !projectPanel.classList.contains("project-panel--active")) {
      return false;
    }

    const box = menu.getBoundingClientRect();
    return box.top < window.innerHeight && box.bottom > 0;
  });
  const usesProjectMenu = activeSession === "about" || activeSession === "uiux";

  topProjectMenus.forEach((menu) => {
    const menuPanel = menu.closest("[data-panel]");
    if (menuPanel?.dataset.panel !== activeSession) {
      return;
    }

    const projectPanel = menu.closest("[data-project-panel]");
    if (projectPanel && !projectPanel.classList.contains("project-panel--active")) {
      return;
    }

    if (!usesProjectMenu || currentScrollY < 80) {
      menu.classList.remove("project-tabs--hidden");
    } else if (activeBottomVisible || (isScrollingDown && currentScrollY > 120)) {
      menu.classList.add("project-tabs--hidden");
    } else if (isScrollingUp) {
      menu.classList.remove("project-tabs--hidden");
    }
  });

  lastScrollY = currentScrollY;
}

window.addEventListener("scroll", updateProjectMenuVisibility, { passive: true });
window.addEventListener("scroll", queueScrollPositionSave, { passive: true });
window.addEventListener("beforeunload", () => storeScrollPosition());

if ("IntersectionObserver" in window) {
  const bottomMenuObserver = new IntersectionObserver(
    (entries) => {
      isBottomProjectMenuVisible = entries.some((entry) => entry.isIntersecting);
      updateProjectMenuVisibility();
    },
    { threshold: 0.1 },
  );

  bottomProjectMenus.forEach((menu) => bottomMenuObserver.observe(menu));
}

async function copyEmail() {
  if (!emailCopyButton) {
    return;
  }

  const email = emailCopyButton.dataset.email;
  const originalText = "email";

  try {
    await navigator.clipboard.writeText(email);
  } catch (error) {
    const fallback = document.createElement("textarea");
    fallback.value = email;
    fallback.setAttribute("readonly", "");
    fallback.style.position = "fixed";
    fallback.style.top = "-999px";
    document.body.append(fallback);
    fallback.select();
    document.execCommand("copy");
    fallback.remove();
  }

  emailCopyButton.textContent = "email copied";
  window.setTimeout(() => {
    emailCopyButton.textContent = originalText;
  }, 5000);
}

emailCopyButton?.addEventListener("click", copyEmail);

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
