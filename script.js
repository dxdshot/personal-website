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

  rail.addEventListener(
    "wheel",
    (event) => {
      if (limit() <= 0) return;
      const delta =
        Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      if (!delta) return;
      if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) event.preventDefault();
      goTo(rail.scrollLeft + delta);
    },
    { passive: false },
  );

  let dragging = false;
  let startX = 0;
  let startLeft = 0;

  rail.addEventListener("pointerdown", (event) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
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
  };

  rail.addEventListener("pointerup", endDrag);
  rail.addEventListener("pointercancel", endDrag);

  window.addEventListener("resize", () => {
    target = Math.min(target, limit());
    goTo(target);
  });
})();

