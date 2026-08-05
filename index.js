/* ==========================================================================
   Crystal Brock : crystalbrock.org
   ========================================================================== */
(function () {
  'use strict';

  /* ---------- mobile navigation ---------- */
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');

  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    // close the menu after tapping any link
    links.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });

    // close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && links.classList.contains('open')) {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
  }

  /* ---------- live project previews ----------
     Each iframe renders at a fixed 1280x720 desktop viewport, then is scaled
     to whatever width its card happens to be. Recomputed on resize. */
  var frames = document.querySelectorAll('.live-frame');
  if (frames.length) {
    var fit = function () {
      Array.prototype.forEach.call(frames, function (f) {
        var w = f.parentElement.clientWidth;
        f.style.transform = 'scale(' + (w / 1280) + ')';
      });
    };
    fit();
    window.addEventListener('resize', fit);
    window.addEventListener('load', fit);
  }
})();
