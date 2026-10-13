/* Dashboard behaviour (admin + public): left-menu panels, animated visuals, interactions.
   Works without GSAP too (values simply appear without animation). */
(function() {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const hasGsap = typeof gsap !== 'undefined';
  const fmt = n => Math.round(n).toLocaleString('en-US');
  const barHeight = i => (25 + Math.abs(Math.sin(i * 1.7)) * 70) + '%';

  /* ---------- Profile menu ---------- */
  const pb = $('.pb'),
    pm = $('.pmenu'),
    dburger = $('.dburger'),
    dashboardSide = $('.side');

  function dashboardMenu(open) {
    dashboardSide.classList.toggle('open', open);
    dburger.setAttribute('aria-expanded', open);
    dburger.setAttribute('aria-label', open ? 'Close dashboard menu' : 'Open dashboard menu');
  }

  dburger.addEventListener('click', e => {
    e.stopPropagation();
    dashboardMenu(!dashboardSide.classList.contains('open'));
  });
  dashboardSide.addEventListener('click', e => {
    if (e.target.closest('.mi')) dashboardMenu(false);
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) dashboardMenu(false);
  });

  function menu(open) {
    pm.classList.toggle('open', open);
    pb.setAttribute('aria-expanded', open);
    if (open && hasGsap) gsap.from(pm, {
      y: -12,
      opacity: 0,
      scale: .96,
      duration: .3,
      ease: 'power3.out'
    });
  }
  pb.addEventListener('click', e => {
    e.stopPropagation();
    menu(!pm.classList.contains('open'));
  });
  document.addEventListener('click', e => {
    if (!pm.contains(e.target)) menu(false);
    if (dashboardSide.classList.contains('open') &&
        !dashboardSide.contains(e.target) &&
        !dburger.contains(e.target)) dashboardMenu(false);
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      const sideWasOpen = dashboardSide.classList.contains('open');
      dashboardMenu(false);
      menu(false);
      if (sideWasOpen) dburger.focus();
      else pb.focus();
    }
  });

  /* ---------- Line chart (successful vs failed sign-ins), drawn with SVG ---------- */
  const line = $('#line');
  if (line) {
    const ok = [62, 70, 66, 78, 84, 80, 91, 88, 95, 90, 99, 96, 104, 100],
      bad = [9, 12, 8, 14, 10, 18, 11, 9, 13, 8, 12, 7, 10, 6];
    const path = (a, max) => a.map((v, i) => (i ? 'L' : 'M') + (i * 600 / (a.length - 1)).toFixed(1) + ' ' + (160 - v / max * 150).toFixed(1)).join(' ');
    line.innerHTML = '<svg viewBox="0 0 600 160" preserveAspectRatio="none" role="img" aria-label="Successful and failed sign-ins over 14 days">' +
      '<path pathLength="1" d="' + path(ok, 110) + '" fill="none" stroke="#34D399" stroke-width="3"/>' +
      '<path pathLength="1" d="' + path(bad, 110) + '" fill="none" stroke="#FB7185" stroke-width="3"/></svg>';
  }

  /* ---------- Animated visuals inside a container (a panel, or the sidebar) ---------- */
  function animate(scope) {
    $$('[data-n]', scope).forEach(el => {
      if (!hasGsap) {
        el.textContent = fmt(+el.dataset.n);
        return;
      }
      const o = {
        v: 0
      };
      gsap.to(o, {
        v: +el.dataset.n,
        duration: 1.6,
        ease: 'power2.out',
        onUpdate: () => el.textContent = fmt(o.v)
      });
    });
    $$('.bars i', scope).forEach((b, i) => hasGsap ? gsap.fromTo(b, {
      height: '4%'
    }, {
      height: barHeight(i),
      duration: 1,
      delay: .2 + i * .04,
      ease: 'power3.out'
    }) : b.style.height = barHeight(i));
    $$('.m i', scope).forEach(b => hasGsap ? gsap.fromTo(b, {
      width: '0%'
    }, {
      width: b.dataset.w + '%',
      duration: 1.2,
      delay: .3
    }) : b.style.width = b.dataset.w + '%');
    $$('.ring .v', scope).forEach(r => {
      const to = 283 * (1 - r.dataset.p / 100);
      hasGsap ? gsap.fromTo(r, {
        strokeDashoffset: 283
      }, {
        strokeDashoffset: to,
        duration: 1.4,
        delay: .2
      }) : r.style.strokeDashoffset = to;
    });
    $$('#line path', scope).forEach(p => hasGsap && gsap.fromTo(p, {
      strokeDasharray: 1,
      strokeDashoffset: 1
    }, {
      strokeDashoffset: 0,
      duration: 1.8,
      ease: 'power2.out'
    }));
    if (hasGsap) gsap.fromTo($$('.pt, .c', scope), {
      y: 26,
      opacity: 0
    }, {
      y: 0,
      opacity: 1,
      duration: .55,
      stagger: .05,
      ease: 'power3.out',
      overwrite: true,
      clearProps: 'transform,opacity'
    });
  }
  const side = $('.side');
  $$('.side .ring .v').forEach(r => animate(r.closest('.mini'))); // sidebar score ring, once

  /* ---------- Left menu: one panel at a time, linked to the URL hash ---------- */
  const items = $$('.mi'),
    panels = $$('.dpanel'),
    ids = panels.map(p => p.id);

  function show(id) {
    if (!ids.includes(id)) id = ids[0];
    items.forEach(i => {
      const on = i.dataset.panel === id;
      i.classList.toggle('on', on);
      if (on) {
        i.setAttribute('aria-current', 'page');
        if (i.scrollIntoView) i.scrollIntoView({
          inline: 'center',
          block: 'nearest'
        });
      } else i.removeAttribute('aria-current');
    });
    panels.forEach(p => p.classList.toggle('on', p.id === id));
    animate($('#' + id));
    scrollTo(0, 0);
  }
  addEventListener('hashchange', () => show(location.hash.slice(1)));
  show(location.hash.slice(1));

  /* ---------- Menu badges ---------- */
  function badges() {
    const set = (k, n) => $$('[data-badge=' + k + ']').forEach(b => {
      b.textContent = n;
      if (n) b.removeAttribute('data-zero');
      else b.setAttribute('data-zero', '');
    });
    if ($('#pend')) set('pend', $('#pend').children.length);
    if ($('.rec')) set('recs', $$('.rec:not(.done)').length);
  }

  /* ---------- Admin interactions ---------- */
  $$('[data-act=approve],[data-act=reject]').forEach(b => b.addEventListener('click', () => {
    const li = b.closest('li');
    $(b.dataset.act === 'approve' ? '#appr' : '#rej').append(li);
    li.querySelector('.acts').remove();
    ['pend', 'appr', 'rej'].forEach(k => $('[data-c=' + k + ']').textContent = $('#' + k).children.length);
    badges();
    if (hasGsap) gsap.from(li, {
      x: -20,
      opacity: 0,
      duration: .4
    });
  }));
  const uq = $('#uq');
  if (uq) uq.addEventListener('input', () => $$('#utable tbody tr').forEach(tr => tr.hidden = !tr.textContent.toLowerCase().includes(uq.value.toLowerCase())));
  const q = $('#q'),
    lv = $('#lv');
  if (q) {
    const run = () => $$('#audit tbody tr').forEach(tr => {
      tr.hidden = !(tr.textContent.toLowerCase().includes(q.value.toLowerCase()) && (!lv.value || tr.dataset.lv === lv.value));
    });
    q.addEventListener('input', run);
    lv.addEventListener('change', run);
  }

  /* Live activity feed */
  const feed = $('#feed');
  if (feed) {
    const ev = ['Access granted: maya.rivera → Admin Console', 'MFA challenge passed: liam.chen', 'Blocked sign-in from unknown device', 'Role updated: Developer → Manager', 'Session revoked: partner-042', 'Policy "Finance-only" updated'];
    let n = 0;
    feed.innerHTML = '';   // replace the placeholder with a few recent events
    ev.slice(0, 5).forEach((text, i) => {
      const li = document.createElement('li');
      li.textContent = new Date(Date.now() - (i + 1) * 4 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + '  ' + text;
      feed.append(li);
    });
    setInterval(() => {
      const li = document.createElement('li');
      li.textContent = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      }) + '  ' + ev[n++ % ev.length];
      feed.prepend(li);
      if (hasGsap) gsap.from(li, {
        y: -16,
        opacity: 0,
        duration: .5
      });
      if (feed.children.length > 7) feed.lastChild.remove();
    }, 3500);
  }

  /* ---------- Public interactions ---------- */
  $$('[data-act=remove]').forEach(b => b.addEventListener('click', () => {
    const t = b.closest('.rm');
    if (hasGsap) gsap.to(t, {
      opacity: 0,
      x: 30,
      duration: .3,
      onComplete: () => t.remove()
    });
    else t.remove();
  }));
  $$('.sw').forEach(s => s.addEventListener('click', () => s.setAttribute('aria-pressed', s.getAttribute('aria-pressed') !== 'true')));
  $$('[data-act=done]').forEach(b => b.addEventListener('click', () => {
    b.closest('.rec').classList.add('done');
    b.textContent = 'Done';
    b.disabled = true;
    badges();
  }));
  const hi = $('#hi');
  if (hi) {
    const h = new Date().getHours();
    hi.textContent = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  }
  badges();
})();