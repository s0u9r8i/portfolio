(() => {
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;

  // Keep every element visible if the animation dependency does not load.
  if (!gsap || !ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);
  document.documentElement.classList.add("scroll-reveal-active");

  const groups = [
    ".project-tabs:not(.project-tabs--bottom) .project-card",
    ".softground > :not(.project-tabs--bottom)",
    ".kochidoko > :not(.project-tabs--bottom)",
    ".graphic-item",
    ".one-row-project__slide",
    ".readery > section",
    ".quesay__hero-art",
    ".quesay__hero-main",
    ".quesay__role",
    ".quesay-section__intro",
    ".quesay-section__visual",
    ".animalove__canvas > section",
    ".animalove__post-quotes",
    ".webdesign-case > section",
    ".mograph__video",
    ".mograph__caption"
  ];

  const prepared = new Set();
  let refreshTimer;

  const media = gsap.matchMedia();

  media.add(
    "(prefers-reduced-motion: no-preference)",
    () => {
      const prepareVisibleContent = () => {
        const isCompact = window.matchMedia("(max-width: 743px)").matches;
        const distance = isCompact ? 18 : 28;
        const duration = 0.5;

        groups.forEach((selector) => {
          const targets = gsap.utils
            .toArray(selector)
            .filter((element) => element.getClientRects().length > 0 && !prepared.has(element));

          if (!targets.length) return;

          targets.forEach((element) => prepared.add(element));
          gsap.set(targets, {
            autoAlpha: 0,
            y: distance,
            willChange: "transform, opacity"
          });

          ScrollTrigger.batch(targets, {
            group: "portfolio-reveal",
            start: "top 88%",
            once: true,
            interval: 0.04,
            batchMax: isCompact ? 2 : 4,
            onEnter: (batch) => {
              gsap.to(batch, {
                autoAlpha: 1,
                y: 0,
                duration,
                ease: "power1.out",
                stagger: 0.04,
                overwrite: "auto",
                clearProps: "opacity,visibility,transform,willChange"
              });
            }
          });
        });

        window.requestAnimationFrame(() => ScrollTrigger.refresh());
      };

      const queueRefresh = () => {
        window.clearTimeout(refreshTimer);
        refreshTimer = window.setTimeout(prepareVisibleContent, 80);
      };

      const content = document.querySelector("[data-content-stage]");
      const observer = new MutationObserver((records) => {
        const layoutChanged = records.some((record) =>
          record.type === "childList"
          || record.target.matches?.("[data-panel], [data-project-panel]"),
        );
        if (layoutChanged) {
          queueRefresh();
        }
      });

      if (content) {
        observer.observe(content, {
          subtree: true,
          childList: true,
          attributes: true,
          attributeFilter: ["class"]
        });
      }

      window.addEventListener("load", queueRefresh, { once: true });
      window.addEventListener("resize", queueRefresh, { passive: true });
      window.addEventListener("hashchange", queueRefresh);
      window.addEventListener("portfolio:session-ready", prepareVisibleContent);

      prepareVisibleContent();

      return () => {
        observer.disconnect();
        window.clearTimeout(refreshTimer);
        window.removeEventListener("load", queueRefresh);
        window.removeEventListener("resize", queueRefresh);
        window.removeEventListener("hashchange", queueRefresh);
        window.removeEventListener("portfolio:session-ready", prepareVisibleContent);
        ScrollTrigger.getAll()
          .filter((trigger) => trigger.vars.group === "portfolio-reveal")
          .forEach((trigger) => trigger.kill());
        gsap.set(Array.from(prepared), {
          clearProps: "opacity,visibility,transform,willChange"
        });
        prepared.clear();
      };
    }
  );
})();
