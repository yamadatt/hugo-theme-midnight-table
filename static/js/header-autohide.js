/* Mobile only: hide the sticky topbar while scrolling down, reveal on scroll up.
   Frees vertical space for content. Desktop behaviour is unchanged. */
(function () {
  var topbar = document.querySelector(".topbar");
  if (!topbar) return;

  var mq = window.matchMedia("(max-width: 640px)");
  var lastY = window.pageYOffset || 0;
  var ticking = false;
  var threshold = 6;   // ignore jitter / tiny scrolls
  var revealAt = 80;   // always show near the top of the page

  function reveal() {
    topbar.classList.remove("is-hidden");
  }

  function update() {
    ticking = false;

    // Desktop: never hide.
    if (!mq.matches) { reveal(); lastY = window.pageYOffset || 0; return; }

    // Keep visible while the mobile menu is open.
    if (topbar.classList.contains("nav-open")) {
      reveal();
      lastY = window.pageYOffset || 0;
      return;
    }

    var y = window.pageYOffset || 0;
    var diff = y - lastY;
    if (Math.abs(diff) < threshold) return;

    if (y < revealAt) {
      reveal();
    } else if (diff > 0) {
      topbar.classList.add("is-hidden");  // scrolling down
    } else {
      reveal();                           // scrolling up
    }
    lastY = y;
  }

  window.addEventListener("scroll", function () {
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });

  function onModeChange() { reveal(); lastY = window.pageYOffset || 0; }
  if (mq.addEventListener) {
    mq.addEventListener("change", onModeChange);
  } else if (mq.addListener) {
    mq.addListener(onModeChange);
  }
})();
