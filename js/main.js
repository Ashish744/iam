/* Stackly site behaviour: loader, GSAP animations, cards, accordion, marquee. */
(function() {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const loader = $('#loader');

  /* Auto-flow rows: duplicate the cards once so the loop is seamless */
  $$('.flow-track').forEach(t => {
    t.innerHTML += t.innerHTML;
    [...t.children].slice(t.children.length / 2).forEach(c => c.setAttribute('aria-hidden', 'true'));
  });

  /* Generated artwork for image-style cards ([data-g="colorA,colorB"]) */
  $$('[data-g]').forEach((el, i) => {
    const [a, b] = el.dataset.g.split(',');
    el.insertAdjacentHTML('afterbegin',
      `<svg viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="g${i}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="300" height="400" fill="url(#g${i})"/><g fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="2"><circle cx="${90 + i * 20 % 120}" cy="130" r="70"/><circle cx="${200 - i * 15 % 80}" cy="210" r="110"/><path d="M0 300 80 250 150 290 230 220 300 260"/></g><g fill="#fff" fill-opacity=".85"><circle cx="150" cy="120" r="26"/><path d="M96 230c0-34 24-54 54-54s54 20 54 54z"/></g></svg>`);
  });


  /* If GSAP failed to load (offline / blocked CDN) show the page without animation */
  if (typeof gsap === 'undefined') {
    if (loader) loader.remove();
    basics();
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;

  basics();

  /* Loader: bento grid, then reveal the page */
  function startPage() {
    revealHeader();
    if (!reduce) { initScroll(); initRobot(); }
    initClash();
  }
  if (loader && !reduce) {
    const cells = $$('.bento div', loader);
    gsap.timeline({
        onComplete: () => {
          loader.remove();
          startPage();
        }
      })
      .from('.lw', {
        y: -20,
        opacity: 0,
        duration: .4
      })
      .fromTo(cells, {
        opacity: 0,
        scale: .4
      }, {
        opacity: 1,
        scale: 1,
        duration: .45,
        stagger: {
          each: .12,
          from: 'random'
        },
        ease: 'back.out(2)'
      }, 0)
      .to('#bar i', {
        width: '100%',
        duration: 1.1,
        ease: 'power1.inOut'
      }, 0)
      .to(loader, {
        clipPath: 'inset(0 0 100% 0)',
        duration: .7,
        ease: 'power3.inOut'
      }, '+=.15');
  } else {
    if (loader) loader.remove();
    startPage();
  }

  /* Hero / page header entrance (split-word reveal) */
  function revealHeader() {
    if (reduce) return;
    const h1 = $('.hero h1, .ph h1');
    if (h1) {
      /* Heading: every letter rises in, then a colour wave keeps running across it */
      h1.setAttribute('aria-label', h1.textContent.trim().replace(/\s+/g, ' '));
      $$('b', h1).forEach(b => {
        b.setAttribute('aria-hidden', 'true');
        b.innerHTML = [...b.textContent].map(c => `<i class="ch">${c}</i>`).join('');
      });
      const chars = $$('.ch', h1);
      gsap.from(chars, { yPercent: 120, rotate: 10, opacity: 0, duration: .9, stagger: .025, ease: 'back.out(1.7)',
        onComplete: () => gsap.to(chars, { color: '#FBBF24', duration: .35, stagger: { each: .05, repeat: -1, yoyo: true, repeatDelay: 3.5 } }) });
    }
    const lead = $('.hero .lead, .ph .lead');
    if (lead) {
      /* Paragraph: words fade and sharpen one after another */
      lead.innerHTML = lead.textContent.trim().split(/\s+/).map(w => `<span class="wd">${w}</span>`).join(' ');
      gsap.from($$('.wd', lead), { opacity: 0, y: 18, filter: 'blur(8px)', duration: .7, stagger: .035, delay: .6 });
    }
    if ($('.hero .btns')) gsap.from('.hero .btns .btn', { scale: .6, opacity: 0, duration: .7, stagger: .12, delay: 1.2, ease: 'back.out(2)' });
    if ($('.vis svg')) gsap.from('.vis svg', { scale: .7, rotate: -12, opacity: 0, duration: 1.4, ease: 'elastic.out(1,.6)' });
  }

  /* Scroll-driven animation */
  function initScroll() {
    $$('section h2').forEach(h => {
      if (h.closest('.cta') || h.classList.contains('clash-title')) return;
      gsap.fromTo(h, {
        clipPath: 'inset(0 100% 0 0)',
        x: -30
      }, {
        clipPath: 'inset(0 0% 0 0)',
        x: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: h,
          start: 'top 85%'
        }
      });
    });
    $$('p.lead,.st .r article').forEach(p => {
      if (p.closest('.hero,.ph')) return;
      gsap.from(p, {
        y: 40,
        opacity: 0,
        filter: 'blur(8px)',
        duration: .9,
        scrollTrigger: {
          trigger: p,
          start: 'top 88%'
        }
      });
    });
    $$('.grid3 > *').forEach((c, i) => gsap.from(c, {
      y: 60,
      opacity: 0,
      duration: .8,
      delay: (i % 3) * .12,
      scrollTrigger: {
        trigger: c,
        start: 'top 90%'
      }
    }));
    $$('.k').forEach((c, i) => gsap.from(c, {
      x: i % 2 ? 60 : -60,
      opacity: 0,
      duration: .8,
      scrollTrigger: {
        trigger: c,
        start: 'top 90%'
      }
    }));
    $$('.ac').forEach((c, i) => gsap.from(c, {
      scaleX: .85,
      opacity: 0,
      duration: .7,
      delay: i * .08,
      scrollTrigger: {
        trigger: c,
        start: 'top 92%'
      }
    }));
    if ($('.cta')) gsap.from('.cta h2 span', {
      y: 60,
      opacity: 0,
      rotate: 8,
      stagger: .1,
      duration: .8,
      scrollTrigger: {
        trigger: '.cta',
        start: 'top 70%'
      }
    });

    /* Counters */
    $$('[data-n]').forEach(el => {
      const o = {
          v: 0
        },
        d = +el.dataset.d || 0;
      gsap.to(o, {
        v: +el.dataset.n,
        duration: 2,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 90%'
        },
        onUpdate: () => el.textContent = o.v.toFixed(d).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (el.dataset.s || '')
      });
    });

    /* Analytics bars, risk ring, live feed */
    $$('.bars i').forEach((b, i) => gsap.to(b, {
      height: (25 + Math.abs(Math.sin(i * 1.7)) * 70) + '%',
      duration: 1.2,
      delay: i * .05,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: b,
        start: 'top 95%'
      }
    }));
    const ring = $('.ring .v');
    if (ring) gsap.fromTo(ring, {
      strokeDashoffset: 283
    }, {
      strokeDashoffset: 283 * .82,
      duration: 1.6,
      scrollTrigger: {
        trigger: ring,
        start: 'top 90%'
      }
    });
    /* Live data: every 2 seconds the chart shifts one step and the risk score updates */
    const intel = $('#intel');
    if (intel) {
      const bars = $$('.bars i', intel), num = $('#riskNum'), lbl = $('#riskLbl'), risk = { v: 18 };
      const data = bars.map((b, i) => 25 + Math.abs(Math.sin(i * 1.7)) * 70);
      let timer = null;
      const tick = () => {
        data.shift();
        data.push(20 + Math.random() * 75);
        bars.forEach((b, i) => gsap.to(b, { height: data[i] + '%', duration: .9, ease: 'power2.inOut', overwrite: 'auto' }));
        const score = Math.round(8 + Math.random() * 40);
        gsap.to(risk, { v: score, duration: 1, overwrite: 'auto', onUpdate: () => { num.textContent = Math.round(risk.v); } });
        if (ring) gsap.to(ring, { strokeDashoffset: 283 * (1 - score / 100), duration: 1, overwrite: 'auto' });
        lbl.textContent = score < 25 ? 'low' : score < 40 ? 'medium' : 'elevated';
      };
      const start = () => { if (!timer) timer = setInterval(tick, 2000); };
      const stop = () => { clearInterval(timer); timer = null; };
      ScrollTrigger.create({ trigger: intel, start: 'top 70%', end: 'bottom 15%', onEnter: start, onEnterBack: start, onLeave: stop, onLeaveBack: stop });
    }
    if ($('.feed span')) gsap.to('.feed span', {
      xPercent: -50,
      duration: 30,
      ease: 'none',
      repeat: -1
    });

    /* Horizontal scroll (desktop): pinned section, vertical scroll moves the track */
    gsap.matchMedia().add('(min-width:901px)', () => {
      $$('.hs').forEach(section => {
        const track = $('.track', section),
          progress = $('.prog b', section),
          steps = $$('.step', section);
        const dist = () => track.scrollWidth - innerWidth + 80;
        gsap.to(track, {
          x: () => -dist(),
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: () => '+=' + dist(),
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
            onUpdate: self => {
              if (progress) gsap.set(progress, {
                scaleX: self.progress
              });
              const active = Math.min(steps.length - 1, Math.floor(self.progress * steps.length));
              steps.forEach((s, i) => s.classList.toggle('on', i === active));
            }
          }
        });
        $$('.persona svg', section).forEach(v => gsap.to(v, {
          xPercent: -8,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            scrub: true,
            start: 'top top',
            end: '+=1500'
          }
        }));
      });
    });

    /* Floating cards and pulsing nodes */
    $$('.fc').forEach((c, i) => gsap.to(c, {
      y: i % 2 ? -16 : 16,
      x: i % 2 ? 8 : -8,
      duration: 2.2 + i * .4,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut'
    }));
    $$('.node').forEach((n, i) => gsap.to(n, {
      opacity: .25,
      scale: 1.4,
      transformOrigin: 'center',
      duration: 1 + i * .3,
      yoyo: true,
      repeat: -1
    }));

    /* Sticky section: swap the left heading as each right card passes */
    $$('.st .r article').forEach(a => ScrollTrigger.create({
      trigger: a,
      start: 'top 55%',
      end: 'bottom 55%',
      onToggle: s => {
        const l = $('.st .l h3');
        if (s.isActive && l) {
          l.textContent = a.dataset.t;
          gsap.fromTo(l, {
            opacity: 0,
            y: 14,
            filter: 'blur(6px)'
          }, {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: .5
          });
        }
      }
    }));
  }

  /* Robot assistant: floats, waves, blinks, follows the cursor and reacts to accordion clicks */
  function initRobot() {
    const bot = $('.bot');
    if (!bot) return;
    const q = s => $(s, bot);
    const head = q('.r-head'), arm = q('.r-arm'), say = q('#botSay');

    gsap.from(bot, { y: -90, opacity: 0, duration: 1.3, ease: 'bounce.out', scrollTrigger: { trigger: bot, start: 'top 85%' } });
    gsap.to(q('.r-body'), { y: -10, duration: 1.8, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    gsap.to(q('.r-shadow'), { scaleX: .8, opacity: .22, transformOrigin: '50% 50%', duration: 1.8, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    gsap.to(q('.r-jet'), { scaleY: 1.5, transformOrigin: '50% 0%', duration: .18, yoyo: true, repeat: -1 });
    gsap.to(q('.r-ant'), { scale: 1.5, fill: '#FB7185', transformOrigin: '50% 50%', duration: .7, yoyo: true, repeat: -1 });

    /* wave: raise the arm, wiggle it, lower it, rest, repeat */
    gsap.set(arm, { svgOrigin: '193 184' });
    gsap.timeline({ repeat: -1, repeatDelay: 3.5, delay: 1.5 })
      .to(arm, { rotation: -120, duration: .5, ease: 'power2.out' })
      .to(arm, { rotation: -150, duration: .25, yoyo: true, repeat: 5, ease: 'sine.inOut' })
      .to(arm, { rotation: 0, duration: .5, ease: 'power2.inOut' });

    /* random blinking */
    const blink = () => {
      gsap.to(q('.r-eyes'), { scaleY: .1, transformOrigin: '50% 50%', duration: .08, yoyo: true, repeat: 1 });
      gsap.delayedCall(2 + Math.random() * 3, blink);
    };
    blink();

    /* eyes follow the cursor and the head tilts toward it */
    gsap.set(head, { svgOrigin: '120 154' });
    const lookX = gsap.quickTo(q('.r-look'), 'x', { duration: .4 });
    const lookY = gsap.quickTo(q('.r-look'), 'y', { duration: .4 });
    const tilt = gsap.quickTo(head, 'rotation', { duration: .6 });
    addEventListener('mousemove', e => {
      const r = q('.r-face').getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      const dist = Math.hypot(dx, dy) || 1, k = Math.min(1, dist / 300);
      lookX(dx / dist * 6 * k);
      lookY(dy / dist * 4 * k);
      tilt(Math.max(-6, Math.min(6, dx / 60)));
    }, { passive: true });

    /* speech bubble + a happy bounce when a topic is opened or closed */
    const speak = text => gsap.to(say, { opacity: 0, y: 6, duration: .15, onComplete: () => { say.textContent = text; gsap.to(say, { opacity: 1, y: 0, duration: .3 }); } });
    $$('.faq .ac button').forEach(b => b.addEventListener('click', () => {
      const open = b.parentNode.classList.contains('on');
      speak(open ? `Good pick! Here's how ${b.textContent.trim()} keeps you safe.` : 'Anything else you would like to know?');
      gsap.fromTo(head, { y: 0 }, { y: -12, duration: .15, yoyo: true, repeat: 1 });
    }));
  }

  /* "Threats collide with defenses": pinned, scroll-scrubbed scene.
     Cards fly in from both sides and collide in pairs (flash, shockwave, sparks, screen shake); each threat shatters,
     each defense joins a row at the top, then BLOCKED. slams in letter by letter and the stats count up.
     Without GSAP / on small screens / with reduced motion, the plain static layout is shown instead. */
  function initClash() {
    const sec = $('#clash');
    if (!sec || reduce) return;
    gsap.matchMedia().add('(min-width: 901px)', () => {
      const stage = $('.clash-stage', sec), glow = $('.clash-glow', sec), impact = $('.impact', sec);
      const threats = $$('.cc.threat', sec), shields = $$('.cc.shield', sec);
      const title = $('.clash-title', sec), original = title.textContent;
      sec.classList.add('live');

      /* split the title into letters */
      title.setAttribute('aria-label', original.trim());
      title.innerHTML = [...original.trim()].map(c => `<i class="cx" aria-hidden="true">${c}</i>`).join('');
      const letters = $$('.cx', title);

      /* one effects group per collision, plus a bigger one for the title slam */
      const groups = [...threats, null].map(() => {
        const g = document.createElement('div');
        g.className = 'fx';
        g.innerHTML = '<b class="flash"></b><b class="ring"></b>' + '<i class="sp"></i>'.repeat(16);
        impact.append(g);
        return g;
      });

      gsap.set([...threats, ...shields], { xPercent: -50, yPercent: -50 });
      threats.forEach((t, i) => gsap.set(t, { x: -1400, y: (i - 1.5) * 70, rotation: -30 }));
      shields.forEach((s, i) => gsap.set(s, { x: 1400, y: (i - 1.5) * 70, rotation: 30 }));

      const tl = gsap.timeline({ defaults: { ease: 'none' },
        scrollTrigger: { trigger: sec, start: 'top top', end: '+=3800', pin: true, scrub: .8, anticipatePin: 1, invalidateOnRefresh: true } });

      const shake = at => tl.to(stage, { x: 14, y: -9, duration: .05 }, at).to(stage, { x: -12, y: 8, duration: .05 }, at + .05)
        .to(stage, { x: 7, y: -4, duration: .05 }, at + .1).to(stage, { x: 0, y: 0, duration: .08 }, at + .15);

      /* burst: flash + ring + sparks fly outward; k scales the size.
         Every effect starts AND ends hidden, so nothing is left on screen at the start or when scrolling back up. */
      const burst = (g, at, k = 1) => {
        const flash = $('.flash', g), ring = $('.ring', g);
        tl.fromTo(flash, { opacity: 0, scale: .2 }, { opacity: 1, scale: 3 * k, duration: .06, ease: 'power1.out' }, at)
          .to(flash, { opacity: 0, scale: 14 * k, duration: .45, ease: 'power2.out' }, at + .06)
          .fromTo(ring, { opacity: 0, scale: .3 }, { opacity: 1, scale: 2 * k, duration: .06, ease: 'power1.out' }, at)
          .to(ring, { opacity: 0, scale: 17 * k, duration: .74, ease: 'power2.out' }, at + .06)
          .fromTo(glow, { opacity: 0 }, { opacity: Math.min(1, .9 * k), duration: .06 }, at)
          .to(glow, { opacity: 0, duration: .64, ease: 'power2.out' }, at + .06);
        $$('.sp', g).forEach((sp, n, all) => {
          const a = (n / all.length) * Math.PI * 2 + Math.random() * .4, r = (140 + Math.random() * 200) * k;
          tl.fromTo(sp, { x: 0, y: 0, opacity: 0, scale: 1, rotation: 0 }, { opacity: 1, duration: .02 }, at)
            .to(sp, { x: Math.cos(a) * r, y: Math.sin(a) * r, opacity: 0, scale: .2, rotation: Math.random() * 540 - 270, duration: .68, ease: 'power3.out' }, at + .02);
        });
        shake(at);
      };

      tl.to([$('.clash-kicker', sec), $('.clash-hint', sec)], { opacity: 0, y: -20, duration: .5 }, .45);   /* intro text leaves before the first impact */

      threats.forEach((t, i) => {
        const s = shields[i], a = i * 1.7, hit = a + 1.4;
        tl.to(t, { x: -125, y: 0, rotation: -4, duration: 1, ease: 'power2.out' }, a)
          .to(s, { x: 125, y: 0, rotation: 4, duration: 1, ease: 'power2.out' }, a)
          .to(t, { x: -12, rotation: 0, duration: .35, ease: 'power3.in' }, a + 1.05)      /* charge */
          .to(s, { x: 12, rotation: 0, duration: .35, ease: 'power3.in' }, a + 1.05);
        burst(groups[i], hit);
        tl.to(t, { x: -90, scale: .1, rotation: -150, opacity: 0, filter: 'blur(8px)', duration: .45, ease: 'power2.in' }, hit)   /* threat shatters */
          .fromTo(s, { scale: 1 }, { scale: 1.22, duration: .12, yoyo: true, repeat: 1, ease: 'power1.out' }, hit)
          .to(s, { x: (i - 1.5) * 195, y: -200, scale: .7, rotation: 0, duration: .7, ease: 'power3.inOut' }, hit + .45);   /* defense joins the row */
      });

      /* BLOCKED. slams in */
      const slam = threats.length * 1.7 + .5;
      tl.from(letters, { yPercent: -300, rotation: () => gsap.utils.random(-50, 50), scale: 3, opacity: 0, duration: .8, ease: 'back.out(1.8)', stagger: .07 }, slam);
      burst(groups[threats.length], slam + .75, 1.5);
      tl.from($('.clash-sub', sec), { opacity: 0, y: 30, filter: 'blur(10px)', duration: .6 }, slam + 1.2);

      /* stats pop in and count up */
      $$('.clash-stats > div', sec).forEach((box, i) => {
        const b = $('b', box), end = +b.dataset.count, dec = +b.dataset.dec || 0, o = { v: 0 };
        const put = v => b.textContent = (b.dataset.prefix || '') + v.toFixed(dec) + (b.dataset.suffix || '');
        tl.from(box, { y: 50, opacity: 0, duration: .5 }, slam + 1.5 + i * .15)
          .fromTo(o, { v: 0 }, { v: end, duration: 1, onUpdate: () => put(o.v) }, slam + 1.5 + i * .15);
      });
      tl.to({}, { duration: .8 });   /* hold the finished scene for a moment */

      return () => { sec.classList.remove('live'); title.textContent = original; impact.innerHTML = ''; };   /* undo when the screen gets small */
    });
  }

  /* Interactions that work with or without GSAP */
  function basics() {
    const nav = $('nav'),
      burger = $('.burger'),
      menu = $('.nav-menu');
    addEventListener('scroll', () => nav && nav.classList.toggle('s', scrollY > 30), {
      passive: true
    });
    if (burger) burger.addEventListener('click', () => burger.setAttribute('aria-expanded', menu.classList.toggle('open')));

    $$('.flip').forEach(f => f.addEventListener('click', () => f.classList.toggle('on')));
    $$('[data-more]').forEach(b => b.addEventListener('click', () => {
      const p = b.nextElementSibling,
        show = p.hidden;
      p.hidden = !show;
      b.textContent = show ? 'Show less' : 'Read more';
    }));
    $$('.ac').forEach(a => {
      const b = $('button', a),
        d = $('.bd', a);
      b.addEventListener('click', () => {
        const open = a.classList.toggle('on');
        b.setAttribute('aria-expanded', open);
        if (typeof gsap !== 'undefined') gsap.to(d, {
          height: open ? 'auto' : 0,
          duration: .5,
          ease: 'power3.inOut'
        });
        else d.style.height = open ? 'auto' : '0';
      });
    });
    $$('.mt').forEach(m => m.innerHTML += m.innerHTML); // duplicate for seamless loop
    const events = ['Access granted: j.rivera → Payroll', 'MFA challenge passed: a.chen', 'Blocked sign-in from new device', 'Role updated: Developer → Admin', 'Session revoked: partner-042'];
    const feed = $('.feed span');
    if (feed) feed.textContent = events.concat(events).join('     •     ');

    /* Spotlight, 3D tilt and magnetic buttons need GSAP; skip silently without it */
    if (typeof gsap === 'undefined') return;
    $$('.spot').forEach(c => {
      c.addEventListener('mousemove', e => {
        const r = c.getBoundingClientRect(),
          x = e.clientX - r.left,
          y = e.clientY - r.top;
        c.style.setProperty('--mx', x + 'px');
        c.style.setProperty('--my', y + 'px');
        if (c.dataset.tilt !== undefined) gsap.to(c, {
          rotateY: (x / r.width - .5) * 10,
          rotateX: -(y / r.height - .5) * 10,
          transformPerspective: 800,
          duration: .3
        });
      });
      c.addEventListener('mouseleave', () => gsap.to(c, {
        rotateX: 0,
        rotateY: 0,
        duration: .5
      }));
    });
    const footer = $('footer');
    if (footer) footer.addEventListener('mousemove', e => {
      const r = footer.getBoundingClientRect();
      footer.style.setProperty('--mx', e.clientX - r.left + 'px');
      footer.style.setProperty('--my', e.clientY - r.top + 'px');
    });
    $$('.btn').forEach(b => {
      b.addEventListener('mousemove', e => {
        const r = b.getBoundingClientRect();
        gsap.to(b, {
          x: (e.clientX - r.left - r.width / 2) * .25,
          y: (e.clientY - r.top - r.height / 2) * .35,
          duration: .3
        });
      });
      b.addEventListener('mouseleave', () => gsap.to(b, {
        x: 0,
        y: 0,
        duration: .5,
        ease: 'elastic.out(1,.5)'
      }));
    });
  }
})();