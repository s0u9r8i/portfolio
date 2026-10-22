const caseStudyStages = {
  readery: [
    { id: "readery-overview", label: "overview" },
    { id: "readery-problem-framing", label: "problem framing" },
    { id: "readery-research-insights", label: "research & insights" },
    { id: "readery-design-direction", label: "design direction" },
    { id: "readery-testing-iteration", label: "testing & iteration" },
    { id: "readery-prototype-vision", label: "prototype & vision" },
  ],
  quesay: [
    { id: "quesay-overview", label: "overview" },
    { id: "quesay-product-foundation", label: "product foundation" },
    { id: "quesay-emotional-system", label: "emotional visual system" },
    { id: "quesay-core-experience", label: "core experience design" },
    { id: "quesay-design-to-build", label: "from design to build" },
    { id: "quesay-launch-reflection", label: "launch & reflection" },
  ],
  animalove: [
    { id: "animalove-overview-context", label: "overview & context" },
    { id: "animalove-ecosystem-research", label: "ecosystem & research" },
    { id: "animalove-research-findings", label: "research findings" },
    { id: "animalove-synthesis-insights", label: "synthesis & insights" },
    { id: "animalove-problem-definition", label: "problem definition" },
    { id: "animalove-design-direction", label: "design direction" },
    { id: "animalove-feasibility-impact", label: "feasibility & impact" },
  ],
};

const stageIndicator = document.createElement("nav");
stageIndicator.className = "stage-indicator";
stageIndicator.setAttribute("aria-label", "case study stages");
document.body.append(stageIndicator);

const uiuxPanel = document.querySelector('[data-panel="uiux"]');
const uiuxProjectGroup = uiuxPanel?.querySelector("[data-project-group]");
const uiuxProjectMenu = uiuxProjectGroup?.querySelector(":scope > [data-project-tabs]");
const desktopIndicator = window.matchMedia("(min-width: 989px)");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let currentProject = "";
let currentStage = "";
let stageTargets = [];
let stageObserver;
let updateFrame;
let stageSwapTimer;
let stageLabelTimer;
let pendingStage = "";
let stageScrollTween;
let guidedStage = "";
let guidedStageTimer;
const hoverCollapseTimers = new Map();
const hoverCollapseDelay = 20;
const hoverMotionDuration = 343;
const stageLabelFadeDuration = 100;
const stageBarTransitionDuration = 300;
const guidedStageRetractDuration = 500;
const guidedStageFillDuration = 900;

function getActiveProject() {
  return uiuxProjectGroup?.querySelector("[data-project-panel].project-panel--active")?.dataset.projectPanel || "";
}

function getEdgeDotSize(edgeDistance) {
  return Math.min(18, 12 + edgeDistance * 2);
}

function updateDotSizes(activeIndex) {
  const links = [...stageIndicator.querySelectorAll("[data-stage-id]")];
  links.forEach((link, index) => {
    let dotSize = 18;
    if (index < activeIndex) {
      dotSize = getEdgeDotSize(index);
    } else if (index > activeIndex) {
      dotSize = getEdgeDotSize(links.length - index - 1);
    }
    link.style.setProperty("--stage-dot-size", `${dotSize}px`);
  });
}

function updateInteractionLayout() {
  const hoveredInactive = stageIndicator.querySelector(
    '.stage-indicator__item--hovered:not([aria-current="step"])',
  );
  const focusedInactive = document.activeElement?.matches?.(
    '.stage-indicator__item:focus-visible:not([aria-current="step"])',
  );
  stageIndicator.classList.toggle(
    "stage-indicator--interacting",
    Boolean(hoveredInactive || focusedInactive),
  );
}

function updateHoverSizes() {
  stageIndicator.querySelectorAll("[data-stage-id]").forEach((link) => {
    const labelWidth = link.querySelector(".stage-indicator__label")?.scrollWidth || 0;
    link.style.setProperty("--stage-hover-size", `${Math.max(136, Math.ceil(labelWidth) + 32)}px`);
  });
}

function scheduleHoverCollapse(link) {
  window.clearTimeout(hoverCollapseTimers.get(link));
  const timer = window.setTimeout(() => {
    link.classList.remove("stage-indicator__item--hovered");
    hoverCollapseTimers.delete(link);
    updateInteractionLayout();
  }, hoverCollapseDelay);
  hoverCollapseTimers.set(link, timer);
}

function finishGuidedScroll(stageId) {
  if (guidedStage !== stageId) {
    return;
  }

  guidedStage = "";
  stageScrollTween = undefined;
  applyActiveStage(stageId);
  queueIndicatorUpdate();
}

function scrollToStage(element, stageId) {
  const targetTop = Math.max(
    0,
    window.scrollY + element.getBoundingClientRect().top - 96,
  );

  stageScrollTween?.kill();
  stageScrollTween = undefined;

  if (reducedMotion.matches || !window.gsap) {
    window.scrollTo(0, targetTop);
    finishGuidedScroll(stageId);
    return;
  }

  const scrollState = { y: window.scrollY };
  const distance = Math.abs(targetTop - scrollState.y);
  stageScrollTween = window.gsap.to(scrollState, {
    y: targetTop,
    duration: Math.min(1.2, Math.max(0.35, distance / 5000)),
    ease: "power2.inOut",
    overwrite: true,
    onUpdate: () => window.scrollTo(0, scrollState.y),
    onComplete: () => {
      finishGuidedScroll(stageId);
    },
  });
}

function startGuidedScroll(stage, selectedLink) {
  window.clearTimeout(stageSwapTimer);
  window.clearTimeout(stageLabelTimer);
  stageSwapTimer = undefined;
  stageLabelTimer = undefined;
  pendingStage = "";
  window.clearTimeout(guidedStageTimer);
  stageIndicator
    .querySelectorAll(".stage-indicator__item--stage-leaving, .stage-indicator__item--stage-entering")
    .forEach((link) => {
      link.classList.remove(
        "stage-indicator__item--stage-leaving",
        "stage-indicator__item--stage-entering",
      );
    });
  guidedStage = stage.id;
  if (reducedMotion.matches) {
    applyActiveStage(stage.id);
    scrollToStage(stage.element, stage.id);
    return;
  }
  const outgoing = stageIndicator.querySelector('[aria-current="step"]');
  hoverCollapseTimers.forEach((timer) => window.clearTimeout(timer));
  hoverCollapseTimers.clear();
  stageIndicator.classList.add("stage-indicator--guided-reset");
  outgoing?.classList.add("stage-indicator__item--guided-leaving");
  selectedLink?.classList.add("stage-indicator__item--guided-source");
  updateInteractionLayout();
  guidedStageTimer = window.setTimeout(() => {
    stageIndicator.classList.add("stage-indicator--layout-snap");
    stageIndicator.querySelectorAll(".stage-indicator__item--hovered, .stage-indicator__item--selecting").forEach((link) => {
      link.classList.remove("stage-indicator__item--hovered", "stage-indicator__item--selecting");
    });
    selectedLink?.classList.remove("stage-indicator__item--guided-source");
    applyActiveStage(stage.id);
    const incoming = stageIndicator.querySelector(`[data-stage-id="${stage.id}"]`);
    if (incoming) {
      incoming.classList.add("stage-indicator__item--guided-entering");
      incoming.getBoundingClientRect();
    }
    requestAnimationFrame(() => {
      stageIndicator.classList.remove("stage-indicator--guided-reset");
      requestAnimationFrame(() => {
        outgoing?.classList.remove("stage-indicator__item--guided-leaving");
      });
    });
    guidedStageTimer = window.setTimeout(() => {
      guidedStageTimer = undefined;
      incoming?.classList.remove("stage-indicator__item--guided-entering");
      stageIndicator.classList.remove("stage-indicator--layout-snap", "stage-indicator--guided-reset");
    }, guidedStageFillDuration);
  }, guidedStageRetractDuration);
  scrollToStage(stage.element, stage.id);
}

function cancelGuidedScroll() {
  if (!guidedStage) {
    return;
  }

  stageScrollTween?.kill();
  stageScrollTween = undefined;
  window.clearTimeout(guidedStageTimer);
  guidedStageTimer = undefined;
  stageIndicator.querySelectorAll(".stage-indicator__item--selecting, .stage-indicator__item--guided-leaving, .stage-indicator__item--guided-source").forEach((link) => {
    link.classList.remove("stage-indicator__item--selecting", "stage-indicator__item--guided-leaving", "stage-indicator__item--guided-source");
  });
  stageIndicator.classList.remove("stage-indicator--layout-snap", "stage-indicator--guided-reset");
  stageIndicator.querySelectorAll(".stage-indicator__item--guided-entering").forEach((link) => {
    link.classList.remove("stage-indicator__item--guided-entering");
  });
  guidedStage = "";
  currentStage = "";
  queueIndicatorUpdate();
}

function renderIndicator(projectName) {
  const stages = caseStudyStages[projectName] || [];
  currentProject = projectName;
  currentStage = "";
  guidedStage = "";
  stageScrollTween?.kill();
  stageScrollTween = undefined;
  stageTargets = stages
    .map((stage) => ({ ...stage, element: document.getElementById(stage.id) }))
    .filter((stage) => stage.element);

  hoverCollapseTimers.forEach((timer) => window.clearTimeout(timer));
  hoverCollapseTimers.clear();
  window.clearTimeout(stageSwapTimer);
  window.clearTimeout(stageLabelTimer);
  window.clearTimeout(guidedStageTimer);
  guidedStageTimer = undefined;
  stageSwapTimer = undefined;
  stageLabelTimer = undefined;
  pendingStage = "";

  stageIndicator.replaceChildren(
    ...stageTargets.map((stage, index) => {
      const link = document.createElement("a");
      const label = document.createElement("span");
      link.className = "stage-indicator__item";
      link.href = `#${stage.id}`;
      link.style.setProperty("--stage-dot-size", "18px");
      link.dataset.stageId = stage.id;
      link.setAttribute("aria-label", `go to ${stage.label}`);
      label.className = "stage-indicator__label";
      label.textContent = stage.label;
      link.append(label);
      link.addEventListener("pointerenter", () => {
        stageIndicator
          .querySelectorAll(".stage-indicator__item--hovered")
          .forEach((hoveredLink) => {
            if (hoveredLink !== link) {
              scheduleHoverCollapse(hoveredLink);
            }
          });
        window.clearTimeout(hoverCollapseTimers.get(link));
        hoverCollapseTimers.delete(link);
        link.classList.add("stage-indicator__item--hovered");
        updateInteractionLayout();
      });
      link.addEventListener("pointerleave", () => {
        scheduleHoverCollapse(link);
      });
      link.addEventListener("focus", () => requestAnimationFrame(updateInteractionLayout));
      link.addEventListener("blur", () => requestAnimationFrame(updateInteractionLayout));
      link.addEventListener("click", (event) => {
        event.preventDefault();
        history.pushState(null, "", `#${stage.id}`);
        startGuidedScroll(stage, link);
      });
      return link;
    }),
  );

  updateHoverSizes();

  stageObserver?.disconnect();
  if ("IntersectionObserver" in window) {
    stageObserver = new IntersectionObserver(queueIndicatorUpdate, {
      rootMargin: "-96px 0px -55% 0px",
      threshold: [0, 0.01, 0.5, 1],
    });
    stageTargets.forEach((stage) => stageObserver.observe(stage.element));
  }

  queueIndicatorUpdate();
}

function applyActiveStage(stageId) {
  currentStage = stageId;
  let activeIndex = 0;
  stageIndicator.querySelectorAll("[data-stage-id]").forEach((link, index) => {
    const isCurrent = link.dataset.stageId === stageId;
    if (isCurrent) {
      activeIndex = index;
      link.setAttribute("aria-current", "step");
    } else {
      link.removeAttribute("aria-current");
    }
  });
  updateDotSizes(activeIndex);
  updateInteractionLayout();
}

function setActiveStage(stageId) {
  if (!stageId || currentStage === stageId) {
    return;
  }

  if (!currentStage || reducedMotion.matches) {
    applyActiveStage(stageId);
    return;
  }

  if (stageSwapTimer !== undefined || stageLabelTimer !== undefined) {
    pendingStage = stageId;
    return;
  }

  const outgoing = stageIndicator.querySelector(`[data-stage-id="${currentStage}"]`);
  if (!outgoing) {
    applyActiveStage(stageId);
    return;
  }

  outgoing.classList.add("stage-indicator__item--stage-leaving");
  stageSwapTimer = window.setTimeout(() => {
    stageSwapTimer = undefined;
    outgoing.classList.remove("stage-indicator__item--stage-leaving");
    applyActiveStage(stageId);

    const incoming = stageIndicator.querySelector(`[data-stage-id="${stageId}"]`);
    incoming?.classList.add("stage-indicator__item--stage-entering");
    stageLabelTimer = window.setTimeout(() => {
      stageLabelTimer = undefined;
      incoming?.classList.remove("stage-indicator__item--stage-entering");
      const nextStage = pendingStage;
      pendingStage = "";
      if (nextStage && nextStage !== currentStage) {
        setActiveStage(nextStage);
      }
    }, stageBarTransitionDuration);
  }, stageLabelFadeDuration);
}

function updateActiveStage() {
  updateFrame = undefined;
  if (!stageTargets.length) {
    return;
  }

  if (guidedStage) {
    updateIndicatorVisibility();
    return;
  }

  const topOffset = 104;
  let activeStage = stageTargets[0];
  let closestDistance = Number.POSITIVE_INFINITY;

  stageTargets.forEach((stage) => {
    const distance = stage.element.getBoundingClientRect().top - topOffset;
    if (distance <= 0 && Math.abs(distance) < closestDistance) {
      closestDistance = Math.abs(distance);
      activeStage = stage;
    }
  });

  if (closestDistance === Number.POSITIVE_INFINITY) {
    activeStage = stageTargets.reduce((closest, stage) => {
      const distance = Math.abs(stage.element.getBoundingClientRect().top - topOffset);
      return distance < closest.distance ? { stage, distance } : closest;
    }, { stage: stageTargets[0], distance: Number.POSITIVE_INFINITY }).stage;
  }

  setActiveStage(activeStage.id);
  updateIndicatorVisibility();
}

function updateIndicatorVisibility() {
  const shouldShow =
    desktopIndicator.matches &&
    uiuxPanel?.classList.contains("panel--active") &&
    Boolean(caseStudyStages[getActiveProject()]);
  stageIndicator.classList.toggle("stage-indicator--visible", shouldShow);
  stageIndicator.setAttribute("aria-hidden", String(!shouldShow));
  stageIndicator.inert = !shouldShow;
  stageIndicator.querySelectorAll("a").forEach((link) => {
    link.tabIndex = shouldShow ? 0 : -1;
  });
}

function queueIndicatorUpdate() {
  if (updateFrame !== undefined) {
    return;
  }
  updateFrame = requestAnimationFrame(updateActiveStage);
}

function syncIndicatorProject() {
  const nextProject = getActiveProject();
  if (nextProject !== currentProject) {
    renderIndicator(nextProject);
  } else {
    queueIndicatorUpdate();
  }
  updateIndicatorVisibility();
}

const indicatorStateObserver = new MutationObserver((records) => {
  const projectStateChanged = records.some((record) =>
    record.target.matches?.('[data-panel="uiux"], [data-project-panel]'),
  );
  if (projectStateChanged) {
    syncIndicatorProject();
  }
});
if (uiuxPanel) {
  indicatorStateObserver.observe(uiuxPanel, {
    attributes: true,
    attributeFilter: ["class"],
    subtree: true,
  });
}

window.addEventListener("scroll", queueIndicatorUpdate, { passive: true });
window.addEventListener("resize", queueIndicatorUpdate);
window.addEventListener("wheel", cancelGuidedScroll, { passive: true });
window.addEventListener("touchstart", cancelGuidedScroll, { passive: true });
window.addEventListener("pointerdown", (event) => {
  if (guidedStage && !stageIndicator.contains(event.target)) {
    cancelGuidedScroll();
  }
}, { passive: true });
window.addEventListener("keydown", (event) => {
  if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(event.key)) {
    cancelGuidedScroll();
  }
});
window.addEventListener("hashchange", syncIndicatorProject);
window.addEventListener("popstate", syncIndicatorProject);
desktopIndicator.addEventListener?.("change", updateIndicatorVisibility);

syncIndicatorProject();
