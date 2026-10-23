(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (window.matchMedia("(hover: hover)").matches) {
    const ease = reduceMotion ? 1 : 0.18;
    const inset = 16;

    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

    const bind = (trigger, preview) => {
      let targetX = 0;
      let targetY = 0;
      let currentX = 0;
      let currentY = 0;
      let frame = 0;
      let active = false;

      const aim = (clientX, clientY) => {
        const halfWidth = preview.offsetWidth / 2;
        const halfHeight = preview.offsetHeight / 2;
        targetX = clamp(clientX, halfWidth + inset, window.innerWidth - halfWidth - inset);
        targetY = clamp(clientY, halfHeight + inset, window.innerHeight - halfHeight - inset);
      };

      const place = () => {
        preview.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;
      };

      const render = () => {
        currentX += (targetX - currentX) * ease;
        currentY += (targetY - currentY) * ease;
        place();

        const settled =
          Math.abs(targetX - currentX) < 0.1 &&
          Math.abs(targetY - currentY) < 0.1 &&
          !active;

        frame = settled ? 0 : requestAnimationFrame(render);
      };

      const start = () => {
        if (!frame) frame = requestAnimationFrame(render);
      };

      const hide = () => {
        active = false;
        preview.classList.remove("is-visible");
        start();
      };

      trigger.addEventListener("mouseenter", (event) => {
        aim(event.clientX, event.clientY);
        currentX = targetX;
        currentY = targetY;
        place();
        active = true;
        preview.classList.add("is-visible");
        start();
      });

      trigger.addEventListener("mousemove", (event) => {
        aim(event.clientX, event.clientY);
        start();
      });

      trigger.addEventListener("mouseleave", hide);

      return hide;
    };

    const previews = [];
    document.querySelectorAll("[data-hover-preview]").forEach((trigger) => {
      const preview = document.getElementById(trigger.dataset.hoverPreview);
      if (preview) previews.push(bind(trigger, preview));
    });

    window.addEventListener("blur", () => {
      previews.forEach((hide) => hide());
    });
  }

  const stage = document.querySelector(".projects-stage");
  const projectOpen = document.querySelector(".folder-open");
  const projectBack = document.querySelector(".project-back");
  if (stage && projectOpen && projectBack) {
    const showDetail = () => {
      stage.dataset.view = "detail";
      requestAnimationFrame(() => projectBack.focus({ preventScroll: true }));
    };
    const showRail = () => {
      stage.dataset.view = "rail";
      projectOpen.focus({ preventScroll: true });
    };
    projectOpen.addEventListener("click", showDetail);
    projectBack.addEventListener("click", showRail);
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && stage.dataset.view === "detail") showRail();
    });
  }

  const rail = document.querySelector(".project-rail");
  if (!rail) return;

  let target = rail.scrollLeft;
  let current = rail.scrollLeft;
  let frame = 0;

  const limit = () => Math.max(0, rail.scrollWidth - rail.clientWidth);

  const render = () => {
    current += (target - current) * (reduceMotion ? 1 : 0.16);
    if (Math.abs(target - current) < 0.5) {
      current = target;
      rail.scrollLeft = current;
      frame = 0;
      return;
    }
    rail.scrollLeft = current;
    frame = requestAnimationFrame(render);
  };

  const goTo = (value) => {
    current = rail.scrollLeft;
    target = Math.min(Math.max(value, 0), limit());
    if (!frame) frame = requestAnimationFrame(render);
  };

  // Resting positions that leave a folder fully in view: the start, each
  // folder's right edge, and the end. Settling on these is what makes the last
  // folder readable after a single scroll gesture.
  const stops = () => {
    const railLeft = rail.getBoundingClientRect().left;
    const positions = [0, limit()];
    for (const card of rail.querySelectorAll(".folder-card")) {
      const rect = card.getBoundingClientRect();
      const right = rect.right - railLeft + rail.scrollLeft;
      positions.push(Math.min(limit(), Math.max(0, right - rail.clientWidth + 24)));
    }
    return [...new Set(positions.map((value) => Math.round(value)))].sort((a, b) => a - b);
  };

  const nearestStop = (value) =>
    stops().reduce((best, stop) => (Math.abs(stop - value) < Math.abs(best - value) ? stop : best), 0);

  let snapTimer = 0;
  let direction = 0;
  const settle = () => {
    window.clearTimeout(snapTimer);
    snapTimer = window.setTimeout(() => {
      const list = stops();
      const stop = direction > 0
        ? (list.find((value) => value >= target - 0.5) ?? list[list.length - 1])
        : ([...list].reverse().find((value) => value <= target + 0.5) ?? 0);
      if (Math.abs(stop - target) > 1) goTo(stop);
    }, 160);
  };

  rail.addEventListener(
    "wheel",
    (event) => {
      if (limit() <= 0) return;
      const delta =
        Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      if (!delta) return;
      // At either end the rail must not swallow the wheel: let the page scroll
      // so reaching the last folder never traps the visitor.
      if ((target <= 0 && delta < 0) || (target >= limit() - 0.5 && delta > 0)) return;
      event.preventDefault();
      direction = delta > 0 ? 1 : -1;
      goTo(target + delta);
      settle();
    },
    { passive: false },
  );

  // Touch scrolling (and any scroll not driven by goTo) resyncs the animated
  // target so a later wheel event starts from the real position.
  rail.addEventListener("scroll", () => {
    if (frame) return;
    target = current = rail.scrollLeft;
  });

  let dragging = false;
  let startX = 0;
  let startLeft = 0;

  rail.addEventListener("pointerdown", (event) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    // The first folder is a link to the project page, not a drag handle.
    if (event.target.closest(".folder-open")) return;
    dragging = true;
    startX = event.clientX;
    startLeft = rail.scrollLeft;
    target = rail.scrollLeft;
    current = rail.scrollLeft;
    rail.classList.add("is-dragging");
    rail.setPointerCapture(event.pointerId);
  });

  rail.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    rail.scrollLeft = startLeft - (event.clientX - startX);
    target = rail.scrollLeft;
    current = rail.scrollLeft;
  });

  const endDrag = (event) => {
    if (!dragging) return;
    dragging = false;
    rail.classList.remove("is-dragging");
    if (rail.hasPointerCapture(event.pointerId)) rail.releasePointerCapture(event.pointerId);
    const stop = nearestStop(target);
    if (Math.abs(stop - target) > 1) goTo(stop);
  };

  rail.addEventListener("pointerup", endDrag);
  rail.addEventListener("pointercancel", endDrag);

  window.addEventListener("resize", () => {
    target = Math.min(target, limit());
    goTo(target);
  });
})();

