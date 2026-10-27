// Helper dipakai halaman utama dan Shop: data, kontak, dan semua animasi halus.
window.Site = (function () {
  const esc = (s) =>
    String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const load = () =>
    fetch('/api/content').then((r) => {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    });

  const money = (n, cur) => {
    n = Number(n) || 0;
    if (n === 0) return 'Free';
    try {
      return new Intl.NumberFormat(cur === 'USD' ? 'en-US' : 'id-ID', {
        style: 'currency', currency: cur === 'USD' ? 'USD' : 'IDR',
        maximumFractionDigits: cur === 'USD' ? 2 : 0
      }).format(n);
    } catch (e) { return String(n); }
  };

  const waLink = (number, text) => 'https://wa.me/' + number + '?text=' + encodeURIComponent(text);

  // Ikon panah untuk tombol bulat oranye
  const ARROW = '<span class="ar" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>';

  // Isi bagian kontak/footer dari pengaturan (dipakai di kedua halaman)
  const applyContact = (s) => {
    const em = document.getElementById('email');
    if (em && s.email) em.textContent = s.email;
    const soc = document.getElementById('social');
    if (soc) {
      let h = '';
      if (s.instagram) h += '<a href="https://www.instagram.com/' + esc(s.instagram) + '/" target="_blank" rel="noopener">Instagram @' + esc(s.instagram) + '</a>';
      if (s.whatsapp) h += '<a href="https://wa.me/' + esc(s.whatsapp) + '" target="_blank" rel="noopener">WhatsApp</a>';
      soc.innerHTML = h;
    }
  };

  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;

  // ---------- reveal saat scroll ----------
  let io = null;
  function reveal(scope) {
    const els = (scope || document).querySelectorAll('[data-r]:not(.in)');
    if (!('IntersectionObserver' in window) || reduce) { els.forEach((e) => e.classList.add('in')); return; }
    if (!io) {
      io = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          const t = en.target;
          t.classList.add('in'); io.unobserve(t);
          // setelah animasi masuk selesai, lepas transisi reveal agar hover tetap responsif
          setTimeout(() => t.removeAttribute('data-r'), 1500);
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    }
    els.forEach((e) => io.observe(e));
  }

  // Efek sorot cahaya + magnet pada elemen interaktif (dipanggil ulang untuk elemen baru)
  function bindFx(scope) {
    if (!fine || reduce) return;
    (scope || document).querySelectorAll('.svc:not([data-fx])').forEach((el) => {
      el.dataset.fx = '1';
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        el.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
    (scope || document).querySelectorAll('.magnetic:not([data-mg])').forEach((el) => {
      el.dataset.mg = '1';
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - (r.left + r.width / 2)) * 0.22;
        const y = (e.clientY - (r.top + r.height / 2)) * 0.3;
        el.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  // Hitung naik untuk angka statistik
  function countUp(el) {
    const to = +el.dataset.count || 0;
    if (reduce || !to) { el.textContent = to; return; }
    const t0 = performance.now(), dur = 1400;
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 4)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
  function bindCounters(scope) {
    const els = (scope || document).querySelectorAll('[data-count]:not([data-cd])');
    els.forEach((el) => {
      el.dataset.cd = '1';
      if (!('IntersectionObserver' in window)) { el.textContent = el.dataset.count; return; }
      const o = new IntersectionObserver((en) => { if (en[0].isIntersecting) { countUp(el); o.disconnect(); } }, { threshold: 0.6 });
      o.observe(el);
    });
  }

  function init() {
    const bar = document.querySelector('.bar');
    const prog = document.querySelector('.progress');
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.bar nav');

    if (burger && nav) {
      const set = (open) => { burger.setAttribute('aria-expanded', open); nav.classList.toggle('open', open); };
      burger.addEventListener('click', () => set(burger.getAttribute('aria-expanded') !== 'true'));
      nav.addEventListener('click', (e) => { if (e.target.closest('a')) set(false); });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') set(false); });
    }

    // scroll: progress bar, nav sembunyi saat turun & muncul saat naik, parallax
    const feature = document.querySelector('.feature');
    const blobs = document.querySelectorAll('.blob');
    const portrait = document.getElementById('portrait');
    const ptilt = portrait && portrait.querySelector('.p-tilt');
    const psway = portrait && portrait.querySelector('.p-sway');
    let trx = 0, try_ = 0, crx = 0, cry = 0, raf2 = 0;
    let lastY = window.scrollY, ticking = false, mx = 0, my = 0;

    function frame() {
      ticking = false;
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - innerHeight;
      if (prog) prog.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, y / max) : 0) + ')';
      if (bar) {
        bar.classList.toggle('solid', y > 40);
        const navOpen = nav && nav.classList.contains('open');
        bar.classList.toggle('hide', y > lastY + 4 && y > 240 && !navOpen);
        if (y < lastY - 4) bar.classList.remove('hide');
      }
      lastY = y;
      if (!reduce) {
        if (y < innerHeight * 1.2) {
          if (feature) feature.style.transform = 'translate3d(' + (mx * 14).toFixed(1) + 'px,' + (-y * 0.1 + my * 10).toFixed(1) + 'px,0) rotate(' + (3 + mx * 2).toFixed(2) + 'deg) rotateX(' + (-my * 4).toFixed(2) + 'deg) rotateY(' + (mx * 6).toFixed(2) + 'deg)';
          blobs.forEach((b, i) => { b.style.translate = (mx * (i ? -26 : 26)) + 'px ' + (y * (i ? -0.05 : 0.08)) + 'px'; });
        }
      }
    }
    const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
    addEventListener('scroll', req, { passive: true });
    addEventListener('resize', req);
    if (fine && !reduce) {
      addEventListener('pointermove', (e) => {
        mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; req();
      }, { passive: true });
    }
    // tilt 3D foto About: mengikuti kursor, kembali ke ayunan pelan saat kursor pergi
    if (ptilt && fine && !reduce) {
      const loop = () => {
        crx += (trx - crx) * 0.08; cry += (try_ - cry) * 0.08;
        ptilt.style.setProperty('--rx', crx.toFixed(2) + 'deg');
        ptilt.style.setProperty('--ry', cry.toFixed(2) + 'deg');
        raf2 = (Math.abs(trx - crx) > 0.02 || Math.abs(try_ - cry) > 0.02) ? requestAnimationFrame(loop) : 0;
      };
      const kick = () => { if (!raf2) raf2 = requestAnimationFrame(loop); };
      portrait.addEventListener('pointermove', (e) => {
        const r = portrait.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
        try_ = px * 18; trx = -py * 14;
        if (psway) psway.style.animationPlayState = 'paused';
        kick();
      });
      portrait.addEventListener('pointerleave', () => { trx = 0; try_ = 0; if (psway) psway.style.animationPlayState = ''; kick(); });
    }
    frame();

    reveal(); bindFx(); bindCounters();

    // tombol salin email
    const copy = document.getElementById('copy');
    const em = document.getElementById('email');
    if (copy && em) {
      const label = copy.querySelector('.lab-t') || copy;
      const orig = label.textContent;
      copy.addEventListener('click', () => {
        const ok = () => { label.textContent = 'Copied!'; setTimeout(() => (label.textContent = orig), 1600); };
        const fb = () => {
          const rg = document.createRange(); rg.selectNodeContents(em);
          const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(rg);
          label.textContent = 'Selected'; setTimeout(() => (label.textContent = orig), 1600);
        };
        try { navigator.clipboard.writeText(em.textContent).then(ok, fb); } catch (e) { fb(); }
      });
    }
  }

  // Lightbox: animasi keluar yang halus
  function closeLb(lb, done) {
    if (reduce) { lb.hidden = true; done && done(); return; }
    lb.classList.add('out');
    setTimeout(() => { lb.hidden = true; lb.classList.remove('out'); done && done(); }, 260);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();

  return { esc, load, money, waLink, applyContact, reveal, bindFx, bindCounters, closeLb, ARROW, reduce };
})();
