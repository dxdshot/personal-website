(() => {
  if (!window.matchMedia("(hover: hover)").matches) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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

  const triggers = [];
  document.querySelectorAll("[data-hover-preview]").forEach((trigger) => {
    const preview = document.getElementById(trigger.dataset.hoverPreview);
    if (preview) triggers.push(bind(trigger, preview));
  });

  window.addEventListener("blur", () => {
    triggers.forEach((hide) => hide());
  });
})();
