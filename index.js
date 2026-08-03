/* ==========================================================================
   Crystal Brock — crystalbrock.org
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

  /* ---------- pet photo galleries (About page) ---------- */
  var SETS = {
    zelda: [
      'Zelda1.jpg', 'Zelda2.jpg', 'Zelda3.jpg', 'Zelda4.jpg', 'Zelda5.jpg',
      'Zelda6.jpg', 'Zelda7.jpg', 'Zelda8.jpg', 'Zelda9.jpg', 'Zelda10.jpg'
    ],
    oscar: [
      'Oscar1.jpg', 'Oscar2.jpg', 'Oscar3.jpg', 'Oscar4.jpg', 'Oscar5.jpg',
      'Oscar6.jpg', 'Oscar7.jpg', 'Oscar8.jpg', 'Oscar9.jpg', 'Oscar10.jpg',
      'Oscar11.jpg', 'Oscar12.jpg', 'Oscar13.jpg', 'Oscar14.jpg',
      'OscarandChris6_15.jpg'
    ]
  };

  var FOLDER = 'assets/';

  Array.prototype.forEach.call(
    document.querySelectorAll('[data-gallery]'),
    function (root) {
      var files = SETS[root.getAttribute('data-gallery')];
      if (!files || !files.length) return;

      var img = root.querySelector('[data-target]');
      var counter = root.querySelector('[data-count]');
      var i = 0;

      // preload so navigation is instant
      files.forEach(function (f) {
        var pre = new Image();
        pre.src = FOLDER + f;
      });

      function render() {
        img.src = FOLDER + files[i];
        if (counter) counter.textContent = (i + 1) + ' / ' + files.length;
      }

      root.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-dir]');
        if (!btn) return;
        // wrap cleanly in both directions
        i = (i + parseInt(btn.getAttribute('data-dir'), 10) + files.length) % files.length;
        render();
      });

      render();
    }
  );
})();
