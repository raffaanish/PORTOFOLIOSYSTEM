// Helper kecil yang dipakai halaman utama dan Shop.
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
    const copy = document.getElementById('copy');
    if (copy && em) {
      copy.addEventListener('click', () => {
        const ok = () => { copy.textContent = 'Copied'; setTimeout(() => (copy.textContent = 'Copy'), 1600); };
        const fb = () => {
          const rg = document.createRange(); rg.selectNodeContents(em);
          const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(rg);
          copy.textContent = 'Selected'; setTimeout(() => (copy.textContent = 'Copy'), 1600);
        };
        try { navigator.clipboard.writeText(em.textContent).then(ok, fb); } catch (e) { fb(); }
      });
    }
  };

  return { esc, load, money, waLink, applyContact };
})();
