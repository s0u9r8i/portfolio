const sessionTitles = new Map([
  ["about", ":   shuyu (suri) peng"],
  ["graphics", "brand & graphics"],
  ["uiux", "ui ux case studies"],
  ["webdesign", "web design"],
  ["mograph", "mograph"],
]);

const hashRoutes = new Map([
  ["about", { session: "about" }],
  ["graphics", { session: "graphics" }],
  ["one-row-project", { session: "graphics", target: "one-row-project" }],
  ["uiux", { session: "uiux" }],
  ["web-design", { session: "webdesign" }],
  ["mograph", { session: "mograph" }],
  ["softground", { session: "about", project: "softground" }],
  ["kochidoko", { session: "about", project: "kochidoko" }],
  ["readery", { session: "uiux", project: "readery" }],
  ["readery-overview", { session: "uiux", project: "readery", target: "readery-overview" }],
  ["readery-problem-framing", { session: "uiux", project: "readery", target: "readery-problem-framing" }],
  ["readery-research-insights", { session: "uiux", project: "readery", target: "readery-research-insights" }],
  ["readery-design-direction", { session: "uiux", project: "readery", target: "readery-design-direction" }],
  ["readery-testing-iteration", { session: "uiux", project: "readery", target: "readery-testing-iteration" }],
  ["readery-prototype-vision", { session: "uiux", project: "readery", target: "readery-prototype-vision" }],
  ["quesay", { session: "uiux", project: "quesay" }],
  ["quesay-overview", { session: "uiux", project: "quesay", target: "quesay-overview" }],
  ["quesay-product-foundation", { session: "uiux", project: "quesay", target: "quesay-product-foundation" }],
  ["quesay-emotional-system", { session: "uiux", project: "quesay", target: "quesay-emotional-system" }],
  ["quesay-core-experience", { session: "uiux", project: "quesay", target: "quesay-core-experience" }],
  ["quesay-design-to-build", { session: "uiux", project: "quesay", target: "quesay-design-to-build" }],
  ["quesay-launch-reflection", { session: "uiux", project: "quesay", target: "quesay-launch-reflection" }],
  ["animalove", { session: "uiux", project: "animalove" }],
  ["animalove-overview-context", { session: "uiux", project: "animalove", target: "animalove-overview-context" }],
  ["animalove-ecosystem-research", { session: "uiux", project: "animalove", target: "animalove-ecosystem-research" }],
  ["animalove-research-findings", { session: "uiux", project: "animalove", target: "animalove-research-findings" }],
  ["animalove-synthesis-insights", { session: "uiux", project: "animalove", target: "animalove-synthesis-insights" }],
  ["animalove-problem-definition", { session: "uiux", project: "animalove", target: "animalove-problem-definition" }],
  ["animalove-design-direction", { session: "uiux", project: "animalove", target: "animalove-design-direction" }],
  ["animalove-feasibility-impact", { session: "uiux", project: "animalove", target: "animalove-feasibility-impact" }],
  ["i-used-to-be-your-neighbor", { session: "webdesign", project: "neighbor" }],
  ["procrastination", { session: "mograph", target: "procrastination" }],
  ["shuyu-peng-reel-2020", { session: "mograph", target: "shuyu-peng-reel-2020" }],
  ["self-portrait", { session: "mograph", target: "self-portrait" }],
]);

const sessionHashes = new Map([
  ["about", "about"],
  ["graphics", "graphics"],
  ["uiux", "uiux"],
  ["webdesign", "web-design"],
  ["mograph", "mograph"],
]);

const projectHashes = new Map([
  ["softground", "softground"],
  ["kochidoko", "kochidoko"],
  ["readery", "readery"],
  ["quesay", "quesay"],
  ["animalove", "animalove"],
  ["neighbor", "i-used-to-be-your-neighbor"],
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
const popupPreviousImage = document.querySelector("[data-popup-previous-image]");
const popupNextImage = document.querySelector("[data-popup-next-image]");
const popupMotionLayer = document.querySelector("[data-popup-motion-layer]");
const popupPreviousButtons = [...document.querySelectorAll("[data-popup-previous]")];
const popupNextButtons = [...document.querySelectorAll("[data-popup-next]")];
const popupCloseButtons = [...document.querySelectorAll("[data-popup-close]")];
const oneRowProjects = [...document.querySelectorAll("[data-one-row-project]")];
const graphicsLayout = document.querySelector("[data-graphics-layout]");
const graphicsRandomizeButton = document.querySelector("[data-graphics-randomize]");
const projectTabs = [...document.querySelectorAll("[data-project-tab]")];
const topProjectMenus = [...document.querySelectorAll("[data-project-tabs]")];
const bottomProjectMenus = [...document.querySelectorAll(".project-tabs--bottom")];
const emailCopyButton = document.querySelector("[data-email-copy]");
let isSwitching = false;
let lastScrollY = window.scrollY;
let isBottomProjectMenuVisible = false;
let scrollSaveTimer;
let isRestoringScroll = false;
let transitionTimer;
let routeFrame;
let projectScrollTween;
let projectSwitchId = 0;
let popupTransitionTimer;
let popupChangeTimer;
let popupTrigger;
let popupCarouselIndex = -1;
let popupCarouselSlides = [];
let popupCarouselAnimationId = 0;
let popupSwipeStartX = null;

const motionDurationMs = 686;
const travelDurationMs = 1143;
const sessionTabDurationMs = 900;
const sessionContentDurationMs = 1200;
const transitionMs = sessionTabDurationMs;
const popupTransitionMs = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : motionDurationMs;
const graphicsShuffleMs = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : travelDurationMs;

function getCurrentHashRoute() {
  const hash = decodeURIComponent(window.location.hash.slice(1)).trim().toLowerCase();
  return hashRoutes.get(hash) || null;
}

function pushHash(hash) {
  if (!hash || window.location.hash === `#${hash}`) {
    return;
  }

  history.pushState(null, "", `#${hash}`);
}

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
    const isActive = !groupTab.hidden && isTopTab && groupTab.dataset.projectTab === projectName;
    groupTab.classList.toggle("project-card--active", isActive);
    groupTab.setAttribute("aria-selected", String(isActive));
  });

  projectGroup.querySelectorAll("[data-project-panel]").forEach((panel) => {
    panel.classList.toggle(
      "project-panel--active",
      !panel.hidden && panel.dataset.projectPanel === projectName,
    );
  });

  const isUiuxGroup = projectGroup.closest("[data-panel]")?.dataset.panel === "uiux";
  projectGroup.classList.toggle("quesay-is-active", isUiuxGroup && projectName === "quesay");
}

function syncInitialProjects() {
  const storedProjects = getStoredActiveProjects();

  document.querySelectorAll("[data-project-group]").forEach((projectGroup) => {
    const panelName = projectGroup.closest("[data-panel]")?.dataset.panel;
    const storedProject = panelName === "about" ? null : (panelName ? storedProjects[panelName] : null);
    const fallbackProject = projectGroup.querySelector("[data-project-tab]:not([hidden])")?.dataset.projectTab;
    const projectName = projectGroup.querySelector(`[data-project-panel="${storedProject}"]:not([hidden])`)
      ? storedProject
      : fallbackProject;

    if (projectName) {
      setProjectGroup(projectGroup, projectName);
      storeActiveProject(projectGroup, projectName);
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

let activeSession = "about";

function setActiveHeader(session) {
  activeHeader.dataset.activeSession = session;
  activeTitle.textContent = sessionTitles.get(session);
  activeMark.hidden = session === "about";
  activeTagline.hidden = session !== "about";
}

function initializeMediaFade(root = document) {
  const mediaElements = root.matches?.("img, iframe, video")
    ? [root]
    : [...(root.querySelectorAll?.("img, iframe, video") || [])];

  mediaElements.forEach((media) => {
    if (media.classList.contains("image-popup__motion-clone") || media.dataset.fadeReady === "true") {
      return;
    }

    media.dataset.fadeReady = "true";
    media.classList.add("media-fade");
    const reveal = () => media.classList.add("media-loaded");

    if ((media instanceof HTMLImageElement && media.complete && media.naturalWidth > 0)
      || (media instanceof HTMLVideoElement && media.readyState >= 2)) {
      requestAnimationFrame(reveal);
      return;
    }

    media.addEventListener("load", reveal, { once: true });
    media.addEventListener("loadeddata", reveal, { once: true });
    window.setTimeout(reveal, 4000);
  });
}

initializeMediaFade();

const mediaFadeObserver = new MutationObserver((records) => {
  records.forEach((record) => {
    record.addedNodes.forEach((node) => {
      if (node instanceof Element) {
        initializeMediaFade(node);
      }
    });
  });
});
mediaFadeObserver.observe(document.body, { childList: true, subtree: true });

function makeSessionTransitionTab(source, startY) {
  if (!source) {
    return null;
  }

  const tab = source.cloneNode(true);
  tab.hidden = false;
  tab.removeAttribute("data-session");
  tab.classList.add("session-transition-tab");
  tab.setAttribute("aria-hidden", "true");
  tab.tabIndex = -1;
  tab.style.setProperty("--session-start-y", `${startY}px`);
  document.body.append(tab);

  requestAnimationFrame(() => {
    tab.classList.add("session-transition--arriving");
  });

  return tab;
}

function showSession(nextSession) {
  if (!sessionTitles.has(nextSession) || nextSession === activeSession || isSwitching) {
    return;
  }

  const previousSession = activeSession;
  const nextPanel = panels.find((panel) => panel.dataset.panel === nextSession);
  const previousButton = buttons.find((button) => button.dataset.session === previousSession);
  const nextButton = buttons.find((button) => button.dataset.session === nextSession);
  const nextButtonBox = nextButton?.getBoundingClientRect();
  const incomingTab = nextButtonBox
    ? makeSessionTransitionTab(nextButton, nextButtonBox.top)
    : null;

  isSwitching = true;
  isBottomProjectMenuVisible = false;
  topProjectMenus.forEach((menu) => menu.classList.remove("project-tabs--hidden"));
  page.classList.add("is-switching");
  activeSession = nextSession;
  storeActiveSession(nextSession);

  window.scrollTo(0, 0);
  if (nextPanel && nextButtonBox) {
    nextPanel.style.setProperty("--session-start-y", `${Math.max(0, nextButtonBox.bottom - 56)}px`);
    nextPanel.classList.add("panel--active", "panel--session-cover", "panel--session-reveal");
    requestAnimationFrame(() => {
      nextPanel.classList.add("session-transition--arriving");
    });
  }
  window.dispatchEvent(new CustomEvent("portfolio:session-ready"));

  if (nextButton) {
    nextButton.style.visibility = "hidden";
  }

  transitionTimer = window.setTimeout(() => {
    setActiveHeader(nextSession);

    panels.forEach((panel) => {
      panel.classList.toggle("panel--active", panel.dataset.panel === nextSession);
    });
    nextPanel?.classList.remove("panel--session-cover");
    nextPanel?.style.removeProperty("--session-start-y");

    if (previousButton) {
      previousButton.hidden = false;
      previousButton.classList.add("session--returning");
      nav.append(previousButton);
      requestAnimationFrame(() => {
        previousButton.classList.add("session--returned");
      });
    }

    if (nextButton) {
      nextButton.style.visibility = "";
      nextButton.hidden = true;
    }

    page.classList.remove("is-switching");
    requestAnimationFrame(() => {
      incomingTab?.remove();
      isSwitching = false;
    });

    window.setTimeout(() => {
      nextPanel?.classList.remove("panel--session-reveal", "session-transition--arriving");
      previousButton?.classList.remove("session--returning", "session--returned");
    }, Math.max(0, sessionContentDurationMs - sessionTabDurationMs));
  }, transitionMs);
}

function activateSessionImmediately(session) {
  if (!sessionTitles.has(session)) {
    return;
  }

  window.clearTimeout(transitionTimer);
  document.querySelectorAll(".session-transition-tab").forEach((tab) => tab.remove());
  page.classList.remove("is-switching");
  isSwitching = false;
  activeSession = session;
  isBottomProjectMenuVisible = false;

  setActiveHeader(session);

  panels.forEach((panel) => {
    panel.classList.remove("panel--session-cover", "panel--session-reveal", "session-transition--arriving");
    panel.style.removeProperty("--session-start-y");
    panel.classList.toggle("panel--active", panel.dataset.panel === session);
  });

  buttons.forEach((button) => {
    button.classList.remove("session--returning", "session--returned");
    button.style.visibility = "";
    button.hidden = button.dataset.session === session;
  });

  const activeButton = buttons.find((button) => button.dataset.session === session);
  if (activeButton) {
    nav.append(activeButton);
  }

  topProjectMenus.forEach((menu) => menu.classList.remove("project-tabs--hidden"));
  storeActiveSession(session);
}

function activateRouteProject(route) {
  if (!route.project) {
    return;
  }

  const projectGroup = document.querySelector(`[data-panel="${route.session}"] [data-project-group]`);
  if (!projectGroup?.querySelector(`[data-project-panel="${route.project}"]:not([hidden])`)) {
    return;
  }

  setProjectGroup(projectGroup, route.project);
  storeActiveProject(projectGroup, route.project);
}

function scrollToRoute(route) {
  isRestoringScroll = true;

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const target = route.target ? document.getElementById(route.target) : null;
      const currentRoute = getCurrentHashRoute();
      const routeIsCurrent = currentRoute?.session === route.session
        && currentRoute?.target === route.target;

      if (!routeIsCurrent) {
        isRestoringScroll = false;
        return;
      }

      if (target) {
        target.scrollIntoView({ block: "start" });
      } else {
        window.scrollTo(0, 0);
      }

      lastScrollY = window.scrollY;
      storeScrollPosition(window.scrollY);
      updateProjectMenuVisibility();
      isRestoringScroll = false;
    });
  });
}

function routeToCurrentHash() {
  const route = getCurrentHashRoute();

  if (!route) {
    return false;
  }

  activateSessionImmediately(route.session);
  activateRouteProject(route);
  scrollToRoute(route);
  return true;
}

function queueHashRoute() {
  window.cancelAnimationFrame(routeFrame);
  routeFrame = window.requestAnimationFrame(routeToCurrentHash);
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

const initialHashRoute = getCurrentHashRoute();
if (initialHashRoute) {
  activeSession = initialHashRoute.session;
}

syncInitialState();
syncInitialProjects();
storeActiveSession(activeSession);

if (initialHashRoute) {
  activateRouteProject(initialHashRoute);
  scrollToRoute(initialHashRoute);
} else {
  const aboutProjectGroup = document.querySelector('[data-panel="about"] [data-project-group]');
  if (aboutProjectGroup) {
    setProjectGroup(aboutProjectGroup, "softground");
    storeActiveProject(aboutProjectGroup, "softground");
  }
  scrollToPageTop();
}

window.addEventListener("pageshow", (event) => {
  if (!event.persisted) {
    return;
  }
  if (!routeToCurrentHash()) {
    restoreStoredScrollPosition();
  }
});
window.addEventListener("hashchange", queueHashRoute);
window.addEventListener("popstate", queueHashRoute);

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    const session = button.dataset.session;
    showSession(session);
    pushHash(sessionHashes.get(session));
  });
});

function scrollToTopWithin(maxDuration = 1) {
  projectScrollTween?.kill();
  projectScrollTween = undefined;

  if (window.scrollY < 2 || !window.gsap || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    window.scrollTo(0, 0);
    return Promise.resolve();
  }

  const scrollState = { y: window.scrollY };
  const duration = Math.min(maxDuration, Math.max(0.3, scrollState.y / 5000));
  return new Promise((resolve) => {
    projectScrollTween = window.gsap.to(scrollState, {
      y: 0,
      duration,
      ease: "power2.inOut",
      overwrite: true,
      onUpdate: () => window.scrollTo(0, scrollState.y),
      onComplete: () => {
        projectScrollTween = undefined;
        resolve();
      },
      onInterrupt: resolve,
    });
  });
}

async function showProject(tab) {
  const projectGroup = tab.closest("[data-project-group]");
  const projectName = tab.dataset.projectTab;

  if (!projectGroup || !projectName || tab.hidden) {
    return;
  }

  const switchId = ++projectSwitchId;
  await scrollToTopWithin(1);
  if (switchId !== projectSwitchId) {
    return;
  }
  isBottomProjectMenuVisible = false;
  projectGroup.querySelectorAll("[data-project-tabs]").forEach((menu) => {
    menu.classList.remove("project-tabs--hidden");
  });

  setProjectGroup(projectGroup, projectName);
  storeActiveProject(projectGroup, projectName);
  pushHash(projectHashes.get(projectName));
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
  const usesProjectMenu = activeSession === "about" || activeSession === "uiux" || activeSession === "webdesign";

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

  window.clearTimeout(popupTransitionTimer);
  window.clearTimeout(popupChangeTimer);
  popup.classList.remove("image-popup--carousel", "image-popup--changing");
  popupCarouselIndex = -1;
  popupCarouselSlides = [];
  popupCarouselAnimationId += 1;
  popupMotionLayer?.replaceChildren();
  popupTrigger = image;
  popupImage.src = image.currentSrc || image.src;
  popupImage.alt = image.alt || "Image preview";
  popup.hidden = false;
  popup.getBoundingClientRect();
  popup.classList.add("image-popup--open");
  popup.querySelector(".image-popup__close")?.focus({ preventScroll: true });
}

function updateCarouselPopup(index) {
  const total = popupCarouselSlides.length;
  if (!total || !popupImage || !popupPreviousImage || !popupNextImage) {
    return;
  }

  popupCarouselIndex = (index + total) % total;
  const previousIndex = (popupCarouselIndex - 1 + total) % total;
  const nextIndex = (popupCarouselIndex + 1) % total;
  const current = popupCarouselSlides[popupCarouselIndex];
  const previous = popupCarouselSlides[previousIndex];
  const next = popupCarouselSlides[nextIndex];

  popupImage.src = current.src;
  popupImage.alt = current.alt;
  popupPreviousImage.src = previous.src;
  popupPreviousImage.alt = `Previous: ${previous.alt}`;
  popupNextImage.src = next.src;
  popupNextImage.alt = `Next: ${next.alt}`;
}

function openCarouselPopup(index, trigger, slides) {
  if (!popup || !popupImage || !slides.length) {
    return;
  }

  window.clearTimeout(popupTransitionTimer);
  window.clearTimeout(popupChangeTimer);
  popupTrigger = trigger;
  popupCarouselSlides = slides;
  popupCarouselAnimationId += 1;
  popupMotionLayer?.replaceChildren();
  popup.classList.add("image-popup--carousel");
  updateCarouselPopup(index);
  popup.hidden = false;
  popup.getBoundingClientRect();
  popup.classList.add("image-popup--open");
  popup.querySelector(".image-popup__close")?.focus({ preventScroll: true });
}

function makeMotionClone(image, rect) {
  const clone = image.cloneNode();
  clone.className = "image-popup__motion-clone";
  clone.setAttribute("aria-hidden", "true");
  Object.assign(clone.style, {
    left: `${rect.left}px`,
    top: `${rect.top}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
  });
  popupMotionLayer?.append(clone);
  return clone;
}

function shiftedRect(rect, deltaX) {
  return {
    left: rect.left + deltaX,
    top: rect.top,
    width: rect.width,
    height: rect.height,
  };
}

function animateClone(image, startRect, endRect, options = {}) {
  const clone = makeMotionClone(image, startRect);
  if (!clone.animate) {
    return Promise.resolve();
  }

  const translateX = endRect.left - startRect.left;
  const translateY = endRect.top - startRect.top;
  const scaleX = endRect.width / startRect.width;
  const scaleY = endRect.height / startRect.height;
  const animation = clone.animate(
    [
      { opacity: options.fromOpacity ?? 1, transform: "translate3d(0, 0, 0) scale(1, 1)" },
      {
        opacity: options.toOpacity ?? 1,
        transform: `translate3d(${translateX}px, ${translateY}px, 0) scale(${scaleX}, ${scaleY})`,
      },
    ],
    { duration: motionDurationMs, easing: "cubic-bezier(0.65, 0, 0.35, 1)", fill: "forwards" },
  );
  return animation.finished.catch(() => undefined);
}

async function loadMotionImage(slide) {
  const image = new Image();
  image.src = slide.src;
  image.alt = slide.alt;
  if (!image.complete && image.decode) {
    await image.decode().catch(() => undefined);
  }
  return image;
}

async function changeCarouselSlide(direction) {
  if (popupCarouselIndex < 0 || popup?.classList.contains("image-popup--changing")) {
    return;
  }

  const total = popupCarouselSlides.length;
  const nextIndex = (popupCarouselIndex + direction + total) % total;
  if (popupTransitionMs === 0 || !popupMotionLayer || !Element.prototype.animate) {
    updateCarouselPopup(nextIndex);
    return;
  }

  if (window.matchMedia("(max-width: 743px)").matches) {
    const currentRect = popupImage.getBoundingClientRect();
    const incoming = await loadMotionImage(popupCarouselSlides[nextIndex]);
    const slideDistance = Math.max(window.innerWidth, currentRect.width + 72);
    const animationId = ++popupCarouselAnimationId;
    popup.classList.add("image-popup--changing");
    await Promise.all([
      animateClone(
        popupImage,
        currentRect,
        shiftedRect(currentRect, direction > 0 ? -slideDistance : slideDistance),
        { toOpacity: 0.88 },
      ),
      animateClone(
        incoming,
        shiftedRect(currentRect, direction > 0 ? slideDistance : -slideDistance),
        currentRect,
        { fromOpacity: 0.88 },
      ),
    ]);
    popupMotionLayer.replaceChildren();
    if (animationId !== popupCarouselAnimationId) {
      return;
    }
    updateCarouselPopup(nextIndex);
    popup.classList.remove("image-popup--changing");
    return;
  }

  const previousRect = popupPreviousImage.getBoundingClientRect();
  const currentRect = popupImage.getBoundingClientRect();
  const nextRect = popupNextImage.getBoundingClientRect();
  const slotDistance = Math.max(currentRect.left - previousRect.left, nextRect.left - currentRect.left);
  const animationId = ++popupCarouselAnimationId;
  popup.classList.add("image-popup--changing");

  let animations;
  if (direction > 0) {
    const incomingIndex = (nextIndex + 1) % total;
    const incoming = await loadMotionImage(popupCarouselSlides[incomingIndex]);
    animations = [
      animateClone(popupPreviousImage, previousRect, shiftedRect(previousRect, -slotDistance), { toOpacity: 0 }),
      animateClone(popupImage, currentRect, previousRect),
      animateClone(popupNextImage, nextRect, currentRect),
      animateClone(incoming, shiftedRect(nextRect, slotDistance), nextRect, { fromOpacity: 0.7 }),
    ];
  } else {
    const incomingIndex = (nextIndex - 1 + total) % total;
    const incoming = await loadMotionImage(popupCarouselSlides[incomingIndex]);
    animations = [
      animateClone(popupNextImage, nextRect, shiftedRect(nextRect, slotDistance), { toOpacity: 0 }),
      animateClone(popupImage, currentRect, nextRect),
      animateClone(popupPreviousImage, previousRect, currentRect),
      animateClone(incoming, shiftedRect(previousRect, -slotDistance), previousRect, { fromOpacity: 0.7 }),
    ];
  }

  await Promise.all(animations);
  popupMotionLayer.replaceChildren();
  if (animationId !== popupCarouselAnimationId) {
    return;
  }
  updateCarouselPopup(nextIndex);
  popup.classList.remove("image-popup--changing");
}

function closeImagePopup() {
  if (!popup || !popupImage) {
    return;
  }

  window.clearTimeout(popupTransitionTimer);
  window.clearTimeout(popupChangeTimer);
  popupCarouselAnimationId += 1;
  popupMotionLayer?.replaceChildren();
  popup.classList.remove("image-popup--open");
  popupTransitionTimer = window.setTimeout(() => {
    popup.hidden = true;
    popup.classList.remove("image-popup--carousel", "image-popup--changing");
    popupImage.removeAttribute("src");
    popupImage.alt = "";
    popupPreviousImage?.removeAttribute("src");
    popupNextImage?.removeAttribute("src");
    popupCarouselIndex = -1;
    popupCarouselSlides = [];
    popupTrigger?.focus({ preventScroll: true });
    popupTrigger = null;
  }, popupTransitionMs);
}

document.querySelectorAll(".graphic-item img").forEach((image) => {
  image.addEventListener("click", () => openImagePopup(image));
});

oneRowProjects.forEach((project) => {
  const track = project.querySelector("[data-one-row-track]");
  const triggers = [...project.querySelectorAll("[data-one-row-trigger]")];
  const slides = triggers.map((trigger) => {
    const image = trigger.querySelector("img");
    return { src: image.currentSrc || image.src, alt: image.alt };
  });

  triggers.forEach((trigger, index) => {
    trigger.addEventListener("click", () => openCarouselPopup(index, trigger, slides));
  });

  track?.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
      return;
    }

    event.preventDefault();
    const firstSlide = track.querySelector(".one-row-project__slide");
    const step = (firstSlide?.getBoundingClientRect().width || 0) + 12;
    track.scrollBy({
      left: event.key === "ArrowRight" ? step : -step,
      behavior: "smooth",
    });
  });
});

popupImage?.addEventListener("touchstart", (event) => {
  if (!popup?.classList.contains("image-popup--carousel")) {
    return;
  }
  popupSwipeStartX = event.changedTouches[0]?.clientX ?? null;
}, { passive: true });

popupImage?.addEventListener("touchend", (event) => {
  if (popupSwipeStartX === null || !popup?.classList.contains("image-popup--carousel")) {
    popupSwipeStartX = null;
    return;
  }
  const endX = event.changedTouches[0]?.clientX ?? popupSwipeStartX;
  const distance = endX - popupSwipeStartX;
  popupSwipeStartX = null;
  if (Math.abs(distance) >= 48) {
    changeCarouselSlide(distance < 0 ? 1 : -1);
  }
}, { passive: true });

function shuffleItems(items) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[target]] = [shuffled[target], shuffled[index]];
  }

  if (shuffled.every((item, index) => item === items[index]) && shuffled.length > 1) {
    [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
  }
  return shuffled;
}

function isNearViewport(rect) {
  const allowance = window.innerHeight * 0.6;
  return rect.bottom >= -allowance && rect.top <= window.innerHeight + allowance;
}

async function randomizeGraphics() {
  if (!graphicsLayout || !graphicsRandomizeButton || graphicsRandomizeButton.getAttribute("aria-busy") === "true") {
    return;
  }

  const units = [...graphicsLayout.children].filter(
    (element) => element.classList.contains("graphic-item") || element.classList.contains("one-row-project"),
  );
  if (units.length < 2) {
    return;
  }

  graphicsRandomizeButton.setAttribute("aria-busy", "true");
  const revealElements = [...units, ...graphicsLayout.querySelectorAll(".one-row-project__slide")];
  window.gsap?.set(revealElements, { clearProps: "opacity,visibility,transform,willChange" });
  const firstRects = new Map(units.map((unit) => [unit, unit.getBoundingClientRect()]));
  const shuffled = shuffleItems(units);
  graphicsLayout.append(...shuffled);

  if (graphicsShuffleMs === 0 || !Element.prototype.animate) {
    graphicsRandomizeButton.removeAttribute("aria-busy");
    window.ScrollTrigger?.refresh();
    return;
  }

  const animations = shuffled.flatMap((unit) => {
    const first = firstRects.get(unit);
    const last = unit.getBoundingClientRect();
    if (!first || (!isNearViewport(first) && !isNearViewport(last))) {
      return [];
    }

    const deltaX = first.left - last.left;
    const deltaY = first.top - last.top;
    if (Math.abs(deltaX) < 1 && Math.abs(deltaY) < 1) {
      return [];
    }

    unit.style.zIndex = "3";
    const animation = unit.animate(
      [
        { transform: `translate3d(${deltaX}px, ${deltaY}px, 0)`, opacity: 0.72 },
        { transform: "translate3d(0, 0, 0)", opacity: 1 },
      ],
      {
        duration: graphicsShuffleMs,
        easing: "cubic-bezier(0.45, 0.05, 0.55, 0.95)",
        fill: "both",
      },
    );
    return [
      animation.finished
        .catch(() => undefined)
        .finally(() => {
          unit.style.removeProperty("z-index");
        }),
    ];
  });

  await Promise.all(animations);
  graphicsRandomizeButton.removeAttribute("aria-busy");
  window.ScrollTrigger?.refresh();
}

graphicsRandomizeButton?.addEventListener("click", randomizeGraphics);

popupPreviousButtons.forEach((button) => {
  button.addEventListener("click", () => changeCarouselSlide(-1));
});

popupNextButtons.forEach((button) => {
  button.addEventListener("click", () => changeCarouselSlide(1));
});

popupCloseButtons.forEach((button) => {
  button.addEventListener("click", closeImagePopup);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && popup && !popup.hidden) {
    closeImagePopup();
  } else if (popup?.classList.contains("image-popup--carousel") && !popup.hidden) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      changeCarouselSlide(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      changeCarouselSlide(1);
    }
  }
});
